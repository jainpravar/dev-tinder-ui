import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import requestsReducer, { addRequests, removeRequest } from "../../src/store/requestsSlice";

const sampleRequests = [
    { _id: "r1", fromUserId: { firstName: "Alice" } },
    { _id: "r2", fromUserId: { firstName: "Bob" } },
    { _id: "r3", fromUserId: { firstName: "Carol" } },
];

describe("requestsSlice", () => {
    it("has null as the initial state", () => {
        expect(requestsReducer(undefined, { type: "@@INIT" })).toBeNull();
    });

    it("returns the current state for unknown actions", () => {
        const state = [...sampleRequests];
        expect(requestsReducer(state, { type: "unknown/action" })).toBe(state);
    });

    describe("action creators", () => {
        it("addRequests creates an action with the payload", () => {
            expect(addRequests(sampleRequests)).toEqual({
                type: "requests/addRequests",
                payload: sampleRequests,
            });
        });

        it("removeRequest creates an action with the id as payload", () => {
            expect(removeRequest("r1")).toEqual({
                type: "requests/removeRequest",
                payload: "r1",
            });
        });
    });

    describe("addRequests", () => {
        it("replaces null state with the payload", () => {
            expect(requestsReducer(null, addRequests(sampleRequests))).toEqual(sampleRequests);
        });

        it("replaces existing requests with the new payload", () => {
            const next = [{ _id: "r9" }];
            expect(requestsReducer(sampleRequests, addRequests(next))).toEqual(next);
        });

        it("accepts an empty array", () => {
            expect(requestsReducer(sampleRequests, addRequests([]))).toEqual([]);
        });

        it("can reset the state back to null", () => {
            expect(requestsReducer(sampleRequests, addRequests(null))).toBeNull();
        });
    });

    describe("removeRequest", () => {
        it("removes the request with the matching _id", () => {
            const result = requestsReducer(sampleRequests, removeRequest("r2"));
            expect(result).toEqual([sampleRequests[0], sampleRequests[2]]);
        });

        it("does not mutate the previous state", () => {
            const state = [...sampleRequests];
            requestsReducer(state, removeRequest("r1"));
            expect(state).toHaveLength(3);
        });

        it("leaves the list unchanged when no _id matches", () => {
            expect(requestsReducer(sampleRequests, removeRequest("missing"))).toEqual(sampleRequests);
        });

        it("removes every request sharing the same _id", () => {
            const state = [{ _id: "dup" }, { _id: "x" }, { _id: "dup" }];
            expect(requestsReducer(state, removeRequest("dup"))).toEqual([{ _id: "x" }]);
        });

        it("returns an empty array when the last request is removed", () => {
            expect(requestsReducer([{ _id: "only" }], removeRequest("only"))).toEqual([]);
        });

        it("throws when called before requests are loaded (null state)", () => {
            // BUG?: removeRequest does not guard against the initial null state and crashes on state.filter
            expect(() => requestsReducer(null, removeRequest("r1"))).toThrow(TypeError);
        });
    });

    describe("with a real store", () => {
        it("updates the store state through dispatched actions", () => {
            const store = configureStore({ reducer: { requests: requestsReducer } });
            expect(store.getState().requests).toBeNull();

            store.dispatch(addRequests(sampleRequests));
            expect(store.getState().requests).toEqual(sampleRequests);

            store.dispatch(removeRequest("r1"));
            expect(store.getState().requests.map((r) => r._id)).toEqual(["r2", "r3"]);
        });
    });
});
