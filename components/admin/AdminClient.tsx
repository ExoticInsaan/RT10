"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import AuthPanel from "@/components/AuthPanel";
import { slug as toSlug } from "@/lib/design/catalog";
import {
  contentTypes,
  courseLabel,
  courses,
  termText,
  typeLabelOf,
  type CourseValue,
  type TypeValue,
} from "@/lib/catalog-config";

const MAX_FILE_MB = 50;
const BUCKET = "notes";

type Row = {
  id: string;
  slug: string;
  title: string;
  type: TypeValue;
  course: CourseValue | null;
  term: number | null;
  price: number | string;
  pages: number | null;
  description: string | null;
  file_path: string | null;
  sample_path: string | null;
  published: boolean;
  created_at: string;
};

type Form = {
  id: string | null;
  title: string;
  course: CourseValue;
  term: string;
  type: TypeValue;
  price: string;
  pages: string;
  description: string;
  published: boolean;
};

const emptyForm: Form = {
  id: null,
  title: "",
  course: "bsc-nursing",
  term: "1",
  type: "important-questions",
  price: "",
  pages: "",
  description: "",
  published: false,
};

type Notice = { kind: "ok" | "error"; text: string } | null;

const input =
  "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/30";
const label = "mb-1 block text-sm font-semibold text-navy";
const button =
  "rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

function validPdf(file: File | null) {
  if (!file) return null;
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return `"${file.name}" is not a PDF.`;
  if (file.size > MAX_FILE_MB * 1024 * 1024) return `"${file.name}" is larger than ${MAX_FILE_MB} MB.`;
  return null;
}

