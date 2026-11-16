import { describe, it, expect } from "vitest";
import Store from "../../src/store/appStore";
import { addUser, removeUser } from "../../src/store/userSlice";
import { addFeed, removeFeed } from "../../src/store/feedSlice";
import { addConnections, removeConnection } from "../../src/store/connectionsSlice";
import { addRequests, removeRequest } from "../../src/store/requestsSlice";

describe("appStore", () => {
  it("exposes the standard store API", () => {
    expect(typeof Store.getState).toBe("function");
    expect(typeof Store.dispatch).toBe("function");
    expect(typeof Store.subscribe).toBe("function");
  });

  it("starts with every slice set to null", () => {
    expect(Store.getState()).toEqual({
      user: null,
      feed: null,
      connections: null,
      requests: null,
    });
  });

  it("wires the user reducer", () => {
    Store.dispatch(addUser({ _id: "u1", firstName: "Ann" }));
    expect(Store.getState().user).toEqual({ _id: "u1", firstName: "Ann" });
    Store.dispatch(removeUser());
    expect(Store.getState().user).toBeNull();
  });

  it("wires the feed reducer", () => {
    Store.dispatch(addFeed([{ _id: "f1" }, { _id: "f2" }]));
    Store.dispatch(removeFeed("f1"));
    expect(Store.getState().feed).toEqual([{ _id: "f2" }]);
  });

  it("wires the connections reducer", () => {
    Store.dispatch(addConnections([{ _id: "c1" }, { _id: "c2" }]));
    Store.dispatch(removeConnection("c2"));
    expect(Store.getState().connections).toEqual([{ _id: "c1" }]);
  });

  it("wires the requests reducer", () => {
    Store.dispatch(addRequests([{ _id: "r1" }, { _id: "r2" }]));
    Store.dispatch(removeRequest("r1"));
    expect(Store.getState().requests).toEqual([{ _id: "r2" }]);
  });

  it("only updates the slice that owns the action", () => {
    const before = Store.getState();
    Store.dispatch(addUser({ _id: "u2" }));
    const after = Store.getState();
    expect(after.user).toEqual({ _id: "u2" });
    expect(after.feed).toBe(before.feed);
    expect(after.connections).toBe(before.connections);
    expect(after.requests).toBe(before.requests);
  });

  it("ignores unknown actions", () => {
    const before = Store.getState();
    Store.dispatch({ type: "unknown/action" });
    expect(Store.getState()).toBe(before);
  });

  it("notifies subscribers on dispatch", () => {
    let calls = 0;
    const unsubscribe = Store.subscribe(() => {
      calls += 1;
    });
    Store.dispatch(removeUser());
    unsubscribe();
    Store.dispatch(removeUser());
    expect(calls).toBe(1);
  });
});
