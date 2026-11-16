import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import Feed from "../../src/components/Feed";
import { BASE_URL } from "../../src/utils/constants";
import { renderWithProviders } from "../helpers/renderWithProviders";

vi.mock("axios");

const users = [
  {
    _id: "u1",
    firstName: "Ada",
    lastName: "Lovelace",
    photoUrl: "https://example.com/ada.png",
    age: 28,
    gender: "female",
    about: "Loves engines",
  },
  {
    _id: "u2",
    firstName: "Alan",
    lastName: "Turing",
    photoUrl: "https://example.com/alan.png",
    about: "Breaks codes",
  },
];

describe("Feed", () => {
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("fetches the feed, stores it and shows the first user", async () => {
    axios.get.mockResolvedValue({ data: { data: users } });

    const { store, container } = renderWithProviders(<Feed />);

    expect(container).toBeEmptyDOMElement();
    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.queryByText("Alan Turing")).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(BASE_URL + "/user/feed", {
      withCredentials: true,
    });
    expect(store.getState().feed).toEqual(users);
  });

  it("does not fetch when the feed is already in the store", () => {
    renderWithProviders(<Feed />, { preloadedState: { feed: users } });

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("shows the empty message when the stored feed is empty", () => {
    renderWithProviders(<Feed />, { preloadedState: { feed: [] } });

    expect(screen.getByRole("heading", { name: "No new feed found!" })).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("shows the empty message when the API returns an empty list", async () => {
    axios.get.mockResolvedValue({ data: { data: [] } });

    const { store } = renderWithProviders(<Feed />);

    expect(await screen.findByText("No new feed found!")).toBeInTheDocument();
    expect(store.getState().feed).toEqual([]);
  });

  it("does not update the store when the response has no data", async () => {
    axios.get.mockResolvedValue({ data: {} });

    const { store, container } = renderWithProviders(<Feed />);

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    await Promise.resolve();
    expect(store.getState().feed).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it("logs the error and renders nothing when the request fails", async () => {
    const error = new Error("Network down");
    axios.get.mockRejectedValue(error);

    const { store, container } = renderWithProviders(<Feed />);

    await waitFor(() => expect(logSpy).toHaveBeenCalledWith(error));
    expect(store.getState().feed).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the next user after the current one is rejected", async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValue({ status: 200 });

    const { store } = renderWithProviders(<Feed />, {
      preloadedState: { feed: users },
    });

    await user.click(screen.getByRole("button", { name: "Reject" }));

    expect(await screen.findByText("Alan Turing")).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith(
      BASE_URL + "/request/ignored/u1",
      {},
      { withCredentials: true }
    );
    expect(store.getState().feed).toEqual([users[1]]);
  });
});
