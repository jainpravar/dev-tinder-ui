import { describe, it, expect } from "vitest";
import feedReducer, { addFeed, removeFeed } from "../../src/store/feedSlice";

const feed = [
    { _id: "1", firstName: "Alice" },
    { _id: "2", firstName: "Bob" },
    { _id: "3", firstName: "Carol" },
];

describe("feedSlice", () => {
    it("starts with null state", () => {
        expect(feedReducer(undefined, { type: "@@INIT" })).toBeNull();
    });

    it("creates actions with the right type and payload", () => {
        expect(addFeed(feed)).toEqual({ type: "feed/addFeed", payload: feed });
        expect(removeFeed("1")).toEqual({ type: "feed/removeFeed", payload: "1" });
    });

    it("addFeed replaces the state with the payload", () => {
        expect(feedReducer(null, addFeed(feed))).toEqual(feed);
        const next = [{ _id: "9" }];
        expect(feedReducer(feed, addFeed(next))).toEqual(next);
    });

    it("addFeed with an empty array sets an empty feed", () => {
        expect(feedReducer(feed, addFeed([]))).toEqual([]);
    });

    it("removeFeed removes the user with the matching id", () => {
        const result = feedReducer(feed, removeFeed("2"));
        expect(result).toEqual([
            { _id: "1", firstName: "Alice" },
            { _id: "3", firstName: "Carol" },
        ]);
        expect(feed).toHaveLength(3);
    });

    it("removeFeed leaves the feed unchanged when the id does not exist", () => {
        expect(feedReducer(feed, removeFeed("nope"))).toEqual(feed);
    });

    it("removeFeed on an empty feed returns an empty array", () => {
        expect(feedReducer([], removeFeed("1"))).toEqual([]);
    });

    it("removeFeed throws when the feed has not been loaded", () => {
        // BUG?: removeFeed calls state.filter without guarding against the initial null state, so it throws.
        expect(() => feedReducer(null, removeFeed("1"))).toThrow(TypeError);
    });

    it("ignores unrelated actions", () => {
        expect(feedReducer(feed, { type: "other/action" })).toBe(feed);
    });
});
