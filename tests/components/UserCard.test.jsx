import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import UserCard from "../../src/components/UserCard";
import { BASE_URL } from "../../src/utils/constants";
import { renderWithProviders } from "../helpers/renderWithProviders";

vi.mock("axios");

const user = {
  _id: "u1",
  firstName: "Jane",
  lastName: "Doe",
  photoUrl: "http://img/jane.png",
  age: 25,
  gender: "female",
  about: "Loves coding",
};

const otherUser = { ...user, _id: "u2", firstName: "John" };

const preloadedState = { feed: [user, otherUser] };

describe("UserCard", () => {
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("renders user details and action buttons on the feed", () => {
    renderWithProviders(<UserCard user={user} />, { preloadedState, route: "/" });

    expect(screen.getByRole("heading", { name: "Jane Doe" })).toBeInTheDocument();
    expect(screen.getByText("female, 25")).toBeInTheDocument();
    expect(screen.getByText("Loves coding")).toBeInTheDocument();
    expect(screen.getByAltText("user-photo")).toHaveAttribute("src", user.photoUrl);
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Intrested" })).toBeInTheDocument();
  });

  it("hides age/gender when either is missing", () => {
    renderWithProviders(<UserCard user={{ ...user, age: undefined }} />, {
      preloadedState,
    });
    expect(screen.queryByText(/female/)).not.toBeInTheDocument();
  });

  it("hides age/gender when gender is missing", () => {
    renderWithProviders(<UserCard user={{ ...user, gender: "" }} />, {
      preloadedState,
    });
    expect(screen.queryByText(/25/)).not.toBeInTheDocument();
  });

  it("hides action buttons on the profile page", () => {
    renderWithProviders(<UserCard user={user} />, {
      preloadedState,
      route: "/profile",
    });

    expect(screen.queryByRole("button", { name: "Reject" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Intrested" })).not.toBeInTheDocument();
  });

  it("sends an ignored request and removes the user from the feed", async () => {
    axios.post.mockResolvedValue({ status: 200 });
    const u = userEvent.setup();
    const { store } = renderWithProviders(<UserCard user={user} />, { preloadedState });

    await u.click(screen.getByRole("button", { name: "Reject" }));

    expect(axios.post).toHaveBeenCalledWith(
      `${BASE_URL}/request/ignored/u1`,
      {},
      { withCredentials: true }
    );
    await waitFor(() => expect(store.getState().feed).toEqual([otherUser]));
  });

  it("sends an interested request and removes the user from the feed", async () => {
    axios.post.mockResolvedValue({ status: 200 });
    const u = userEvent.setup();
    const { store } = renderWithProviders(<UserCard user={user} />, { preloadedState });

    await u.click(screen.getByRole("button", { name: "Intrested" }));

    expect(axios.post).toHaveBeenCalledWith(
      `${BASE_URL}/request/interested/u1`,
      {},
      { withCredentials: true }
    );
    await waitFor(() => expect(store.getState().feed).toEqual([otherUser]));
  });

  it("keeps the feed unchanged when the response status is not 200", async () => {
    axios.post.mockResolvedValue({ status: 201 });
    const u = userEvent.setup();
    const { store } = renderWithProviders(<UserCard user={user} />, { preloadedState });

    await u.click(screen.getByRole("button", { name: "Intrested" }));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(store.getState().feed).toEqual([user, otherUser]);
  });

  it("logs the error and keeps the feed when the request fails", async () => {
    const error = new Error("Network error");
    axios.post.mockRejectedValue(error);
    const u = userEvent.setup();
    const { store } = renderWithProviders(<UserCard user={user} />, { preloadedState });

    await u.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(logSpy).toHaveBeenCalledWith(error));
    expect(store.getState().feed).toEqual([user, otherUser]);
  });
});
