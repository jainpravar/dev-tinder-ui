import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../src/components/Body", async () => {
  const { Outlet } = await import("react-router-dom");
  const { useSelector } = await import("react-redux");
  return {
    default: () => {
      const hasStore = useSelector((state) => state !== undefined);
      return (
        <div>
          <span>Body stub</span>
          {hasStore && <span>Store connected</span>}
          <Outlet />
        </div>
      );
    },
  };
});
vi.mock("../src/components/Feed", () => ({ default: () => <div>Feed stub</div> }));
vi.mock("../src/components/Login", () => ({ default: () => <div>Login stub</div> }));
vi.mock("../src/components/Profile", () => ({ default: () => <div>Profile stub</div> }));
vi.mock("../src/components/Connections", () => ({ default: () => <div>Connections stub</div> }));
vi.mock("../src/components/Requests", () => ({ default: () => <div>Requests stub</div> }));
vi.mock("../src/components/Chat", async () => {
  const { useParams } = await import("react-router-dom");
  return {
    default: () => {
      const { targetUserId } = useParams();
      return <div>Chat stub {targetUserId}</div>;
    },
  };
});

import App from "../src/App.jsx";

const renderAt = (path) => {
  window.history.pushState({}, "", path);
  return render(<App />);
};

describe("App", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renders Body with Feed at the root route inside the Redux provider", () => {
    renderAt("/");
    expect(screen.getByText("Body stub")).toBeInTheDocument();
    expect(screen.getByText("Store connected")).toBeInTheDocument();
    expect(screen.getByText("Feed stub")).toBeInTheDocument();
    expect(screen.queryByText("Login stub")).not.toBeInTheDocument();
  });

  it.each([
    ["/login", "Login stub"],
    ["/profile", "Profile stub"],
    ["/connections", "Connections stub"],
    ["/requests", "Requests stub"],
  ])("renders the matching child route for %s", (path, text) => {
    renderAt(path);
    expect(screen.getByText("Body stub")).toBeInTheDocument();
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.queryByText("Feed stub")).not.toBeInTheDocument();
  });

  it("passes the targetUserId param to Chat", () => {
    renderAt("/chat/abc123");
    expect(screen.getByText("Chat stub abc123")).toBeInTheDocument();
  });

  it("renders no child route for an unknown path", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    renderAt("/does-not-exist");
    expect(screen.queryByText("Body stub")).not.toBeInTheDocument();
    expect(screen.queryByText("Feed stub")).not.toBeInTheDocument();
  });
});
