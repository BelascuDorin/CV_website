import Image from "next/image";
import type { HeroData, ContactData } from "@/data/types";

interface HeroProps {
  data: HeroData;
  contact: ContactData;
}

export default function Hero({ data, contact }: HeroProps) {
  return (
    <section
      id="hero"
      className="bg-gradient-to-b from-emerald-50 to-white"
    >
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10 sm:gap-14">
          {/* Headshot */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shrink-0 ring-4 ring-emerald-100 shadow-lg">
            <Image
              src={data.headshotSrc}
              alt={`Photo of ${data.name}`}
              fill
              className="object-cover object-top"
              priority
            />
          </div>

          {/* Text */}
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              {data.name}
            </h1>
            <p className="mt-2 text-lg font-semibold text-emerald-600">{data.role}</p>
            <p className="mt-1 text-sm text-gray-500">{data.positioning}</p>
            <p className="mt-5 text-base text-gray-600 leading-relaxed max-w-xl">
              {data.bio}
            </p>

            {/* Contact shortcuts */}
            <div className="mt-7 flex flex-wrap justify-center sm:justify-start gap-3 text-sm font-medium">
              <a
                href={`mailto:${contact.email}`}
                className="px-4 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Email me
              </a>
              <a
                href={contact.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
              >
                LinkedIn
              </a>
              <a
                href={contact.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
              >
                GitHub
              </a>
              <a
                href={contact.cvPdfUrl}
                download
                className="px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
              >
                Download CV
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
