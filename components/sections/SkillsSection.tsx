"use client";

import { useState } from "react";
import type { Skill, SkillCategory } from "@/data/types";

interface SkillsSectionProps {
  data: Skill[];
}

const CATEGORY_ORDER: SkillCategory[] = [
  "Languages",
  "Frameworks & Libraries",
  "Tools & Platforms",
  "Practices",
];

export default function SkillsSection({ data }: SkillsSectionProps) {
  const [openSkills, setOpenSkills] = useState<Set<string>>(new Set());

  function toggle(name: string) {
    setOpenSkills((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  const byCategory = CATEGORY_ORDER.reduce<Record<SkillCategory, Skill[]>>(
    (acc, cat) => {
      acc[cat] = data.filter((s) => s.category === cat);
      return acc;
    },
    {} as Record<SkillCategory, Skill[]>
  );

  return (
    <section id="skills" className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-20 sm:py-28">
        <SectionHeader label="Skills" title="What I work with" />

        <div className="mt-10 space-y-10">
          {CATEGORY_ORDER.map((category) => {
            const categorySkills = byCategory[category];
            if (!categorySkills || categorySkills.length === 0) return null;

            return (
              <div key={category}>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                  {category}
                </p>
                <ul className="space-y-1">
                  {categorySkills.map((skill) => {
                    const isOpen = openSkills.has(skill.name);
                    const hasProofs = skill.proofs.length > 0;

                    return (
                      <li key={skill.name} className="rounded-lg overflow-hidden">
                        <button
                          onClick={() => hasProofs && toggle(skill.name)}
                          disabled={!hasProofs}
                          aria-expanded={isOpen}
                          className={`w-full flex items-center justify-between gap-4 px-4 py-3 text-left rounded-lg transition-colors ${
                            hasProofs
                              ? "hover:bg-white cursor-pointer"
                              : "cursor-default"
                          } ${isOpen ? "bg-white shadow-sm" : "bg-transparent"}`}
                        >
                          <span className="font-medium text-gray-900">{skill.name}</span>
                          {hasProofs && (
                            <span
                              className={`text-gray-400 text-xs transition-transform duration-200 shrink-0 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            >
                              ▼
                            </span>
                          )}
                        </button>

                        {/* Proof Cards */}
                        <div
                          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                            isOpen ? "max-h-[600px]" : "max-h-0"
                          }`}
                        >
                          <ul className="bg-white px-4 pb-4 space-y-3 border-t border-gray-50">
                            {skill.proofs.map((proof, i) => (
                              <li
                                key={i}
                                className="pt-3 border-t border-gray-50 first:border-0 first:pt-3"
                              >
                                <p className="text-sm font-medium text-gray-800">
                                  {proof.claim}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">{proof.outcome}</p>
                                <a
                                  href={proof.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                                >
                                  {proof.url} ↗
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
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
