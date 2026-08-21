import { ContactForm } from "@/components/contact-form";

export const metadata = { title: "Contact — Keygardens" };

export default function ContactPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Contact us</h1>
        <p className="text-zinc-600">
          Questions, feedback, or an issue with an order? Send us a message.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
