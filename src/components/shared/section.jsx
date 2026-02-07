import { cn } from "@/lib/utils";

export const Section = ({ children, className }) => {
  return (
    <section className={cn("py-10 md:py-16", className)}>{children}</section>
  );
};
