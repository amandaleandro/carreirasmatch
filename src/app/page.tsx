import { auth } from "@/auth";
import { NicheLandingPage } from "@/components/niche-landing";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return <NicheLandingPage />;
  }

  redirect("/analise");
}
