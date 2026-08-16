import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { getInfoHotel } from "@/lib/queries";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const info = await getInfoHotel(locale);

  return (
    <>
      <Header logoUrl={info.logoUrl} nome={info.nome} />
      <main className="flex-1">{children}</main>
      <Footer logoBiancoUrl={info.logoBiancoUrl} nome={info.nome} />
      <WhatsAppButton telefono={info.telefonoMobile} />
    </>
  );
}
