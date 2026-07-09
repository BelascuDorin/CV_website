import type { ContactData } from "@/data/types";

interface ContactSectionProps {
  data: ContactData;
}

export default function ContactSection({ data }: ContactSectionProps) {
  return (
    <section id="contact" className="bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-20 sm:py-28">
        <SectionHeader label="Contact" title="Get in touch" />

        <p className="mt-4 text-base text-gray-500 max-w-md">
          Open to senior engineering roles. Best way to reach me is by email.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4">
          <a
            href={`mailto:${data.email}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            {data.email}
          </a>

          <a
            href={data.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 text-sm font-semibold hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            LinkedIn ↗
          </a>

          <a
            href={data.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 text-sm font-semibold hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            GitHub ↗
          </a>

          <a
            href={data.cvPdfUrl}
            download
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 text-sm font-semibold hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            Download CV ↓
          </a>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
        {label}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}
