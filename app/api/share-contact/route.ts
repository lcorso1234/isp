import { NextRequest, NextResponse } from "next/server";

const maxVCardLineLength = 75;

const foldVCardLine = (line: string) => {
  if (line.length <= maxVCardLineLength) {
    return line;
  }

  const chunks: string[] = [];
  for (let i = 0; i < line.length; i += maxVCardLineLength) {
    const chunk = line.slice(i, i + maxVCardLineLength);
    chunks.push(i === 0 ? chunk : ` ${chunk}`);
  }
  return chunks.join("\r\n");
};

const sanitizeValue = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

const splitName = (fullName: string) => {
  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = parts.shift() ?? "";
  const lastName = parts.join(" ");
  return { firstName, lastName };
};

const normalizePhone = (rawPhone: string) => {
  const trimmed = rawPhone.trim();
  const withPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");
  return withPlus ? `+${digitsOnly}` : digitsOnly;
};

const getSafeFileName = (fullName: string) => {
  const baseName = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${baseName || "contact-card"}.vcf`;
};

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fullName = sanitizeValue(searchParams.get("name") ?? "Website Contact");
  const email = sanitizeValue(searchParams.get("email") ?? "");
  const phone = sanitizeValue(searchParams.get("phone") ?? "");

  if (!email || !phone) {
    return NextResponse.json(
      { error: "Missing required fields. Include email and phone in query params." },
      { status: 400 }
    );
  }

  const { firstName, lastName } = splitName(fullName);
  const normalizedPhone = normalizePhone(phone);
  const nowIso = new Date().toISOString();
  const vcardLines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "PRODID:-//ISP Security//Field Card//EN",
    `N:${lastName};${firstName};;;`,
    `FN:${fullName}`,
    foldVCardLine(`TEL;TYPE=CELL,VOICE:${normalizedPhone}`),
    foldVCardLine(`EMAIL;TYPE=INTERNET:${email}`),
    `REV:${nowIso}`,
    "END:VCARD"
  ];
  const vcard = `${vcardLines.join("\r\n")}\r\n`;

  const userAgent = request.headers.get("user-agent") ?? "";
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isSamsung = /SamsungBrowser|SAMSUNG|SM-/i.test(userAgent);
  const fileName = getSafeFileName(fullName);
  const contentType = isSamsung ? "text/x-vcard; charset=utf-8" : "text/vcard; charset=utf-8";
  const contentDisposition = isIOS ? `inline; filename="${fileName}"` : `attachment; filename="${fileName}"`;

  return new NextResponse(vcard, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition,
      "Cache-Control": "no-store"
    }
  });
}
