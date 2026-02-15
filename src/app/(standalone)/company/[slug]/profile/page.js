import { getCompanyDetails } from "@/services/company";
import { notFound } from "next/navigation";
import CompanyProfileView from "./company-profile-view";

export const metadata = {
  title: "Company Profile",
  description: "Company profile view",
};

export default async function CompanyProfilePage({ params }) {
  const { slug } = await params;
  let company = null;
  try {
    const data = await getCompanyDetails(slug);
    company = data?.company ?? data;
  } catch {
    notFound();
  }
  if (!company) notFound();
  return <CompanyProfileView company={company} />;
}
