import type { ReactNode } from "react";
import { AppShell } from "../../components/layout/AppShell";

export default function LayoutLogado({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
