import { redirect } from "react-router-dom";

import { fetchAuthSession, AUTH_ME_QUERY_KEY } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";

const authMeQuery = {
  queryKey: AUTH_ME_QUERY_KEY,
  queryFn: fetchAuthSession,
  staleTime: 30_000,
} as const;

async function getSession() {
  return queryClient.fetchQuery(authMeQuery);
}

/** Protected app area: must be logged in (MFA completed). */
export async function requireAuthLoader() {
  const session = await getSession();
  if (session.mfa_pending) {
    throw redirect("/verify-otp");
  }
  if (!session.user) {
    throw redirect("/login");
  }
  return null;
}

/** Login page: already authenticated → dashboard. */
export async function guestOnlyLoader() {
  const session = await getSession();
  if (session.mfa_pending) {
    throw redirect("/verify-otp");
  }
  if (session.user) {
    throw redirect("/");
  }
  return null;
}

/** OTP page: wrong state → login or home. */
export async function verifyOtpLoader() {
  const session = await getSession();
  if (session.user && !session.mfa_pending) {
    throw redirect("/");
  }
  if (!session.mfa_pending) {
    throw redirect("/login");
  }
  return null;
}
