import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import Requests from "../../src/components/Requests";
import { BASE_URL } from "../../src/utils/constants";
import { renderWithProviders } from "../helpers/renderWithProviders";

vi.mock("axios");

const makeRequest = (id, user = {}) => ({
  _id: id,
  fromUserId: {
    _id: "user-" + id,
    firstName: "First" + id,
    lastName: "Last" + id,
    photoUrl: "http://img/" + id + ".png",
    age: 25,
    gender: "male",
    about: "About " + id,
    ...user,
  },
});

describe("Requests", () => {
  let logSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("fetches received requests on mount and renders them", async () => {
    const data = [makeRequest("r1"), makeRequest("r2")];
    axios.get.mockResolvedValue({ status: 200, data: { data } });

    const { store } = renderWithProviders(<Requests />);

    expect(await screen.findByText("Firstr1 Lastr1")).toBeInTheDocument();
    expect(screen.getByText("Firstr2 Lastr2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Requests" })).toBeInTheDocument();
    expect(screen.getAllByText("25, male")).toHaveLength(2);
    expect(screen.getByText("About r1")).toBeInTheDocument();
    expect(screen.getAllByAltText("photo")[0]).toHaveAttribute(
      "src",
      "http://img/r1.png"
    );
    // BUG?: the endpoint path is spelled "recived" (typo of "received"); works only if the backend uses the same spelling.
    expect(axios.get).toHaveBeenCalledWith(BASE_URL + "/user/request/recived", {
      withCredentials: true,
    });
    expect(store.getState().requests).toEqual(data);
  });

  it("renders nothing while requests are null", () => {
    axios.get.mockReturnValue(new Promise(() => {}));

    const { container } = renderWithProviders(<Requests />);

    expect(container).toBeEmptyDOMElement();
  });

  it("does not store requests when the response status is not 200", async () => {
    axios.get.mockResolvedValue({ status: 204, data: { data: [] } });

    const { store, container } = renderWithProviders(<Requests />);

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await Promise.resolve();
    expect(store.getState().requests).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it("logs the error when fetching requests fails", async () => {
    const error = new Error("network");
    axios.get.mockRejectedValue(error);

    const { store } = renderWithProviders(<Requests />);

    await waitFor(() => expect(logSpy).toHaveBeenCalledWith(error));
    expect(store.getState().requests).toBeNull();
  });

  it("shows an empty message when there are no requests", async () => {
    axios.get.mockResolvedValue({ status: 200, data: { data: [] } });

    renderWithProviders(<Requests />);

    expect(await screen.findByText("No Request found!!")).toBeInTheDocument();
  });

  it("hides the age and gender line when either is missing", async () => {
    const data = [
      makeRequest("r1", { age: undefined }),
      makeRequest("r2", { gender: undefined }),
    ];
    axios.get.mockResolvedValue({ status: 200, data: { data } });

    renderWithProviders(<Requests />);

    expect(await screen.findByText("Firstr1 Lastr1")).toBeInTheDocument();
    expect(screen.queryByText(/, male/)).not.toBeInTheDocument();
    expect(screen.queryByText(/25,/)).not.toBeInTheDocument();
  });

  it("rejects a request and removes it from the store", async () => {
    const user = userEvent.setup();
    const data = [makeRequest("r1"), makeRequest("r2")];
    axios.get.mockResolvedValue({ status: 200, data: { data } });
    axios.post.mockResolvedValue({ status: 200 });

    const { store } = renderWithProviders(<Requests />);
    await screen.findByText("Firstr1 Lastr1");

    await user.click(screen.getAllByRole("button", { name: "Reject" })[0]);

    expect(axios.post).toHaveBeenCalledWith(
      `${BASE_URL}/review/rejected/r1`,
      {},
      { withCredentials: true }
    );
    await waitFor(() =>
      expect(screen.queryByText("Firstr1 Lastr1")).not.toBeInTheDocument()
    );
    expect(store.getState().requests).toEqual([data[1]]);
  });

  it("accepts the last request and shows the empty message", async () => {
    const user = userEvent.setup();
    axios.get.mockResolvedValue({
      status: 200,
      data: { data: [makeRequest("r1")] },
    });
    axios.post.mockResolvedValue({ status: 200 });

    const { store } = renderWithProviders(<Requests />);
    await screen.findByText("Firstr1 Lastr1");

    await user.click(screen.getByRole("button", { name: "Accept" }));

    expect(axios.post).toHaveBeenCalledWith(
      `${BASE_URL}/review/accepted/r1`,
      {},
      { withCredentials: true }
    );
    expect(await screen.findByText("No Request found!!")).toBeInTheDocument();
    expect(store.getState().requests).toEqual([]);
  });

  it("keeps the request when the review response is not 200", async () => {
    const user = userEvent.setup();
    const data = [makeRequest("r1")];
    axios.get.mockResolvedValue({ status: 200, data: { data } });
    axios.post.mockResolvedValue({ status: 400 });

    const { store } = renderWithProviders(<Requests />);
    await screen.findByText("Firstr1 Lastr1");

    await user.click(screen.getByRole("button", { name: "Accept" }));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(screen.getByText("Firstr1 Lastr1")).toBeInTheDocument();
    expect(store.getState().requests).toEqual(data);
  });

  it("logs the error and keeps the request when reviewing fails", async () => {
    const user = userEvent.setup();
    const data = [makeRequest("r1")];
    const error = new Error("review failed");
    axios.get.mockResolvedValue({ status: 200, data: { data } });
    axios.post.mockRejectedValue(error);

    const { store } = renderWithProviders(<Requests />);
    await screen.findByText("Firstr1 Lastr1");

    await user.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(logSpy).toHaveBeenCalledWith(error));
    expect(screen.getByText("Firstr1 Lastr1")).toBeInTheDocument();
    expect(store.getState().requests).toEqual(data);
  });
});
