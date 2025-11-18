/* eslint-disable react/no-unescaped-entities */
"use client";

const neonGreenText = "text-[#39ff14]";
const neonGreenBg = "bg-[#39ff14]";

const contact = {
  firstName: "Bruce",
  lastName: "Johnson",
  aka: "Rooster",
  company: "ISP Security Inc",
  phone: "708.305.4512",
  phoneHref: "tel:17083054512",
  phoneNumber: "17083054512",
  email: "ispinc@hotmail.com"
};

export default function HomePage() {
  const handleSaveContact = () => {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${contact.lastName};${contact.firstName};;;`,
      `FN:${contact.firstName} ${contact.lastName}`,
      `ORG:${contact.company}`,
      `TITLE:AKA ${contact.aka}`,
      `TEL;TYPE=CELL:${contact.phone}`,
      `EMAIL;TYPE=INTERNET:${contact.email}`,
      "NOTE:Powered by Rooster - Be safe.",
      "END:VCARD"
    ].join("\n");

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "bruce-johnson-contact.vcf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Trigger the native SMS composer with a prefilled meeting request
    const smsBody = encodeURIComponent("Hey Bruce, let's schedule a meeting or a time to talk. Let me know what works for you.");
    const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);
    const separator = isIOS ? "&" : "?";
    const smsUrl = `sms:${contact.phoneNumber}${separator}body=${smsBody}`;
    window.location.href = smsUrl;
  };

  return (
    <>
      <main className="noise-surface flex min-h-screen items-center justify-center bg-[#0f1216] px-4 py-10 text-white">
        <div className="card-3d relative flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-b from-[#1d242b] to-[#101419] p-6 text-left shadow-3xl">
          <div className="absolute inset-3 rounded-2xl border border-white/5 pointer-events-none" />
          <header className="relative z-10 flex flex-col items-center gap-1 text-center">
            <h1 className="text-3xl font-semibold text-white">Bruce “Rooster” Johnson</h1>
            <p className="text-sm text-white/70">Company: ISP Security Inc</p>
          </header>

          <button
            type="button"
            className={`relative z-10 flex items-center justify-center rounded-2xl ${neonGreenBg} px-4 py-3 text-base font-semibold uppercase tracking-wide text-[#050608] shadow-[0_15px_30px_rgba(57,255,20,0.35)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white animate-jiggle`}
            onClick={handleSaveContact}
          >
            Save Contact
          </button>
        </div>
      </main>
      <footer className="bg-[#0f1216] py-4 text-center text-sm text-white/60">
        Field Card Built in America, on Earth.
      </footer>
    </>
  );
}
