import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ startAt?: string }>;
}

export default async function FilmDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const startAt = sp?.startAt ? `&startAt=${encodeURIComponent(sp.startAt)}` : "";
  redirect(`/?movie=${encodeURIComponent(id)}${startAt}`);
}
