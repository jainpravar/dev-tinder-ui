import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import axios from "axios";
import Body from "../../src/components/Body";
import { BASE_URL } from "../../src/utils/constants";
import { renderWithProviders } from "../helpers/renderWithProviders";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("axios");
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));
vi.mock("../../src/components/Navbar", () => ({
  default: () => <nav>Navbar</nav>,
}));
vi.mock("../../src/components/Footer", () => ({
  default: () => <footer>Footer</footer>,
}));

const profile = { _id: "u1", firstName: "Pravar" };

const renderBody = (options) =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<Body />}>
        <Route index element={<p>Child page</p>} />
      </Route>
    </Routes>,
    options
  );

describe("Body", () => {
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("renders the navbar, the routed child and the footer", async () => {
    axios.get.mockResolvedValue({ status: 200, data: profile });
    renderBody();

    expect(screen.getByText("Navbar")).toBeInTheDocument();
    expect(screen.getByText("Child page")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  });

  it("fetches the profile and stores the user when none is logged in", async () => {
    axios.get.mockResolvedValue({ status: 200, data: profile });
    const { store } = renderBody();

    await waitFor(() => expect(store.getState().user).toEqual(profile));
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(BASE_URL + "/profile/view", {
      withCredentials: true,
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not fetch the profile when a user is already in the store", async () => {
    const { store } = renderBody({ preloadedState: { user: profile } });

    await Promise.resolve();
    expect(axios.get).not.toHaveBeenCalled();
    expect(store.getState().user).toEqual(profile);
  });

  it("does not store the user when the response status is not 200", async () => {
    axios.get.mockResolvedValue({ status: 204, data: profile });
    const { store } = renderBody();

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await Promise.resolve();
    expect(store.getState().user).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("logs the error and redirects to login on a 400 error", async () => {
    const error = { status: 400, message: "Bad Request" };
    axios.get.mockRejectedValue(error);
    const { store } = renderBody();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
    expect(logSpy).toHaveBeenCalledWith(error);
    expect(store.getState().user).toBeNull();
  });

  it("logs other errors without redirecting", async () => {
    const error = { status: 401, message: "Unauthorized" };
    axios.get.mockRejectedValue(error);
    const { store } = renderBody();

    await waitFor(() => expect(logSpy).toHaveBeenCalledWith(error));
    // BUG?: an unauthenticated user usually gets 401, which is not redirected to /login (only 400 is).
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(store.getState().user).toBeNull();
  });
});
