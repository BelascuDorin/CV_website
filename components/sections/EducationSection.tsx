import type { EducationEntry } from "@/data/types";
import SectionHeader from "@/components/SectionHeader";

interface EducationSectionProps {
  data: EducationEntry[];
}

export default function EducationSection({ data }: EducationSectionProps) {
  return (
    <section id="education" className="bg-white border-t-2 border-slate-200">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8 sm:py-12">
        <SectionHeader label="Education" title="Where I studied" />

        <ol className="mt-10 space-y-10 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
          {data.map((entry) => (
            <li key={entry.institution} className="pl-8 relative">
              {/* Timeline dot */}
              <span className="absolute left-0 top-1.5 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-slate-600 ring-2 ring-white" />

              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <div>
                  <p className="font-semibold text-gray-900 text-lg leading-tight">
                    {entry.institution}
                  </p>
                  <p className="text-sm font-medium text-slate-600">{entry.field}</p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">
                  {entry.startYear} – {entry.endYear}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
