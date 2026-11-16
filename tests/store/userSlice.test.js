import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import userReducer, { userSlice, addUser, removeUser } from "../../src/store/userSlice";

describe("userSlice", () => {
  const user = { _id: "u1", firstName: "Ada", lastName: "Lovelace", emailId: "ada@example.com" };

  it("has the name 'user'", () => {
    expect(userSlice.name).toBe("user");
  });

  it("returns null as the initial state", () => {
    expect(userReducer(undefined, { type: "@@INIT" })).toBeNull();
  });

  it("ignores unknown actions", () => {
    expect(userReducer(user, { type: "unknown/action" })).toBe(user);
  });

  it("creates actions with the expected types and payloads", () => {
    expect(addUser(user)).toEqual({ type: "user/addUser", payload: user });
    expect(removeUser()).toEqual({ type: "user/removeUser", payload: undefined });
  });

  it("addUser replaces null state with the payload", () => {
    expect(userReducer(null, addUser(user))).toEqual(user);
  });

  it("addUser replaces an existing user entirely", () => {
    const other = { _id: "u2", firstName: "Grace" };
    const next = userReducer(user, addUser(other));
    expect(next).toEqual(other);
    expect(next).not.toHaveProperty("lastName");
  });

  it("addUser accepts an undefined payload", () => {
    // Returning undefined from an Immer reducer keeps the current draft state
    expect(userReducer(user, addUser(undefined))).toEqual(user);
  });

  it("removeUser resets the state to null", () => {
    expect(userReducer(user, removeUser())).toBeNull();
    expect(userReducer(null, removeUser())).toBeNull();
  });

  it("works inside a real store", () => {
    const store = configureStore({ reducer: { user: userReducer } });
    expect(store.getState().user).toBeNull();
    store.dispatch(addUser(user));
    expect(store.getState().user).toEqual(user);
    store.dispatch(removeUser());
    expect(store.getState().user).toBeNull();
  });
});
