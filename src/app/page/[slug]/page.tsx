import { InfoPage } from "@/components/InfoPage";

export default async function StaticInfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <InfoPage slug={slug} />;
}
