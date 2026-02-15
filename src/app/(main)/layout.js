import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";

export default function MainLayout({ children }) {
  const wrapperClass = "flex flex-col min-h-screen relative";
  return (
    <div className={wrapperClass}>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
