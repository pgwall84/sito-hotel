"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Status = "idle" | "sending" | "success" | "error" | "rate-limited";

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
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 429) {
        setStatus("rate-limited");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      setForm({ nome: "", email: "", telefono: "", messaggio: "", arrivo: "", partenza: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return <p className="text-sm text-primary">{t("formSuccess")}</p>;
  }

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

      {status === "error" && <p className="text-sm text-accent sm:col-span-2">{t("formError")}</p>}
      {status === "rate-limited" && <p className="text-sm text-accent sm:col-span-2">{t("formRateLimited")}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primaryLight disabled:opacity-60 sm:col-span-2"
      >
        {status === "sending" ? t("formSending") : t("formSubmit")}
      </button>
    </form>
  );
}
