import { Container, Section } from "@/components/shared";
import Link from "next/link";

const GetInTouch = () => {
  return (
    <Section className="bg-gray-50">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get in touch
            </h2>
            <p className="text-gray-600 mb-6">
              We&apos;re here to help. Contact us for any inquiries about our platform and services.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <p className="text-gray-600">contact@textilenetwork.com</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Phone</p>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>

            <Link
              href="/contact"
              className="inline-block mt-6 px-8 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
            >
              Send Message
            </Link>
          </div>

          {/* Right Side - Contact Form */}
          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  placeholder="Your Company"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows="4"
                  placeholder="Your message..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default GetInTouch;
