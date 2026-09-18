import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/SettingsForm";
export default async function Settings(){const s=await prisma.setting.findUnique({where:{id:"default"}});return <main className="container"><h1>Settings</h1><SettingsForm setting={s}/></main>;}