import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import EditProfile from "../../src/components/EditProfile";
import { BASE_URL } from "../../src/utils/constants";
import { renderWithProviders } from "../helpers/renderWithProviders";

vi.mock("axios");

const userData = {
  _id: "me",
  firstName: "Alice",
  lastName: "Smith",
  gender: "female",
  about: "Loves React",
  photoUrl: "http://img/alice.png",
  age: 25,
};

const renderEditProfile = () =>
  renderWithProviders(<EditProfile />, {
    preloadedState: { user: userData },
    route: "/profile",
  });

describe("EditProfile", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("prefills the form and preview card from the logged-in user", () => {
    renderEditProfile();

    expect(screen.getByRole("heading", { name: "Edit Profile" })).toBeInTheDocument();
    expect(screen.getByLabelText("First Name")).toHaveValue("Alice");
    expect(screen.getByLabelText("Last Name")).toHaveValue("Smith");
    expect(screen.getByLabelText("Photo URl:")).toHaveValue("http://img/alice.png");
    expect(screen.getByLabelText("Age:")).toHaveValue("25");
    expect(screen.getByLabelText("gender")).toHaveValue("female");
    expect(screen.getByLabelText("About:")).toHaveValue("Loves React");

    expect(screen.getByRole("heading", { name: "Alice Smith" })).toBeInTheDocument();
    expect(screen.getByText("female, 25")).toBeInTheDocument();
    expect(screen.getByAltText("user-photo")).toHaveAttribute("src", "http://img/alice.png");
    expect(screen.queryByRole("button", { name: "Reject" })).not.toBeInTheDocument();
    expect(screen.queryByText("Profile updated successfully")).not.toBeInTheDocument();
  });

  it("updates the preview card as the user edits fields", async () => {
    const user = userEvent.setup();
    renderEditProfile();

    const fields = [
      ["First Name", "Bob"],
      ["Last Name", "Jones"],
      ["Photo URl:", "http://img/bob.png"],
      ["Age:", "30"],
      ["gender", "male"],
      ["About:", "Backend dev"],
    ];
    for (const [label, value] of fields) {
      const input = screen.getByLabelText(label);
      await user.clear(input);
      await user.type(input, value);
      expect(input).toHaveValue(value);
    }

    expect(screen.getByRole("heading", { name: "Bob Jones" })).toBeInTheDocument();
    expect(screen.getByText("male, 30")).toBeInTheDocument();
    expect(screen.getByText("Backend dev")).toBeInTheDocument();
    expect(screen.getByAltText("user-photo")).toHaveAttribute("src", "http://img/bob.png");
  });

  it("saves the edited profile and shows a success toast that hides after 3s", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    axios.patch.mockResolvedValue({ status: 200, data: {} });

    renderEditProfile();

    const firstName = screen.getByLabelText("First Name");
    await user.clear(firstName);
    await user.type(firstName, "Bob");
    await user.click(screen.getByRole("button", { name: "Save Profile" }));

    expect(axios.patch).toHaveBeenCalledWith(
      BASE_URL + "/profile/edit",
      {
        firstName: "Bob",
        lastName: "Smith",
        gender: "female",
        about: "Loves React",
        age: 25,
        photoUrl: "http://img/alice.png",
      },
      { withCredentials: true }
    );
    expect(await screen.findByText("Profile updated successfully")).toBeInTheDocument();
    expect(screen.queryByText("Error updating profile")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText("Profile updated successfully")).not.toBeInTheDocument();
  });

  it("shows no toast when the response status is not 200", async () => {
    const user = userEvent.setup();
    axios.patch.mockResolvedValue({ status: 204, data: {} });

    renderEditProfile();
    await user.click(screen.getByRole("button", { name: "Save Profile" }));

    expect(axios.patch).toHaveBeenCalledTimes(1);
    await act(async () => {});
    expect(screen.queryByText("Profile updated successfully")).not.toBeInTheDocument();
    expect(screen.queryByText("Error updating profile")).not.toBeInTheDocument();
  });

  it("shows an error toast, logs the error and hides the toast after 3s on failure", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const error = new Error("Network error");
    axios.patch.mockRejectedValue(error);

    renderEditProfile();
    await user.click(screen.getByRole("button", { name: "Save Profile" }));

    expect(await screen.findByText("Error updating profile")).toBeInTheDocument();
    expect(screen.queryByText("Profile updated successfully")).not.toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith(error);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText("Error updating profile")).not.toBeInTheDocument();
  });
});
