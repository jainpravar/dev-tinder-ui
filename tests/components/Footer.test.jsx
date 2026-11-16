import { describe, it, expect, vi, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import Footer from "../../src/components/Footer";
import { renderWithProviders } from "../helpers/renderWithProviders";

describe("Footer", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a footer landmark with the copyright text for the current year", () => {
    renderWithProviders(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass("footer", "fixed", "bottom-0");

    const year = new Date().getFullYear();
    expect(
      screen.getByText(`Copyright © ${year} - All right reserved`)
    ).toBeInTheDocument();
  });

  it("uses the year from the system clock", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2030-06-15T12:00:00Z"));

    renderWithProviders(<Footer />);

    expect(
      screen.getByText("Copyright © 2030 - All right reserved")
    ).toBeInTheDocument();
  });

  it("renders a navigation area with three social icon links", () => {
    const { container } = renderWithProviders(<Footer />);

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();

    const anchors = nav.querySelectorAll("a");
    expect(anchors).toHaveLength(3);
    anchors.forEach((anchor) => {
      // BUG?: social links have no href or accessible label, so they are not real links for users or screen readers
      expect(anchor).not.toHaveAttribute("href");
      expect(anchor.querySelector("svg")).not.toBeNull();
    });

    // logo + three social icons
    expect(container.querySelectorAll("svg")).toHaveLength(4);
  });
});
