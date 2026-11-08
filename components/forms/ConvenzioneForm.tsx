"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { inviaRichiesta, type EsitoRichiesta } from "@/lib/inviaRichiesta";

export default function ConvenzioneForm() {
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

  const [stato, setStato] = useState<"idle" | "sending" | EsitoRichiesta>("idle");
  const tForm = useTranslations("FormRichiesta");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStato("sending");
    const esito = await inviaRichiesta("convenzione", form);
    setStato(esito);
    if (esito === "ok") {
      setForm({ azienda: "", referente: "", email: "", telefono: "", dipendenti: "", periodo: "anno", note: "" });
    }
  };

  if (stato === "ok") {
    return <p className="text-sm text-primary">{tForm("success")}</p>;
  }

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
      {stato === "error" && <p className="text-sm text-accentDeep sm:col-span-2">{tForm("error")}</p>}
      {stato === "rate-limited" && <p className="text-sm text-accentDeep sm:col-span-2">{tForm("rateLimited")}</p>}
      <Button type="submit" variant="primary" disabled={stato === "sending"} className="disabled:opacity-60 sm:col-span-2">
        {stato === "sending" ? tForm("sending") : t("formSubmit")}
      </Button>
    </form>
  );
}
