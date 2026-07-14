import type { ExperienceEntry } from "@/data/types";
import SectionHeader from "@/components/SectionHeader";

interface ExperienceSectionProps {
  data: ExperienceEntry[];
}

export default function ExperienceSection({ data }: ExperienceSectionProps) {
  return (
    <section id="experience" className="bg-white border-t-2 border-slate-200">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8 sm:py-12">
        <SectionHeader label="Experience" title="Professional history" />

        <ol className="mt-10 space-y-10 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
          {data.map((entry) => (
            <li key={`${entry.company}-${entry.startDate}`} className="pl-8 relative">
              {/* Timeline dot */}
              <span className="absolute left-0 top-1.5 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-slate-600 ring-2 ring-white" />

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <div>
                  <p className="font-semibold text-gray-900 text-lg leading-tight">
                    {entry.company}
                  </p>
                  <p className="text-sm font-medium text-slate-600">{entry.title}</p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">
                  {entry.startDate} – {entry.endDate}
                </p>
              </div>

              {/* Impact bullets */}
              <ul className="mt-3 space-y-1.5">
                {entry.bullets.map((bullet, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                    <span className="text-slate-200 shrink-0 mt-0.5">•</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
