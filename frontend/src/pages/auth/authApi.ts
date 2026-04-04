import { apiFetch } from "../../utils/apiFetch";

export const requestOtp = (email: string, purpose: "signup" | "reset") => {
  return apiFetch("/api/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ email, purpose }),
  });
};

export const verifyOtp = (email: string, otp: string) => {
  return apiFetch("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
};

export const setPassword = (email: string, password: string, purpose: "signup" | "reset") => {
  return apiFetch("/api/auth/set-password", {
    method: "POST",
    body: JSON.stringify({ email, password, purpose }),
  });
};

export const completeSignup = (email: string, username: string, password: string) => {
  return apiFetch("/api/auth/complete-signup", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });
};

