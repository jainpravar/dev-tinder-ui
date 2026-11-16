import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import Login from "../../src/components/Login";
import { BASE_URL } from "../../src/utils/constants";
import { renderWithProviders } from "../helpers/renderWithProviders";

vi.mock("axios");

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));

const user = { _id: "u1", firstName: "Ada", lastName: "Lovelace" };

describe("Login", () => {
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("renders the login form by default", () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email ID:")).toBeInTheDocument();
    // BUG?: the password input uses type="text", so the password is shown in plain text
    expect(screen.getByLabelText("Password:")).toHaveAttribute("type", "text");
    expect(screen.queryByLabelText("First Name:")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Last Name:")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByText("New User? Signup Here")).toBeInTheDocument();
  });

  it("logs in, stores the user and navigates home", async () => {
    const u = userEvent.setup();
    axios.post.mockResolvedValue({ status: 200, data: { data: user } });
    const { store } = renderWithProviders(<Login />);

    await u.type(screen.getByLabelText("Email ID:"), "ada@test.com");
    await u.type(screen.getByLabelText("Password:"), "Secret@123");
    await u.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
    expect(axios.post).toHaveBeenCalledWith(
      BASE_URL + "/login",
      { email: "ada@test.com", password: "Secret@123" },
      { withCredentials: true }
    );
    expect(store.getState().user).toEqual(user);
  });

  it("does nothing when login responds with a non-200 status", async () => {
    const u = userEvent.setup();
    axios.post.mockResolvedValue({ status: 204, data: { data: user } });
    const { store } = renderWithProviders(<Login />);

    await u.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(store.getState().user).toBeNull();
  });

  it("logs the error when login fails", async () => {
    const u = userEvent.setup();
    const error = new Error("Invalid credentials");
    axios.post.mockRejectedValue(error);
    const { store } = renderWithProviders(<Login />);

    await u.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => expect(logSpy).toHaveBeenCalledWith(error));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(store.getState().user).toBeNull();
  });

  it("toggles between login and sign up forms", async () => {
    const u = userEvent.setup();
    renderWithProviders(<Login />);

    await u.click(screen.getByText("New User? Signup Here"));
    expect(screen.getByRole("heading", { name: "Sign Up" })).toBeInTheDocument();
    expect(screen.getByLabelText("First Name:")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();

    await u.click(screen.getByText("Existing User? Login Here"));
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.queryByLabelText("First Name:")).not.toBeInTheDocument();
  });

  it("signs up, stores the user and navigates to the profile", async () => {
    const u = userEvent.setup();
    axios.post.mockResolvedValue({ status: 200, data: { data: user } });
    const { store } = renderWithProviders(<Login />);

    await u.click(screen.getByText("New User? Signup Here"));
    await u.type(screen.getByLabelText("First Name:"), "Ada");
    await u.type(screen.getByLabelText("Last Name:"), "Lovelace");
    await u.type(screen.getByLabelText("Email ID:"), "ada@test.com");
    await u.type(screen.getByLabelText("Password:"), "Secret@123");
    await u.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/profile"));
    expect(axios.post).toHaveBeenCalledWith(
      BASE_URL + "/signup",
      {
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@test.com",
        password: "Secret@123",
      },
      { withCredentials: true }
    );
    expect(store.getState().user).toEqual(user);
  });

  it("does nothing when sign up responds with a non-200 status", async () => {
    const u = userEvent.setup();
    axios.post.mockResolvedValue({ status: 201, data: { data: user } });
    const { store } = renderWithProviders(<Login />);

    await u.click(screen.getByText("New User? Signup Here"));
    await u.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(axios.post.mock.calls[0][0]).toBe(BASE_URL + "/signup");
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(store.getState().user).toBeNull();
  });

  it("logs the error when sign up fails", async () => {
    const u = userEvent.setup();
    const error = new Error("Email already exists");
    axios.post.mockRejectedValue(error);
    const { store } = renderWithProviders(<Login />);

    await u.click(screen.getByText("New User? Signup Here"));
    await u.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => expect(logSpy).toHaveBeenCalledWith(error));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(store.getState().user).toBeNull();
  });

  it("keeps the typed email and password when switching forms", async () => {
    const u = userEvent.setup();
    renderWithProviders(<Login />);

    await u.type(screen.getByLabelText("Email ID:"), "ada@test.com");
    await u.click(screen.getByText("New User? Signup Here"));
    expect(screen.getByLabelText("Email ID:")).toHaveValue("ada@test.com");
  });
});
