import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import connectionsReducer, { addConnections, removeConnection } from "../../src/store/connectionsSlice";

const conns = [
    { _id: "1", firstName: "Alice" },
    { _id: "2", firstName: "Bob" },
    { _id: "3", firstName: "Carol" },
];

describe("connectionsSlice", () => {
    it("returns null as the initial state", () => {
        expect(connectionsReducer(undefined, { type: "@@INIT" })).toBeNull();
    });

    it("exposes action creators with the right types and payloads", () => {
        expect(addConnections(conns)).toEqual({ type: "connections/addConnections", payload: conns });
        expect(removeConnection("1")).toEqual({ type: "connections/removeConnection", payload: "1" });
    });

    it("addConnections replaces the state with the payload", () => {
        expect(connectionsReducer(null, addConnections(conns))).toEqual(conns);
        expect(connectionsReducer(conns, addConnections([conns[0]]))).toEqual([conns[0]]);
        expect(connectionsReducer(conns, addConnections([]))).toEqual([]);
    });

    it("removeConnection removes the connection with the matching _id", () => {
        const next = connectionsReducer(conns, removeConnection("2"));
        expect(next).toEqual([conns[0], conns[2]]);
        expect(conns).toHaveLength(3);
    });

    it("removeConnection leaves the list unchanged when no _id matches", () => {
        expect(connectionsReducer(conns, removeConnection("999"))).toEqual(conns);
    });

    it("removeConnection on an empty list returns an empty list", () => {
        expect(connectionsReducer([], removeConnection("1"))).toEqual([]);
    });

    it("removeConnection throws when connections have not been loaded yet", () => {
        // BUG?: removeConnection does not guard against the initial null state and crashes on state.filter.
        expect(() => connectionsReducer(null, removeConnection("1"))).toThrow(TypeError);
    });

    it("works inside a real store", () => {
        const store = configureStore({ reducer: { connections: connectionsReducer } });
        store.dispatch(addConnections(conns));
        store.dispatch(removeConnection("1"));
        expect(store.getState().connections).toEqual([conns[1], conns[2]]);
    });
});
