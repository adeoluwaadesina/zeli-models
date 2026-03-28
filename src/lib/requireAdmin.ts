import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/adminAuth";

/** Redirects to login with `next` set when the admin cookie is missing. */
export async function requireAdmin(nextPath: string) {
  const cookieStore = await cookies();
  const authed = cookieStore.get(ADMIN_COOKIE)?.value === "1";
  if (!authed) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }
}
