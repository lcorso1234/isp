"use client";
import { FormEvent, useState } from "react";

const neonGreenBg = "bg-[#39ff14]";
const contactPhotoPath = "/isp.png";
const maxVCardLineLength = 75;

// Contact data. Add/remove as needed.
const contacts = [
  {
    firstName: "Bruce",
    lastName: "Johnson",
    aka: "Rooster",
    company: "ISP Security Inc",
    phone: "+17083054512",
    phoneNumber: "17083054512",
    email: "ispinc@hotmail.com"
  }
  // You can append more contact objects here.
];

export default function HomePage() {
  const contact = contacts[0];
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [showSmsPrompt, setShowSmsPrompt] = useState(false);
  const [smsFirstName, setSmsFirstName] = useState("");
  const [smsEmail, setSmsEmail] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsError, setSmsError] = useState("");

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

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = "";

    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    return btoa(binary);
  };

  const getContactPhoto = async () => {
    const response = await fetch(contactPhotoPath);
    if (!response.ok) {
      throw new Error("Contact photo not found");
    }

    const contentType = response.headers.get("content-type") ?? "";
    const photoType = contentType.includes("jpeg") ? "JPEG" : "PNG";
    const photoBase64 = arrayBufferToBase64(await response.arrayBuffer());
    return { photoBase64, photoType };
  };

  const buildSmsBody = (firstName: string, email: string, phone: string, shareableContactUrl: string) => {
    const userAgent = navigator.userAgent;
    const isSamsung = /SamsungBrowser|SAMSUNG|SM-/i.test(userAgent);
    const lines = [
      "Hi Bruce, here is my contact info:",
      ...(firstName ? [`First name: ${firstName}`] : []),
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Tap to save my contact card: ${shareableContactUrl}`,
      isSamsung
        ? "Thanks for adding me to your network"
        : "Thanks for adding me to your network."
    ];

    return lines.join("\n");
  };

  const handleSaveContact = async () => {
    setIsSavingContact(true);
    try {
      let photoLine = "";
      try {
        const { photoBase64, photoType } = await getContactPhoto();
        photoLine = foldVCardLine(`PHOTO;ENCODING=b;TYPE=${photoType}:${photoBase64}`);
      } catch {
        console.warn(`Skipping contact photo. Add logo at ${contactPhotoPath} to include it in the vCard.`);
      }

      const vcardLines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${contact.lastName};${contact.firstName};;;`,
        `FN:${contact.firstName} ${contact.lastName}`,
        `ORG:${contact.company}`,
        `TITLE:AKA ${contact.aka}`,
        `TEL;TYPE=CELL,VOICE:${contact.phone}`,
        `EMAIL;TYPE=INTERNET,WORK:${contact.email}`,
        "PRODID:-//ISP Security//Field Card//EN",
        "NOTE:Powered by Rooster - Be safe.",
        "END:VCARD"
      ];

      if (photoLine) {
        vcardLines.splice(vcardLines.length - 2, 0, photoLine);
      }

      const vcard = vcardLines.join("\r\n");
      const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${contact.firstName.toLowerCase()}-${contact.lastName.toLowerCase()}-contact.vcf`;
      if (isIOS) {
        link.target = "_blank";
        link.rel = "noopener";
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowSmsPrompt(true);
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleOpenSms = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const firstName = smsFirstName.trim();
    const email = smsEmail.trim();
    const phone = smsPhone.trim();

    if (!email || !phone) {
      setSmsError("Enter your email and phone number before opening SMS.");
      return;
    }

    setSmsError("");
    const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);
    const shareableContactParams = new URLSearchParams({
      name: firstName || "Website Contact",
      email,
      phone
    });
    const shareableContactUrl = `${window.location.origin}/api/share-contact?${shareableContactParams.toString()}`;
    const smsBody = encodeURIComponent(buildSmsBody(firstName, email, phone, shareableContactUrl));
    const separator = isIOS ? "&" : "?";
    const smsUrl = `sms:${contact.phoneNumber}${separator}body=${smsBody}`;

    window.location.href = smsUrl;
  };

  return (
    <>
      <main className="noise-surface flex min-h-screen items-center justify-center bg-[#1e242b] px-4 py-10 text-white">
        <div className="card-3d relative flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-white/15 bg-gradient-to-b from-[#2d363f] via-[#1f262e] to-[#161d24] p-6 text-left shadow-3xl">
          <div className="absolute inset-3 rounded-2xl border border-white/5 pointer-events-none" />
          <header className="relative z-10 flex flex-col items-center gap-1 text-center">
            <h1 className="text-3xl font-semibold text-white">Bruce “Rooster” Johnson</h1>
            <p className="text-sm text-white/70">Company: ISP Security Inc</p>
          </header>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              disabled={isSavingContact}
              className={`relative z-10 flex items-center justify-center rounded-2xl ${neonGreenBg} px-4 py-3 text-base font-semibold uppercase tracking-wide text-[#050608] shadow-[0_15px_30px_rgba(57,255,20,0.35)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white animate-jiggle`}
              onClick={handleSaveContact}
            >
              {isSavingContact ? "Saving..." : "Save Contact"}
            </button>

            {showSmsPrompt ? (
              <section className="relative z-10 rounded-2xl border border-white/15 bg-[#11171d]/85 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.42)]">
                <p className="text-sm text-white/85">
                  Want to text Bruce your contact details? Fill this out and your SMS app will open.
                </p>
                <form className="mt-3 flex flex-col gap-3" onSubmit={handleOpenSms}>
                  <label className="text-xs uppercase tracking-wide text-white/70" htmlFor="sms-first-name">
                    First Name (Optional)
                  </label>
                  <input
                    id="sms-first-name"
                    type="text"
                    autoComplete="given-name"
                    value={smsFirstName}
                    onChange={(event) => setSmsFirstName(event.target.value)}
                    className="rounded-xl border border-white/20 bg-[#0d1318] px-3 py-2 text-sm text-white outline-none transition focus:border-[#39ff14] focus:ring-2 focus:ring-[#39ff14]/35"
                    placeholder="John"
                  />

                  <label className="text-xs uppercase tracking-wide text-white/70" htmlFor="sms-email">
                    Your Email
                  </label>
                  <input
                    id="sms-email"
                    type="email"
                    autoComplete="email"
                    value={smsEmail}
                    onChange={(event) => setSmsEmail(event.target.value)}
                    className="rounded-xl border border-white/20 bg-[#0d1318] px-3 py-2 text-sm text-white outline-none transition focus:border-[#39ff14] focus:ring-2 focus:ring-[#39ff14]/35"
                    placeholder="you@example.com"
                  />

                  <label className="text-xs uppercase tracking-wide text-white/70" htmlFor="sms-phone">
                    Your Phone
                  </label>
                  <input
                    id="sms-phone"
                    type="tel"
                    autoComplete="tel"
                    value={smsPhone}
                    onChange={(event) => setSmsPhone(event.target.value)}
                    className="rounded-xl border border-white/20 bg-[#0d1318] px-3 py-2 text-sm text-white outline-none transition focus:border-[#39ff14] focus:ring-2 focus:ring-[#39ff14]/35"
                    placeholder="(555) 123-4567"
                  />

                  {smsError ? <p className="text-xs text-[#ff8f8f]">{smsError}</p> : null}

                  <div className="mt-1 flex gap-2">
                    <button
                      type="submit"
                      className={`flex-1 rounded-xl ${neonGreenBg} px-3 py-2 text-sm font-semibold text-[#050608] shadow-[0_10px_18px_rgba(57,255,20,0.3)] transition hover:brightness-110`}
                    >
                      Open SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSmsPrompt(false);
                        setSmsError("");
                      }}
                      className="rounded-xl border border-white/20 px-3 py-2 text-sm font-medium text-white/85 transition hover:border-white/40 hover:text-white"
                    >
                      Not now
                    </button>
                  </div>
                </form>
              </section>
            ) : null}
          </div>
        </div>
      </main>
      <footer className="bg-[#1e242b] py-4 text-center text-sm text-white/70">
        <p>Built in America, on earth.</p>
        <p className="mt-1 italic text-white/55">Making relationships built to last, the American Way.</p>
      </footer>
    </>
  );
}
