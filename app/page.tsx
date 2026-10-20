import Hero from "@/components/home/Hero";
import Finder from "@/components/home/Finder";
import Semesters from "@/components/home/Semesters";
import Popular from "@/components/home/Popular";
import Trust from "@/components/home/Trust";
import Faq from "@/components/home/Faq";
import StudyBuddy from "@/components/home/StudyBuddy";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Tells Google the brand name, the logo and that the site has a search box (/browse?q=...).
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: ["TopperShelf", "Topper Shelf"],
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      email: "support@toppershelf.online",
      // Official profiles, so Google links them to the Toppershelf brand.
      sameAs: ["https://www.instagram.com/toppershelf_official"],
      description:
        "Exam-focused study material for B.Sc. Nursing, GNM and Post Basic students: notes, important questions, care plans, case studies, flashcards and assignments.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/browse?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={structuredData} />
      <Hero />
      <Finder />
      <Semesters />
      <Popular />
      <Trust />
      <Faq />
      <StudyBuddy />
    </>
  );
}
