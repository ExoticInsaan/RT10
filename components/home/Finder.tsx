"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import cn from "@/lib/design/twStyles";
import { ordinal, resourceTypes, semesters, slug } from "@/lib/design/catalog";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SelectField from "@/components/ui/SelectField";

export default function Finder() {
  const router = useRouter();
  const [course, setCourse] = useState("bsc-nursing");
  const [semester, setSemester] = useState("4");
  const [type, setType] = useState("detailed-notes");

  const find = () => router.push(`/browse?course=${course}&semester=${semester}&type=${type}`);

  return (
    <section className={cn("finder container")} aria-labelledby="finder-title">
      <div className={cn("finder-intro")}>
        <h2 id="finder-title">Find My Notes</h2>
        <p>Get exactly what you need in seconds.</p>
      </div>
      <SelectField label="Course" value={course} onChange={setCourse}>
        <option value="bsc-nursing">B.Sc. Nursing</option>
      </SelectField>
      <SelectField label="Semester" value={semester} onChange={setSemester}>
        {semesters.map((item) => (
          <option key={item} value={item}>
            {ordinal(item)} Semester
          </option>
        ))}
      </SelectField>
      <SelectField label="Resource type" value={type} onChange={setType}>
        {resourceTypes.map((item) => (
          <option key={item} value={slug(item)}>
            {item}
          </option>
        ))}
      </SelectField>
      <Button onClick={find}>
        Find my notes <Icon name="arrow" size={17} />
      </Button>
    </section>
  );
}
