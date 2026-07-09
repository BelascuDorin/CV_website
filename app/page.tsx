import { hero, now, experience, skills, contact } from "@/data";
import Hero from "@/components/sections/Hero";
import NowSection from "@/components/sections/NowSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <Hero data={hero} contact={contact} />
      <NowSection data={now} />
      <ExperienceSection data={experience} />
      <SkillsSection data={skills} />
      <ContactSection data={contact} />
    </>
  );
}
