import { describe, it, expect, vi } from "vitest";
import { screen, act } from "@testing-library/react";
import Profile from "../../src/components/Profile";
import { addUser, removeUser } from "../../src/store/userSlice";
import { renderWithProviders } from "../helpers/renderWithProviders";

vi.mock("axios");

const user = {
  _id: "u1",
  firstName: "Jane",
  lastName: "Doe",
  gender: "female",
  about: "Loves code",
  photoUrl: "https://example.com/jane.png",
  age: 28,
};

describe("Profile", () => {
  it("renders nothing when there is no logged-in user", () => {
    const { container } = renderWithProviders(<Profile />, {
      preloadedState: { user: null },
    });

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText("Edit Profile")).not.toBeInTheDocument();
  });

  it("renders the edit profile form prefilled with the stored user", () => {
    renderWithProviders(<Profile />, { preloadedState: { user } });

    expect(screen.getByRole("heading", { name: "Edit Profile" })).toBeInTheDocument();
    expect(screen.getAllByDisplayValue("Jane")[0]).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Loves code")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Profile" })).toBeInTheDocument();
  });

  it("shows the form once a user is added to the store", () => {
    const { store } = renderWithProviders(<Profile />);
    expect(screen.queryByText("Edit Profile")).not.toBeInTheDocument();

    act(() => {
      store.dispatch(addUser(user));
    });

    expect(screen.getByRole("heading", { name: "Edit Profile" })).toBeInTheDocument();
  });

  it("hides the form when the user is removed from the store", () => {
    const { store, container } = renderWithProviders(<Profile />, {
      preloadedState: { user },
    });
    expect(screen.getByRole("heading", { name: "Edit Profile" })).toBeInTheDocument();

    act(() => {
      store.dispatch(removeUser());
    });

    expect(container).toBeEmptyDOMElement();
  });
});
