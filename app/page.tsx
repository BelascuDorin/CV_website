import {
  contact,
  education,
  engagements,
  hero,
  now,
  presets,
  technologies,
} from "@/data";
import Hero from "@/components/sections/Hero";
import NowSection from "@/components/sections/NowSection";
import WorkSection from "@/components/sections/WorkSection";
import EducationSection from "@/components/sections/EducationSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <Hero data={hero} contact={contact} />
      <NowSection data={now} engagements={engagements} />
      <WorkSection
        engagements={engagements}
        technologies={technologies}
        presets={presets}
      />
      <EducationSection data={education} />
      <ContactSection data={contact} />
    </>
  );
}
