"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ConvenzioneForm({ emailTo }: { emailTo: string }) {
  const t = useTranslations("LavoroPage");
  const [form, setForm] = useState({
    azienda: "",
    referente: "",
    email: "",
    telefono: "",
    dipendenti: "",
    periodo: "anno",
    note: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const periodoLabel = form.periodo === "anno" ? t("formPeriodoAnno") : t("formPeriodoStagionale");
    const subject = encodeURIComponent(`Richiesta convenzione — ${form.azienda}`);
    const body = encodeURIComponent(
      `Azienda: ${form.azienda}\nReferente: ${form.referente}\nEmail: ${form.email}\nTelefono: ${form.telefono}\nDipendenti/mese: ${form.dipendenti}\nPeriodo: ${periodoLabel}\nNote: ${form.note}`
    );
    window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <input
        required
        placeholder={t("formAzienda")}
        value={form.azienda}
        onChange={(e) => setForm({ ...form, azienda: e.target.value })}
        className="rounded-md border border-border bg-background px-4 py-2 text-sm sm:col-span-2"
      />
      <input
        required
        placeholder={t("formReferente")}
        value={form.referente}
        onChange={(e) => setForm({ ...form, referente: e.target.value })}
        className="rounded-md border border-border bg-background px-4 py-2 text-sm"
      />
      <input
        required
        type="email"
        placeholder={t("formEmail")}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="rounded-md border border-border bg-background px-4 py-2 text-sm"
      />
      <input
        type="tel"
        placeholder={t("formTelefono")}
        value={form.telefono}
        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        className="rounded-md border border-border bg-background px-4 py-2 text-sm"
      />
      <input
        type="number"
        min={1}
        placeholder={t("formDipendenti")}
        value={form.dipendenti}
        onChange={(e) => setForm({ ...form, dipendenti: e.target.value })}
        className="rounded-md border border-border bg-background px-4 py-2 text-sm"
      />
      <select
        aria-label={t("formPeriodo")}
        value={form.periodo}
        onChange={(e) => setForm({ ...form, periodo: e.target.value })}
        className="rounded-md border border-border bg-background px-4 py-2 text-sm sm:col-span-2"
      >
        <option value="anno">{t("formPeriodoAnno")}</option>
        <option value="stagionale">{t("formPeriodoStagionale")}</option>
      </select>
      <textarea
        placeholder={t("formNote")}
        value={form.note}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
        rows={3}
        className="rounded-md border border-border bg-background px-4 py-2 text-sm sm:col-span-2"
      />
      <button
        type="submit"
        className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primaryLight sm:col-span-2"
      >
        {t("formSubmit")}
      </button>
    </form>
  );
}
