"use client";

import dynamic from "next/dynamic";
import type { ZeliModel } from "@/data/models";

const AdminClientNoSSR = dynamic(
  () => import("./AdminClient").then((m) => m.AdminClient),
  {
    ssr: false,
    loading: () => <div style={{ padding: "18px 0" }}>Loading admin…</div>
  }
);

export function AdminClientIsland({ initial }: { initial: ZeliModel[] }) {
  return <AdminClientNoSSR initial={initial} />;
}

