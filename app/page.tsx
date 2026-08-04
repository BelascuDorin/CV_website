import { hero, now, experience, education, skills, contact } from "@/data";
import Hero from "@/components/sections/Hero";
import NowSection from "@/components/sections/NowSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import EducationSection from "@/components/sections/EducationSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <Hero data={hero} contact={contact} />
      <NowSection data={now} />
      <ExperienceSection data={experience} />
      <EducationSection data={education} />
      <SkillsSection data={skills} />
      <ContactSection data={contact} />
    </>
  );
}
