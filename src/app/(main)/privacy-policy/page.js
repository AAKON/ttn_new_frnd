import { getTerms } from "@/services/contact";

export default async function PrivacyPolicyPage() {
  let content = "";
  try {
    const data = await getTerms();
    content = data?.terms_and_conditions || "";
  } catch (e) {}

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-center mb-8">Privacy Policy</h1>
      <div className="max-w-3xl mx-auto bg-white rounded-lg border border-gray-200 p-8">
        <div className="paragraph" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
