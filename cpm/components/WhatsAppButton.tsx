"use client";

function cleanMobile(mobile: string) {
  const digits = mobile.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

export default function WhatsAppButton({
  mobile,
  message,
  label = "WhatsApp"
}: {
  mobile: string;
  message: string;
  label?: string;
}) {
  const href = `https://wa.me/${cleanMobile(mobile)}?text=${encodeURIComponent(message)}`;
  return <a className="btn success" href={href} target="_blank" rel="noreferrer">{label}</a>;
}
