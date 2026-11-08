"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { inviaRichiesta, type EsitoRichiesta } from "@/lib/inviaRichiesta";

const CAMPO = "rounded-md border border-border bg-background px-4 py-2 text-sm text-text";

// Sostituisce il vecchio mailto: della degustazione pesto. Il pulsante apre un
// pannello bianco con il form (la sezione sta su sfondo scuro accentDeep).
export default function PestoRichiestaForm() {
  const t = useTranslations("EsperienzePage");
  const tForm = useTranslations("FormRichiesta");
  const [aperto, setAperto] = useState(false);
  const [stato, setStato] = useState<"idle" | "sending" | EsitoRichiesta>("idle");
  const [form, setForm] = useState({ nome: "", email: "", telefono: "", data: "", persone: "", note: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStato("sending");
    const esito = await inviaRichiesta("pesto", form);
    setStato(esito);
    if (esito === "ok") setForm({ nome: "", email: "", telefono: "", data: "", persone: "", note: "" });
  };

  return (
    <div className="mt-6">
      <button
        type="button"
        aria-expanded={aperto}
        onClick={() => setAperto((v) => !v)}
        className="inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-accentDeep transition-colors hover:bg-surface"
      >
        {t("pestoCta")}
      </button>

      {aperto && (
        <div className="mt-4 rounded-lg bg-background p-5 text-text">
          {stato === "ok" ? (
            <p className="text-sm text-primary">{tForm("success")}</p>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder={t("pestoFormNome")}
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className={CAMPO}
              />
              <input
                required
                type="email"
                placeholder={t("pestoFormEmail")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={CAMPO}
              />
              <input
                type="tel"
                placeholder={t("pestoFormTelefono")}
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className={CAMPO}
              />
              <input
                type="date"
                aria-label={t("pestoFormData")}
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className={CAMPO}
              />
              <input
                required
                type="number"
                min={1}
                placeholder={t("pestoFormPersone")}
                value={form.persone}
                onChange={(e) => setForm({ ...form, persone: e.target.value })}
                className={`${CAMPO} sm:col-span-2`}
              />
              <textarea
                placeholder={t("pestoFormNote")}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={3}
                className={`${CAMPO} sm:col-span-2`}
              />
              {stato === "error" && <p className="text-sm text-accentDeep sm:col-span-2">{tForm("error")}</p>}
              {stato === "rate-limited" && (
                <p className="text-sm text-accentDeep sm:col-span-2">{tForm("rateLimited")}</p>
              )}
              <button
                type="submit"
                disabled={stato === "sending"}
                className="rounded-full bg-accentDeep px-7 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60 sm:col-span-2"
              >
                {stato === "sending" ? tForm("sending") : t("pestoFormSubmit")}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
