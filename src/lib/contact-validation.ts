import { isValidEmail, normalizeEmail } from "@/lib/email";

const NAME_PART = /^[\p{L}][\p{L}'’-]*$/u;

export function normalizePersonName(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ");
}

export function isValidFullName(name: string): boolean {
  const parts = name.split(" ");
  return name.length >= 5 && name.length <= 100 && parts.length >= 2 && parts.every((part) => NAME_PART.test(part));
}

export function normalizeBrazilPhone(value: unknown): string {
  if (typeof value !== "string") return "";
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length > 11) digits = digits.slice(2);
  return digits;
}

export function isValidBrazilPhone(phone: string): boolean {
  if (!/^\d{10,11}$/.test(phone)) return false;
  if (/^(\d)\1+$/.test(phone)) return false;
  const ddd = Number(phone.slice(0, 2));
  if (ddd < 11 || ddd > 99 || phone.slice(0, 2).includes("0")) return false;
  return phone.length === 10 ? /^[2-5]/.test(phone[2]) : phone[2] === "9";
}

export function formatBrazilPhone(value: string): string {
  const digits = normalizeBrazilPhone(value).slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  const prefixLength = digits.length === 11 ? 5 : 4;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 2 + prefixLength)}-${digits.slice(2 + prefixLength)}`;
}

export function validateContact(input: { name: unknown; email: unknown; phone: unknown }) {
  const name = normalizePersonName(input.name);
  const email = normalizeEmail(input.email);
  const phone = normalizeBrazilPhone(input.phone);
  const errors: string[] = [];
  if (!isValidFullName(name)) errors.push("Informe seu nome e sobrenome reais.");
  if (!isValidEmail(email)) errors.push("Informe um e-mail válido.");
  if (!isValidBrazilPhone(phone)) errors.push("Informe um telefone brasileiro válido com DDD.");
  return { success: errors.length === 0, data: { name, email, phone }, errors };
}

