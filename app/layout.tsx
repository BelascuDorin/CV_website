import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Navigation from "@/components/Navigation";
import AssistantProvider from "@/components/assistant/AssistantProvider";
import { engagements } from "@/data";
import { listProjects } from "@/data/selectors";
import { isAssistantEnabled } from "@/lib/assistant/config";
import "./globals.css";

/** Lets Assistant citations show Project names and link to their cards. */
const projects = listProjects(engagements).map(({ project }) => ({
  slug: project.slug,
  name: project.name,
}));

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dorin Belascu — Senior Product Engineer",
  description:
    "Full-stack engineer with 9+ years building products at scale and in early-stage startups. Currently open to senior engineering roles where product thinking is as valued as technical depth.",
  openGraph: {
    title: "Dorin Belascu — Senior Product Engineer",
    description:
      "Full-stack engineer with 9+ years building products at scale and in early-stage startups.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} scroll-smooth`}>
      <body className="min-h-screen bg-white text-gray-900 font-sans antialiased">
        <AssistantProvider enabled={isAssistantEnabled()} projects={projects}>
          <Navigation />
          <main>{children}</main>
        </AssistantProvider>
      </body>
    </html>
  );
}
