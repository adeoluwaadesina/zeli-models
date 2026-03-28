import * as React from "react";
import { AdminShellClient } from "./AdminShellClient";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShellClient>{children}</AdminShellClient>;
}
