import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userReducer from "../../src/store/userSlice";
import feedReducer from "../../src/store/feedSlice";
import connectionsReducer from "../../src/store/connectionsSlice";
import requestsReducer from "../../src/store/requestsSlice";

export const createTestStore = (preloadedState) =>
  configureStore({
    reducer: {
      user: userReducer,
      feed: feedReducer,
      connections: connectionsReducer,
      requests: requestsReducer,
    },
    preloadedState,
  });

// Renders a component inside a real Redux store and a MemoryRouter.
// Pass `path` (e.g. "/chat/:targetUserId") with `route` to test URL params.
export const renderWithProviders = (
  ui,
  { preloadedState, store = createTestStore(preloadedState), route = "/", path } = {}
) => {
  const element = path ? (
    <Routes>
      <Route path={path} element={ui} />
    </Routes>
  ) : (
    ui
  );

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{element}</MemoryRouter>
      </Provider>
    ),
  };
};
