import { redirect } from "next/navigation";
import { getSessionAdminId } from "@/lib/auth";

export default async function Home() {
  redirect((await getSessionAdminId()) ? "/dashboard" : "/login");
}