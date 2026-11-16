import { describe, it, expect, vi, afterEach } from "vitest";

describe("BASE_URL", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("points to the local backend when running on localhost", async () => {
    vi.resetModules();
    const { BASE_URL } = await import("../../src/utils/constants.js");
    expect(location.hostname).toBe("localhost");
    expect(BASE_URL).toBe("http://localhost:7777");
  });

  it("uses the /api proxy path when not on localhost", async () => {
    vi.stubGlobal("location", { ...window.location, hostname: "devtinder.example.com" });
    vi.resetModules();
    const { BASE_URL } = await import("../../src/utils/constants.js");
    expect(BASE_URL).toBe("/api");
  });

  it("treats 127.0.0.1 as non-localhost and uses /api", async () => {
    vi.stubGlobal("location", { ...window.location, hostname: "127.0.0.1" });
    vi.resetModules();
    const { BASE_URL } = await import("../../src/utils/constants.js");
    expect(BASE_URL).toBe("/api");
  });
});
