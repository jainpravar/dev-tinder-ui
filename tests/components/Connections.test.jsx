import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useParams } from "react-router-dom";
import axios from "axios";
import Connections from "../../src/components/Connections";
import { BASE_URL } from "../../src/utils/constants";
import { renderWithProviders } from "../helpers/renderWithProviders";

vi.mock("axios");

const connectionsData = [
  {
    _id: "u1",
    firstName: "Alice",
    lastName: "Smith",
    photoUrl: "http://img/alice.png",
    age: 25,
    gender: "female",
    about: "Loves React",
  },
  {
    _id: "u2",
    firstName: "Bob",
    lastName: "Jones",
    photoUrl: "http://img/bob.png",
    about: "Backend dev",
  },
];

const ChatTarget = () => {
  const { targetUserId } = useParams();
  return <p>Chat with {targetUserId}</p>;
};

describe("Connections", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("fetches connections on mount and stores them in Redux", async () => {
    axios.get.mockResolvedValue({ status: 200, data: { data: connectionsData } });

    const { store, container } = renderWithProviders(<Connections />);

    expect(container).toBeEmptyDOMElement();
    expect(axios.get).toHaveBeenCalledWith(BASE_URL + "/user/connections", {
      withCredentials: true,
    });

    expect(await screen.findByText("Alice Smith")).toBeInTheDocument();
    expect(store.getState().connections).toEqual(connectionsData);
    expect(screen.getByRole("heading", { name: "Connections" })).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getByText("25, female")).toBeInTheDocument();
    expect(screen.getByText("Loves React")).toBeInTheDocument();
    expect(screen.getByText("Backend dev")).toBeInTheDocument();
    const imgs = screen.getAllByAltText("photo");
    expect(imgs[0]).toHaveAttribute("src", "http://img/alice.png");
    expect(imgs[1]).toHaveAttribute("src", "http://img/bob.png");
    expect(screen.getAllByRole("button", { name: "Chat" })).toHaveLength(2);
  });

  it("does not render age/gender line when either is missing", async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: { data: [{ ...connectionsData[0], gender: undefined }] },
    });

    renderWithProviders(<Connections />);

    expect(await screen.findByText("Alice Smith")).toBeInTheDocument();
    expect(screen.queryByText(/25,/)).not.toBeInTheDocument();
  });

  it("shows the empty message when there are no connections", async () => {
    axios.get.mockResolvedValue({ status: 200, data: { data: [] } });

    renderWithProviders(<Connections />);

    expect(await screen.findByText("No connection found!!")).toBeInTheDocument();
  });

  it("does not dispatch when the response status is not 200", async () => {
    axios.get.mockResolvedValue({ status: 204, data: { data: connectionsData } });

    const { store, container } = renderWithProviders(<Connections />);

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await Promise.resolve();
    expect(store.getState().connections).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it("renders preloaded connections from the store", async () => {
    axios.get.mockResolvedValue({ status: 204, data: {} });

    renderWithProviders(<Connections />, {
      preloadedState: { connections: connectionsData },
    });

    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
  });

  it("logs the error when the request fails", async () => {
    const error = new Error("Network error");
    axios.get.mockRejectedValue(error);

    const { store, container } = renderWithProviders(<Connections />);

    await waitFor(() => expect(console.log).toHaveBeenCalledWith(error));
    expect(store.getState().connections).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it("navigates to the chat page when Chat is clicked", async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValue({ status: 200, data: { data: connectionsData } });

    renderWithProviders(
      <Routes>
        <Route path="/" element={<Connections />} />
        <Route path="/chat/:targetUserId" element={<ChatTarget />} />
      </Routes>
    );

    const buttons = await screen.findAllByRole("button", { name: "Chat" });
    await user.click(buttons[1]);

    expect(await screen.findByText("Chat with u2")).toBeInTheDocument();
  });
});
