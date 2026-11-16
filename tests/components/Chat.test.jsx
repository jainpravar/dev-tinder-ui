import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import Chat from "../../src/components/Chat";
import { BASE_URL } from "../../src/utils/constants";
import { createSocketConnection } from "../../src/utils/socket";
import { renderWithProviders } from "../helpers/renderWithProviders";

vi.mock("axios");
vi.mock("../../src/utils/socket");

const loggedInUser = { _id: "u1", firstName: "Alice", lastName: "Smith" };

let fakeSocket;
let handlers;

const renderChat = (user = loggedInUser, targetUserId = "t1") =>
  renderWithProviders(<Chat />, {
    preloadedState: { user },
    route: "/chat/" + targetUserId,
    path: "/chat/:targetUserId",
  });

describe("Chat", () => {
  beforeEach(() => {
    handlers = {};
    fakeSocket = {
      on: vi.fn((event, handler) => {
        handlers[event] = handler;
      }),
      emit: vi.fn(),
      disconnect: vi.fn(),
    };
    createSocketConnection.mockReturnValue(fakeSocket);
    axios.get.mockResolvedValue({ data: { messages: [] } });
  });

  it("fetches chat history for the target user and renders it", async () => {
    axios.get.mockResolvedValue({
      data: {
        messages: [
          { senderId: { firstName: "Alice", lastName: "Smith" }, text: "Hi Bob" },
          { senderId: { firstName: "Bob", lastName: "Jones" }, text: "Hey Alice" },
          { senderId: null, text: "Orphan message" },
        ],
      },
    });

    const { container } = renderChat();

    expect(await screen.findByText("Hi Bob")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(BASE_URL + "/chat/t1", {
      withCredentials: true,
    });
    expect(screen.getByText("Hey Alice")).toBeInTheDocument();
    expect(screen.getByText("Orphan message")).toBeInTheDocument();
    expect(screen.getByText("Alice Smith", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("undefined undefined", { exact: false })).toBeInTheDocument();

    const bubbles = container.querySelectorAll(".chat");
    expect(bubbles[0]).toHaveClass("chat-end");
    expect(bubbles[1]).toHaveClass("chat-start");
    expect(bubbles[2]).toHaveClass("chat-start");
  });

  it("joins the chat room on mount and disconnects on unmount", async () => {
    const { unmount } = renderChat();

    expect(createSocketConnection).toHaveBeenCalledTimes(1);
    expect(fakeSocket.emit).toHaveBeenCalledWith("joinChat", {
      userId: "u1",
      targetUserId: "t1",
      firstName: "Alice",
    });
    expect(fakeSocket.on).toHaveBeenCalledWith("messageRecived", expect.any(Function));
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    unmount();
    expect(fakeSocket.disconnect).toHaveBeenCalledTimes(1);
  });

  it("appends incoming socket messages", async () => {
    renderChat();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    act(() => {
      handlers.messageRecived({ firstName: "Bob", lastName: "Jones", text: "New msg" });
    });

    expect(screen.getByText("New msg")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones", { exact: false })).toBeInTheDocument();
  });

  it("sends a message through the socket and clears the input", async () => {
    const user = userEvent.setup();
    renderChat();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const input = screen.getByRole("textbox");
    await user.type(input, "Hello there");
    expect(input).toHaveValue("Hello there");

    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(fakeSocket.emit).toHaveBeenCalledWith("sendMessage", {
      firstName: "Alice",
      lastName: "Smith",
      userId: "u1",
      targetUserId: "t1",
      text: "Hello there",
    });
    expect(input).toHaveValue("");
  });

  it("does not open a socket when no user is logged in", async () => {
    renderChat(null);

    expect(screen.getByText("Chat")).toBeInTheDocument();
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith(BASE_URL + "/chat/t1", {
      withCredentials: true,
    }));
    expect(createSocketConnection).not.toHaveBeenCalled();
  });
});
