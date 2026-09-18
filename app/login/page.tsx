import { redirect } from "next/navigation";
import { getSessionAdminId } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await getSessionAdminId()) redirect("/dashboard");
  return <LoginForm />;
}