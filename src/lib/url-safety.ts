import dns from "node:dns/promises";
import net from "node:net";

function isPrivateIp(ip: string): boolean {
  const type = net.isIP(ip);

  if (type === 4) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
    return false;
  }

  if (type === 6) {
    const normalized = ip.toLowerCase();
    if (normalized === "::1") return true;
    if (normalized.startsWith("fe80:")) return true; // link-local
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // unique local
    if (normalized.startsWith("::ffff:")) {
      return isPrivateIp(normalized.slice("::ffff:".length));
    }
    return false;
  }

  return true;
}

export async function assertPublicHttpUrl(rawUrl: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("URL inválida.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Apenas links http/https são permitidos.");
  }

  const hostname =
    parsed.hostname.startsWith("[") && parsed.hostname.endsWith("]")
      ? parsed.hostname.slice(1, -1)
      : parsed.hostname;
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Esse link não é permitido.");
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error("Esse link não é permitido.");
    }
    return;
  }

  let addresses: string[];
  try {
    const records = await dns.lookup(hostname, { all: true });
    addresses = records.map((r) => r.address);
  } catch {
    throw new Error("Não foi possível resolver esse link.");
  }

  if (addresses.length === 0 || addresses.some(isPrivateIp)) {
    throw new Error("Esse link não é permitido.");
  }
}
