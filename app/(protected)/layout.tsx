import { redirect } from "next/navigation";
import { getSessionAdminId } from "@/lib/auth";
import Nav from "@/components/Nav";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!(await getSessionAdminId())) redirect("/login");
  return <><Nav />{children}</>;
}