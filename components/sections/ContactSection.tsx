import type { ContactData } from "@/data/types";
import SectionHeader from "@/components/SectionHeader";

interface ContactSectionProps {
  data: ContactData;
}

export default function ContactSection({ data }: ContactSectionProps) {
  return (
    <section id="contact" className="bg-white">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <SectionHeader label="Contact" title="Get in touch" />

        <p className="mt-4 text-base text-gray-500 max-w-md">
          Open to senior engineering roles. Best way to reach me is by email.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4">
          <a
            href={`mailto:${data.email}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-600 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            {data.email}
          </a>

          <a
            href={data.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 text-sm font-semibold hover:border-slate-300 hover:text-slate-700 transition-colors"
          >
            LinkedIn ↗
          </a>

          <a
            href={data.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 text-sm font-semibold hover:border-slate-300 hover:text-slate-700 transition-colors"
          >
            GitHub ↗
          </a>

          <a
            href={data.cvPdfUrl}
            download
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 text-sm font-semibold hover:border-slate-300 hover:text-slate-700 transition-colors"
          >
            Download CV ↓
          </a>
        </div>
      </div>
    </section>
  );
}
