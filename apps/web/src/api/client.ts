import { ApiClient } from "@mda-chess/api-client";
import { useSessionStore } from "../store/session";

export const apiClient = new ApiClient(import.meta.env.VITE_API_URL ?? "http://localhost:4000", () =>
  useSessionStore.getState().token
);
