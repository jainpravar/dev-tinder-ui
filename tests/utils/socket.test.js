import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { fakeSocket } = vi.hoisted(() => ({
  fakeSocket: { on: () => {}, emit: () => {}, disconnect: () => {} },
}));

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => fakeSocket),
}));

describe("createSocketConnection", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("connects to the localhost BASE_URL when running on localhost", async () => {
    const { io } = await import("socket.io-client");
    const { createSocketConnection } = await import("../../src/utils/socket");

    const socket = createSocketConnection();

    expect(io).toHaveBeenCalledTimes(1);
    expect(io).toHaveBeenCalledWith("http://localhost:7777");
    expect(socket).toBe(fakeSocket);
  });

  it("connects to '/' with the /api/socket.io path when not on localhost", async () => {
    vi.stubGlobal("location", { ...window.location, hostname: "devtinder.example.com" });
    const { io } = await import("socket.io-client");
    const { createSocketConnection } = await import("../../src/utils/socket");

    const socket = createSocketConnection();

    expect(io).toHaveBeenCalledTimes(1);
    expect(io).toHaveBeenCalledWith("/", { path: "/api/socket.io" });
    expect(socket).toBe(fakeSocket);
  });

  it("creates a new connection on every call", async () => {
    const { io } = await import("socket.io-client");
    const { createSocketConnection } = await import("../../src/utils/socket");

    createSocketConnection();
    createSocketConnection();

    expect(io).toHaveBeenCalledTimes(2);
  });
});
