import { apiFetch } from "../../utils/apiFetch";

export const requestOtp = (email: string, purpose: "signup" | "reset") =>
  apiFetch("/api/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ email, purpose }),
  });
