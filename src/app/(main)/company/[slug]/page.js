import { getCompanyDetails } from "@/services/company";
import { notFound } from "next/navigation";
import CompanyDetailClient from "./company-detail-client";

export default async function CompanyDetailPage({ params }) {
  const { slug } = await params;
  let company = null;

  try {
    const data = await getCompanyDetails(slug);
    company = data?.company || data;
  } catch (error) {
    notFound();
  }

  if (!company) {
    notFound();
  }

  return <CompanyDetailClient company={company} />;
}
