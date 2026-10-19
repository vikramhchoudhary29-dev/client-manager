import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: { companyName: "My Business", payeeName: "My Business", upiId: "" }
  });

  const templates = [
    {
      name: "Project Completion",
      content:
        "Hi {{client_name}},\n\nYour {{project_name}} project has been completed successfully.\n\nProject Amount: ₹{{project_total}}\nAmount Received: ₹{{amount_received}}\nRemaining Amount: ₹{{remaining_amount}}\n\n{{payment_section}}\n\nThank you,\n{{company_name}}"
    },
    {
      name: "Yearly Maintenance Reminder",
      content:
        "Hi {{client_name}},\n\nThis is a reminder for the yearly maintenance of your {{project_name}} project.\n\nMaintenance Charge: ₹{{maintenance_charge}}\nProject: {{project_name}}\n\nPlease complete the maintenance payment here:\n{{payment_link}}\n\nThank you,\n{{company_name}}"
    },
    {
      name: "Payment Received",
      content:
        "Hi {{client_name}},\n\nWe have received your payment of ₹{{payment_amount}} for {{project_name}}.\n\nTotal Received: ₹{{amount_received}}\nRemaining Amount: ₹{{remaining_amount}}\n\nThank you,\n{{company_name}}"
    },
    {
      name: "Custom Offer",
      content:
        "Hi {{client_name}},\n\n{{message}}\n\nThank you,\n{{company_name}}"
    }
  ];

  for (const template of templates) {
    const existing = await prisma.marketingTemplate.findFirst({ where: { name: template.name } });
    if (!existing) await prisma.marketingTemplate.create({ data: template });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());