import type { NowData } from "@/data/types";
import SectionHeader from "@/components/SectionHeader";

interface NowSectionProps {
  data: NowData;
}

export default function NowSection({ data }: NowSectionProps) {
  return (
    <section id="now" className="bg-slate-100">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8 sm:py-12">
        <SectionHeader label="Now" title="What I'm doing right now" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
          {/* Active Employment */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
              Active employment
            </p>
            <p className="font-semibold text-gray-900">{data.employment.company}</p>
            <p className="text-sm text-gray-600 mt-0.5">{data.employment.role}</p>
            <p className="text-xs text-gray-400 mt-0.5">Since {data.employment.startDate}</p>
            {data.employment.description && (
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {data.employment.description}
              </p>
            )}
          </div>

          {/* Side Projects */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
              Side projects
            </p>
            {data.sideProjects.map((project) => (
              <div key={project.name} className="mb-4 last:mb-0">
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 hover:text-slate-600 transition-colors"
                  >
                    {project.name} ↗
                  </a>
                ) : (
                  <p className="font-semibold text-gray-900">{project.name}</p>
                )}
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                  {project.description}
                </p>
              </div>
            ))}
          </div>

          {/* Self-Development */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
              Self-development
            </p>
            <p className="text-sm text-gray-600 mb-3">{data.selfDevelopment.description}</p>
            <ul className="space-y-1.5">
              {data.selfDevelopment.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-slate-400 shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
