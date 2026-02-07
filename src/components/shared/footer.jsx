import Link from "next/link";
import NewsletterForm from "@/components/shared/newsletter-form";

const footerLink = [
  { title: "Company", link: "/company" },
  { title: "Blog", link: "/blog" },
  { title: "About us", link: "/about" },
  { title: "Pricing", link: "/pricing" },
  { title: "Contact Us", link: "/contact" },
  { title: "Partner", link: "/partner" },
  { title: "Privacy", link: "/privacy-policy" },
];

export const Footer = () => {
  return (
    <footer className="footer pt-8 xl:pt-20 md:pt-12 border-t border-t-gray-200">
      <div className="container">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[63.4%_1fr] md:my-12">
          <div className="mt-4 md:mt-0">
            <Link
              href="/"
              className="text-brand-600 font-bold text-xl inline-flex gap-2 items-center"
            >
              Textile Network
            </Link>
            <p className="mt-2 md:mt-7 lg:max-w-[380px]">
              Textile Network is an apparel and textile industry-based business
              listing, b2b sourcing, textile jobs, marketing, and business
              resources platform.
            </p>
            <ul className="flex gap-6 md:gap-[30px] items-center mt-8 md:mt-7 flex-wrap">
              {footerLink.map((item, index) => (
                <li key={index} className="text-[#475467] font-semibold">
                  <Link href={item?.link}>{item?.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 md:mt-0">
            <h4 className="text-xl font-semibold text-gray-900">
              Subscribe to our newsletter
            </h4>
            <p className="pt-1 pb-6">
              Don&apos;t miss our future updates! Get Subscribed Today!
            </p>
            <NewsletterForm />
            <p className="text-sm text-[#475467] pt-[6px] leading-5">
              We care about your data in our{" "}
              <Link href="/privacy-policy" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="mt-3 lg:mt-12 md:mt-5 border-t border-[#eaecf0] py-4 md:py-8 flex flex-col lg:flex-row justify-between gap-4 md:gap-5 items-center">
          <p className="mt-7">
            &copy; {new Date().getFullYear()}. Textile Network. All Rights
            Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