export default function AdminClient() {
  const { user, ready } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState<Form>(emptyForm);
  const [pdf, setPdf] = useState<File | null>(null);
  const [sample, setSample] = useState<File | null>(null);
  const [removeSample, setRemoveSample] = useState(false);
  const [fileKey, setFileKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const formTop = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const { data, error } = await createClient()
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setNotice({ kind: "error", text: `Could not load resources: ${error.message}` });
      return;
    }
    setRows((data ?? []) as Row[]);
  }, []);

  // Ask the database whether this signed-in person is an admin, then load the list.
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      Promise.resolve().then(() => setIsAdmin(null));
      return;
    }
    createClient()
      .rpc("is_admin")
      .then(({ data }) => {
        const ok = data === true;
        setIsAdmin(ok);
        if (ok) void load();
      });
  }, [ready, user, load]);

  const course = courses.find((c) => c.value === form.course) ?? courses[0];

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function changeCourse(value: CourseValue) {
    const next = courses.find((c) => c.value === value) ?? courses[0];
    setForm((f) => ({ ...f, course: value, term: Number(f.term) > next.terms ? "1" : f.term }));
  }

  function resetForm() {
    setForm(emptyForm);
    setPdf(null);
    setSample(null);
    setRemoveSample(false);
    setFileKey((k) => k + 1);
  }

  function startEdit(row: Row) {
    setForm({
      id: row.id,
      title: row.title,
      course: (row.course ?? "bsc-nursing") as CourseValue,
      term: String(row.term ?? 1),
      type: row.type,
      price: String(row.price),
      pages: row.pages ? String(row.pages) : "",
      description: row.description ?? "",
      published: row.published,
    });
    setPdf(null);
    setSample(null);
    setRemoveSample(false);
    setFileKey((k) => k + 1);
    setNotice(null);
    formTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function checkForm(): string | null {
    if (!form.title.trim()) return "Enter a title.";
    const price = Number(form.price);
    if (!form.price || !Number.isFinite(price) || price <= 0 || price > 99999) {
      return "Enter a price in rupees between 1 and 99999.";
    }
    const term = Number(form.term);
    if (!Number.isInteger(term) || term < 1 || term > course.terms) {
      return `Choose a ${course.termLabel.toLowerCase()} between 1 and ${course.terms}.`;
    }
    if (form.pages && (!/^\d+$/.test(form.pages) || Number(form.pages) < 1)) {
      return "Pages must be a whole number, or leave it empty.";
    }
    if (!form.id && !pdf) return "Choose the PDF to sell.";
    return validPdf(pdf) ?? validPdf(sample);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    const problem = checkForm();
    if (problem) {
      setNotice({ kind: "error", text: problem });
      return;
    }

    const supabase = createClient();
    const storage = supabase.storage.from(BUCKET);
    const editing = form.id !== null;
    const id = form.id ?? crypto.randomUUID();
    const existing = rows.find((r) => r.id === id);
    const pdfPath = `pdf/${id}.pdf`;
    const samplePath = `sample/${id}.pdf`;
    const uploaded: string[] = [];

    setBusy(true);
    try {
      let nextFilePath = existing?.file_path ?? null;
      let nextSamplePath = existing?.sample_path ?? null;

      if (pdf) {
        const { error } = await storage.upload(pdfPath, pdf, {
          contentType: "application/pdf",
          upsert: editing,
        });
        if (error) throw new Error(`PDF upload failed: ${error.message}`);
        if (!editing) uploaded.push(pdfPath);
        nextFilePath = pdfPath;
      }
      if (sample) {
        const { error } = await storage.upload(samplePath, sample, {
          contentType: "application/pdf",
          upsert: true,
        });
        if (error) throw new Error(`Sample upload failed: ${error.message}`);
        if (!editing) uploaded.push(samplePath);
        nextSamplePath = samplePath;
      } else if (removeSample && nextSamplePath) {
        await storage.remove([nextSamplePath]);
        nextSamplePath = null;
      }

      const fields = {
        title: form.title.trim(),
        type: form.type,
        course: form.course,
        term: Number(form.term),
        price: Number(form.price),
        pages: form.pages ? Number(form.pages) : null,
        description: form.description.trim() || null,
        file_path: nextFilePath,
        sample_path: nextSamplePath,
        published: form.published,
      };

      if (editing) {
        const { error } = await supabase.from("products").update(fields).eq("id", id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from("products")
          .insert({ id, slug: `${toSlug(form.title).slice(0, 60)}-${id.slice(0, 6)}`, ...fields });
        if (error) throw new Error(error.message);
      }

      setNotice({
        kind: "ok",
        text: editing
          ? "Saved."
          : form.published
            ? "Added and published. It shows on the site within about a minute."
            : "Added as a draft. Tick Published when you want it on the site.",
      });
      resetForm();
      await load();
    } catch (err) {
      if (uploaded.length) await storage.remove(uploaded);
      setNotice({ kind: "error", text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(row: Row) {
    setNotice(null);
    const { error } = await createClient()
      .from("products")
      .update({ published: !row.published })
      .eq("id", row.id);
    if (error) {
      setNotice({ kind: "error", text: error.message });
      return;
    }
    await load();
  }

  async function remove(row: Row) {
    if (!window.confirm(`Delete "${row.title}"? This also deletes its PDF and cannot be undone.`)) return;
    setNotice(null);
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", row.id);
    if (error) {
      setNotice({
        kind: "error",
        text: error.message.includes("foreign key")
          ? "Someone has already bought this resource, so it cannot be deleted. Unpublish it instead."
          : error.message,
      });
      return;
    }
    const paths = [row.file_path, row.sample_path].filter((p): p is string => Boolean(p));
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    if (form.id === row.id) resetForm();
    await load();
  }

  async function openFile(path: string) {
    const win = window.open("", "_blank");
    const { data, error } = await createClient().storage.from(BUCKET).createSignedUrl(path, 300);
    if (error || !data) {
      win?.close();
      setNotice({ kind: "error", text: error?.message ?? "Could not open the file." });
      return;
    }
    if (win) win.location.href = data.signedUrl;
  }

  // ---- gates ----------------------------------------------------------------
  if (!ready) return <p className="text-muted">Loading…</p>;

  if (!user) {
    return (
      <div className="mx-auto max-w-sm rounded-3xl border border-line bg-white p-6 shadow-sm">
        <p className="mb-4 text-center text-sm text-muted">Sign in with the admin account to continue.</p>
        <AuthPanel next="/admin" />
      </div>
    );
  }

  if (isAdmin === null) return <p className="text-muted">Checking access…</p>;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-line bg-white p-6 text-center">
        <h1 className="text-xl font-bold text-navy">Admin only</h1>
        <p className="mt-2 text-muted">
          This page is only for the Toppershelf admin. You are signed in as {user.email}.
        </p>
      </div>
    );
  }

  // ---- admin page -----------------------------------------------------------
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-navy sm:text-3xl">Admin</h1>
          <p className="mt-1 text-sm text-muted">Add and manage the resources you sell. Signed in as {user.email}.</p>
        </div>
        <p className="text-sm text-muted">{rows.length} resource{rows.length === 1 ? "" : "s"}</p>
      </div>

      <div ref={formTop} className="scroll-mt-24" />
      <form onSubmit={save} className="mt-6 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-navy">{form.id ? "Edit resource" : "Add a resource"}</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label} htmlFor="title">Title</label>
            <input id="title" className={input} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Pharmacology: Important Questions" maxLength={140} />
          </div>

          <div>
            <label className={label} htmlFor="course">Course</label>
            <select id="course" className={input} value={form.course} onChange={(e) => changeCourse(e.target.value as CourseValue)}>
              {courses.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={label} htmlFor="term">{course.termLabel}</label>
            <select id="term" className={input} value={form.term} onChange={(e) => set("term", e.target.value)}>
              {Array.from({ length: course.terms }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{course.termLabel} {n}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={label} htmlFor="type">Type</label>
            <select id="type" className={input} value={form.type} onChange={(e) => set("type", e.target.value as TypeValue)}>
              {contentTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={label} htmlFor="price">Price (₹)</label>
            <input id="price" className={input} inputMode="decimal" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="49" />
          </div>

          <div>
            <label className={label} htmlFor="pages">Pages (optional)</label>
            <input id="pages" className={input} inputMode="numeric" value={form.pages} onChange={(e) => set("pages", e.target.value)} placeholder="24" />
          </div>

          <div className="sm:col-span-2">
            <label className={label} htmlFor="description">Short description (optional)</label>
            <textarea id="description" className={`${input} min-h-24`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What is covered, and who it helps." maxLength={600} />
          </div>

          <div>
            <label className={label} htmlFor="pdf">
              {form.id ? "Replace the PDF (optional)" : "PDF to sell"}
            </label>
            <input key={`pdf-${fileKey}`} id="pdf" type="file" accept="application/pdf,.pdf" className={`${input} file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white`} onChange={(e) => setPdf(e.target.files?.[0] ?? null)} />
            <p className="mt-1 text-xs text-muted">PDF only, up to {MAX_FILE_MB} MB.</p>
          </div>

          <div>
            <label className={label} htmlFor="sample">Free sample PDF (optional)</label>
            <input key={`sample-${fileKey}`} id="sample" type="file" accept="application/pdf,.pdf" className={`${input} file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white`} onChange={(e) => setSample(e.target.files?.[0] ?? null)} />
            <p className="mt-1 text-xs text-muted">
              A few pages anyone can read before buying.
              {form.id && rows.find((r) => r.id === form.id)?.sample_path ? (
                <label className="ml-2 inline-flex items-center gap-1 font-semibold text-navy">
                  <input type="checkbox" checked={removeSample} onChange={(e) => setRemoveSample(e.target.checked)} /> Remove current sample
                </label>
              ) : null}
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-navy sm:col-span-2">
            <input type="checkbox" className="h-4 w-4" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
            Published (visible to students and available to buy)
          </label>
        </div>

        {notice && (
          <p role="status" className={`mt-4 rounded-xl p-3 text-sm ${notice.kind === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
            {notice.text}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className={`${button} bg-navy text-white hover:opacity-90`}>
            {busy ? "Saving…" : form.id ? "Save changes" : "Add resource"}
          </button>
          {form.id && (
            <button type="button" onClick={resetForm} disabled={busy} className={`${button} border border-line bg-white text-navy hover:bg-surface`}>
              Cancel editing
            </button>
          )}
        </div>
      </form>

      <h2 className="mt-10 text-lg font-bold text-navy">All resources</h2>
      {rows.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-line bg-white p-6 text-center text-muted">
          Nothing here yet. Add your first resource above.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-navy">{r.title}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {typeLabelOf(r.type)} · {courseLabel(r.course)} {termText(r.course, r.term) && `· ${termText(r.course, r.term)}`}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    ₹{r.price}
                    {r.pages ? ` · ${r.pages} pages` : ""} · PDF {r.file_path ? "✓" : "missing"} · Sample {r.sample_path ? "✓" : "none"}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.published ? "bg-green-100 text-green-800" : "bg-surface text-muted"}`}>
                  {r.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => startEdit(r)} className={`${button} border border-line bg-white text-navy hover:bg-surface`}>Edit</button>
                <button type="button" onClick={() => togglePublished(r)} className={`${button} border border-line bg-white text-navy hover:bg-surface`}>
                  {r.published ? "Unpublish" : "Publish"}
                </button>
                {r.file_path && (
                  <button type="button" onClick={() => openFile(r.file_path as string)} className={`${button} border border-line bg-white text-navy hover:bg-surface`}>Open PDF</button>
                )}
                <button type="button" onClick={() => remove(r)} className={`${button} border border-red-200 bg-white text-red-700 hover:bg-red-50`}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
