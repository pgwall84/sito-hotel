"use client";

import { useEffect, useRef } from "react";
import * as CookieConsent from "vanilla-cookieconsent";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import { useTranslations, useLocale } from "next-intl";
import { dispatchConsentChanged } from "@/lib/consent";

export default function CookieConsentInit() {
  const t = useTranslations("CookieConsent");
  const locale = useLocale();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const footer = `<a href="/${locale}/privacy-policy">${t("privacyLink")}</a>\n<a href="/${locale}/cookie-policy">${t("cookieLink")}</a>`;

    CookieConsent.run({
      guiOptions: {
        consentModal: { layout: "box", position: "bottom right" },
        preferencesModal: { layout: "box" },
      },
      categories: {
        necessary: { readOnly: true, enabled: true },
        analytics: {},
        functional: {},
      },
      language: {
        default: locale,
        translations: {
          [locale]: {
            consentModal: {
              title: t("title"),
              description: t("description"),
              acceptAllBtn: t("acceptAll"),
              acceptNecessaryBtn: t("reject"),
              showPreferencesBtn: t("managePreferences"),
              footer,
            },
            preferencesModal: {
              title: t("preferencesTitle"),
              acceptAllBtn: t("acceptAll"),
              acceptNecessaryBtn: t("reject"),
              savePreferencesBtn: t("save"),
              sections: [
                {
                  title: t("necessaryTitle"),
                  description: t("necessaryDescription"),
                  linkedCategory: "necessary",
                },
                {
                  title: t("analyticsTitle"),
                  description: t("analyticsDescription"),
                  linkedCategory: "analytics",
                },
                {
                  title: t("functionalTitle"),
                  description: t("functionalDescription"),
                  linkedCategory: "functional",
                },
              ],
            },
          },
        },
      },
      onFirstConsent: () => dispatchConsentChanged(),
      onChange: () => dispatchConsentChanged(),
      onConsent: () => dispatchConsentChanged(),
    });
  }, [locale, t]);

  return null;
}
