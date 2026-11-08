"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { inviaRichiesta, type EsitoRichiesta } from "@/lib/inviaRichiesta";

export default function PrenotazioneTavoloForm() {
  const t = useTranslations("RistorantePage");
  const [form, setForm] = useState({ nome: "", data: "", ora: "", coperti: "", telefono: "" });

  const [stato, setStato] = useState<"idle" | "sending" | EsitoRichiesta>("idle");
  const tForm = useTranslations("FormRichiesta");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStato("sending");
    const esito = await inviaRichiesta("tavolo", form);
    setStato(esito);
    if (esito === "ok") setForm({ nome: "", data: "", ora: "", coperti: "", telefono: "" });
  };

  if (stato === "ok") {
    return <p className="text-sm text-primary">{tForm("success")}</p>;
  }

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
      {stato === "error" && <p className="text-sm text-accentDeep sm:col-span-2">{tForm("error")}</p>}
      {stato === "rate-limited" && <p className="text-sm text-accentDeep sm:col-span-2">{tForm("rateLimited")}</p>}
      <Button type="submit" variant="primary" disabled={stato === "sending"} className="disabled:opacity-60 sm:col-span-2">
        {stato === "sending" ? tForm("sending") : t("formSubmit")}
      </Button>
    </form>
  );
}
