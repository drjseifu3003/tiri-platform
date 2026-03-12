import { redirect } from "next/navigation";

export default function AnniversaryInsightsRedirectPage() {
  redirect("/studio/insights?tab=anniversary");
}
