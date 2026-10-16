"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import cn from "@/lib/design/twStyles";
import { contentTypes, courses, type CourseValue, type TypeValue } from "@/lib/catalog-config";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SelectField from "@/components/ui/SelectField";

export default function Finder() {
  const router = useRouter();
  const [course, setCourse] = useState<CourseValue>("bsc-nursing");
  const [term, setTerm] = useState("1");
  const [type, setType] = useState<TypeValue>("important-questions");

  const current = courses.find((c) => c.value === course) ?? courses[0];

  function changeCourse(value: string) {
    const next = courses.find((c) => c.value === value) ?? courses[0];
    setCourse(next.value);
    // Keep the chosen number if the new course has it (e.g. GNM has only 3 years).
    setTerm((t) => (Number(t) > next.terms ? "1" : t));
  }

  const find = () => router.push(`/browse?course=${course}&term=${term}&type=${type}`);

  return (
    <section className={cn("finder container")} aria-labelledby="finder-title">
      <div className={cn("finder-intro")}>
        <h2 id="finder-title">Find My Notes</h2>
        <p>Get exactly what you need in seconds.</p>
      </div>
      <SelectField label="Course" value={course} onChange={changeCourse}>
        {courses.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </SelectField>
      <SelectField label={current.termLabel} value={term} onChange={setTerm}>
        {Array.from({ length: current.terms }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {current.termLabel} {n}
          </option>
        ))}
      </SelectField>
      <SelectField label="Resource type" value={type} onChange={(v) => setType(v as TypeValue)}>
        {contentTypes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </SelectField>
      <Button onClick={find}>
        Find my notes <Icon name="arrow" size={17} />
      </Button>
    </section>
  );
}
