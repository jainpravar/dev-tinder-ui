import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import Navbar from "../../src/components/Navbar";
import { BASE_URL } from "../../src/utils/constants";
import { renderWithProviders } from "../helpers/renderWithProviders";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("axios");
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));

const loggedInUser = {
  _id: "u1",
  firstName: "Pat",
  photoUrl: "https://example.com/pat.png",
};

describe("Navbar", () => {
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("shows only the brand link when no user is logged in", () => {
    renderWithProviders(<Navbar />, { preloadedState: { user: null } });

    const brand = screen.getByRole("link", { name: /Dev Tinder/ });
    expect(brand).toHaveAttribute("href", "/");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("shows the avatar and menu links when a user is logged in", () => {
    renderWithProviders(<Navbar />, { preloadedState: { user: loggedInUser } });

    expect(screen.getByRole("img")).toHaveAttribute("src", loggedInUser.photoUrl);
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("link", { name: "Connections" })).toHaveAttribute(
      "href",
      "/connections"
    );
    expect(screen.getByRole("link", { name: "Requests" })).toHaveAttribute("href", "/requests");
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("logs out, clears the user and navigates to /login on a 200 response", async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValue({ status: 200 });
    const { store } = renderWithProviders(<Navbar />, {
      preloadedState: { user: loggedInUser },
    });

    await user.click(screen.getByText("Logout"));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
    expect(axios.post).toHaveBeenCalledWith(
      BASE_URL + "/logout",
      {},
      { withCredentials: true }
    );
    expect(store.getState().user).toBeNull();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("keeps the user and does not navigate when the response is not 200", async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValue({ status: 204 });
    const { store } = renderWithProviders(<Navbar />, {
      preloadedState: { user: loggedInUser },
    });

    await user.click(screen.getByText("Logout"));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(store.getState().user).toEqual(loggedInUser);
  });

  it("logs the error and keeps the user when logout fails", async () => {
    const user = userEvent.setup();
    const error = new Error("Network down");
    axios.post.mockRejectedValue(error);
    const { store } = renderWithProviders(<Navbar />, {
      preloadedState: { user: loggedInUser },
    });

    await user.click(screen.getByText("Logout"));

    await waitFor(() => expect(logSpy).toHaveBeenCalledWith(error));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(store.getState().user).toEqual(loggedInUser);
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });
});
