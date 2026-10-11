import Hero from "@/components/home/Hero";
import Finder from "@/components/home/Finder";
import Semesters from "@/components/home/Semesters";
import Popular from "@/components/home/Popular";

export default function Home() {
  return (
    <>
      <Hero />
      <Finder />
      <Semesters />
      <Popular />

      <section className="mx-auto mt-12 max-w-5xl px-4">
        <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-3">
          {[
            ["Free sample first", "Try the first pages or five questions before you pay."],
            ["Explained answers", "Every question comes with a short explanation."],
            ["Made for phones", "Fast pages that work on mobile data."],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="font-semibold text-slate-900">{t}</h3>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
