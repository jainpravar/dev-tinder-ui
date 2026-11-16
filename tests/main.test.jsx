import { describe, it, expect, vi, beforeEach } from "vitest";
import { StrictMode } from "react";

const { mockRender, mockCreateRoot } = vi.hoisted(() => {
  const mockRender = vi.fn();
  const mockCreateRoot = vi.fn(() => ({ render: mockRender }));
  return { mockRender, mockCreateRoot };
});

vi.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot,
}));

vi.mock("../src/App.jsx", () => ({
  default: () => <div>Mock App</div>,
}));

describe("main.jsx", () => {
  beforeEach(() => {
    document.body.innerHTML = "<div id=\"root\"></div>";
    vi.resetModules();
  });

  it("creates a root on the #root element and renders App inside StrictMode", async () => {
    const rootEl = document.getElementById("root");

    await import("../src/main.jsx");
    const App = (await import("../src/App.jsx")).default;

    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    expect(mockCreateRoot).toHaveBeenCalledWith(rootEl);
    expect(mockRender).toHaveBeenCalledTimes(1);

    const tree = mockRender.mock.calls[0][0];
    expect(tree.type).toBe(StrictMode);
    expect(tree.props.children.type).toBe(App);
  });

  it("passes null to createRoot when there is no #root element", async () => {
    document.body.innerHTML = "";

    await import("../src/main.jsx");

    expect(mockCreateRoot).toHaveBeenCalledWith(null);
    expect(mockRender).toHaveBeenCalledTimes(1);
  });
});
