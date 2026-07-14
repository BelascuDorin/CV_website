"use client";

import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { id: "hero", label: "Home" },
  { id: "now", label: "Now" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

type SectionId = (typeof NAV_ITEMS)[number]["id"];

export default function Navigation() {
  const [activeSection, setActiveSection] = useState<SectionId>("hero");

  useEffect(() => {
    const elements = NAV_ITEMS.map(({ id }) =>
      document.getElementById(id)
    ).filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    // pointer-events-none on the outer container so the transparent
    // area around the pill doesn't block page clicks
    <nav className="sticky top-4 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-md border border-gray-200/60 overflow-x-auto scrollbar-none">
        {NAV_ITEMS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeSection === id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
