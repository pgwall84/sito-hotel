"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const EMAIL_TO = "info@hoteldelgolfo.com";

export default function PrenotazioneTavoloForm() {
  const t = useTranslations("RistorantePage");
  const [form, setForm] = useState({ nome: "", data: "", ora: "", coperti: "", telefono: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Prenotazione tavolo — ${form.nome}`);
    const body = encodeURIComponent(
      `Nome: ${form.nome}\nData: ${form.data}\nOra: ${form.ora}\nCoperti: ${form.coperti}\nTelefono: ${form.telefono}`
    );
    window.location.href = `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <input
        required
        placeholder={t("formNome")}
        value={form.nome}
        onChange={(e) => setForm({ ...form, nome: e.target.value })}
        className="rounded-md border border-border bg-background px-4 py-2 text-sm sm:col-span-2"
      />
      <input
        required
        type="date"
        aria-label={t("formData")}
        value={form.data}
        onChange={(e) => setForm({ ...form, data: e.target.value })}
        className="rounded-md border border-border bg-background px-4 py-2 text-sm"
      />
      <input
        required
        type="time"
        aria-label={t("formOra")}
        value={form.ora}
        onChange={(e) => setForm({ ...form, ora: e.target.value })}
        className="rounded-md border border-border bg-background px-4 py-2 text-sm"
      />
      <input
        required
        type="number"
        min={1}
        placeholder={t("formCoperti")}
        value={form.coperti}
        onChange={(e) => setForm({ ...form, coperti: e.target.value })}
        className="rounded-md border border-border bg-background px-4 py-2 text-sm"
      />
      <input
        required
        type="tel"
        placeholder={t("formTelefono")}
        value={form.telefono}
        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        className="rounded-md border border-border bg-background px-4 py-2 text-sm"
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
