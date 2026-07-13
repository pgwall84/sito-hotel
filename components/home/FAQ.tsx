import { useTranslations } from "next-intl";
import SectionWrapper from "@/components/layout/SectionWrapper";
import JsonLd from "@/components/seo/JsonLd";

const QUESTIONS = ["q1", "q2", "q3", "q4"] as const;

export default function FAQ() {
  const t = useTranslations("Home.faq");

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: QUESTIONS.map((key) => ({
      "@type": "Question",
      name: t(key),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`a${key.slice(1)}`),
      },
    })),
  };

  return (
    <SectionWrapper bg="surface">
      <h2 className="font-heading text-3xl text-primary">{t("title")}</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {QUESTIONS.map((key) => (
          <div key={key}>
            <h3 className="font-heading text-lg text-primary">{t(key)}</h3>
            <p className="mt-2 text-sm text-textMuted">{t(`a${key.slice(1)}`)}</p>
          </div>
        ))}
      </div>
      <JsonLd data={faqSchema} />
    </SectionWrapper>
  );
}
