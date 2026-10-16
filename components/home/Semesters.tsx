import Link from "next/link";
import cn from "@/lib/design/twStyles";
import { ordinal, semesters } from "@/lib/design/catalog";

export default function Semesters() {
  return (
    <section className={cn("container semesters")}>
      <div className={cn("section-title")}>
        <h2>Browse by Semester</h2>
      </div>
      <div className={cn("semester-list")}>
        <Link href="/browse" className={cn("active")}>
          All
        </Link>
        {semesters.map((item) => (
          <Link key={item} href={`/browse?course=bsc-nursing&term=${item}`}>
            {ordinal(item)}
          </Link>
        ))}
      </div>
    </section>
  );
}
