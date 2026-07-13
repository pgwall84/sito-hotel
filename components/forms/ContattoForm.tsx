"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const EMAIL_TO = "info@hoteldelgolfo.com";

export default function ContattoForm() {
  const t = useTranslations("ContattiPage");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefono: "",
    messaggio: "",
    arrivo: "",
    partenza: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Richiesta informazioni — ${form.nome}`);
    const body = encodeURIComponent(
      `Nome: ${form.nome}\nEmail: ${form.email}\nTelefono: ${form.telefono}\nArrivo: ${form.arrivo}\nPartenza: ${form.partenza}\n\n${form.messaggio}`
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
      <div className="grid grid-cols-2 gap-4">
        <input
          type="date"
          aria-label={t("formArrivo")}
          value={form.arrivo}
          onChange={(e) => setForm({ ...form, arrivo: e.target.value })}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="date"
          aria-label={t("formPartenza")}
          value={form.partenza}
          onChange={(e) => setForm({ ...form, partenza: e.target.value })}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <textarea
        required
        placeholder={t("formMessaggio")}
        value={form.messaggio}
        onChange={(e) => setForm({ ...form, messaggio: e.target.value })}
        rows={4}
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
