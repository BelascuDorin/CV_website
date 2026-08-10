import type { Engagement, NowData } from "@/data/types";
import { activeEngagements } from "@/data/selectors";
import SectionHeader from "@/components/SectionHeader";

interface NowSectionProps {
  data: NowData;
  engagements: Engagement[];
}

/**
 * Both lists are derived, so either can legitimately come back empty — between
 * contracts, or with no side project running. Say so rather than leaving a
 * heading over blank space.
 */
function EmptyNote({ children }: { children: string }) {
  return <p className="text-sm text-gray-400 italic">{children}</p>;
}

function EngagementSummary({ engagement }: { engagement: Engagement }) {
  return (
    <div className="mb-5 last:mb-0">
      {engagement.url ? (
        <a
          href={engagement.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gray-900 transition-colors hover:text-slate-600"
        >
          {engagement.company} ↗
        </a>
      ) : (
        <p className="font-semibold text-gray-900">{engagement.company}</p>
      )}
      <p className="mt-0.5 text-sm text-gray-600">{engagement.title}</p>
      <p className="mt-0.5 text-xs text-gray-400">
        Since {engagement.startDate}
      </p>
      <ul className="mt-2 space-y-1">
        {engagement.projects.map((project) => (
          <li key={project.slug} className="flex gap-2 text-sm text-gray-600">
            <span className="shrink-0 text-slate-300">•</span>
            {project.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Employment and side projects are derived from the engagements ending in
 * "Present", so current work is never authored twice. Only self-development is
 * hand-written in `data/now.ts`.
 */
export default function NowSection({ data, engagements }: NowSectionProps) {
  const employment = activeEngagements(engagements, ["Contract", "Employment"]);
  const sideProjects = activeEngagements(engagements, ["Cofounder", "Solo"]);

  return (
    <section id="now" className="scroll-mt-24 bg-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8 sm:py-12">
        <SectionHeader label="Now" title="What I'm doing right now" />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-3 text-xs font-semibold tracking-widest text-slate-500 uppercase">
              Active employment
            </p>
            {employment.length > 0 ? (
              employment.map((engagement) => (
                <EngagementSummary
                  key={engagement.slug}
                  engagement={engagement}
                />
              ))
            ) : (
              <EmptyNote>
                Between contracts — open to senior engineering roles.
              </EmptyNote>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-3 text-xs font-semibold tracking-widest text-slate-500 uppercase">
              Side projects
            </p>
            {sideProjects.length > 0 ? (
              sideProjects.map((engagement) => (
                <EngagementSummary
                  key={engagement.slug}
                  engagement={engagement}
                />
              ))
            ) : (
              <EmptyNote>Nothing running on the side right now.</EmptyNote>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-3 text-xs font-semibold tracking-widest text-slate-500 uppercase">
              Self-development
            </p>
            <p className="mb-3 text-sm text-gray-600">
              {data.selfDevelopment.description}
            </p>
            <ul className="space-y-1.5">
              {data.selfDevelopment.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-gray-700">
                  <span className="shrink-0 text-slate-400">→</span>
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
