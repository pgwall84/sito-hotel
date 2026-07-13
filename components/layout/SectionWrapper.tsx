type Bg = "white" | "surface" | "primary" | "accent";

const BG_CLASS: Record<Bg, string> = {
  white: "bg-background text-text",
  surface: "bg-surface text-text",
  primary: "bg-primary text-white",
  accent: "bg-accent text-white",
};

export default function SectionWrapper({
  children,
  bg = "white",
  className = "",
}: {
  children: React.ReactNode;
  bg?: Bg;
  className?: string;
}) {
  return (
    <section className={`py-section-mobile md:py-section ${BG_CLASS[bg]} ${className}`}>
      <div className="mx-auto max-w-6xl px-4">{children}</div>
    </section>
  );
}
