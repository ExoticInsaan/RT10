"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import AuthPanel from "@/components/AuthPanel";
import { slug as toSlug } from "@/lib/design/catalog";
import FileDropField from "@/components/admin/FileDropField";
import { coverUrlFor } from "@/lib/product-types";
import { MAX_PDF_MB, checkDocumentFiles, documentToPdf } from "@/lib/documents";
import {
  contentTypes,
  courseLabel,
  courses,
  languageLabel,
  languages,
  termText,
  typeLabelOf,
  type CourseValue,
  type LanguageValue,
  type TypeValue,
} from "@/lib/catalog-config";

const MAX_IMAGE_MB = 12; // pictures are shrunk in the browser before upload
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
  language: LanguageValue | null;
  description: string | null;
  file_path: string | null;
  sample_path: string | null;
  cover_path: string | null;
  published: boolean;
  created_at: string;
};

type Form = {
  id: string | null;
  title: string;
  course: CourseValue;
  term: string;
  type: TypeValue;
  pricing: "paid" | "free";
  price: string;
  pages: string;
  language: LanguageValue;
  description: string;
  published: boolean;
};

const emptyForm: Form = {
  id: null,
  title: "",
  course: "bsc-nursing",
  term: "1",
  type: "important-questions",
  pricing: "paid",
  price: "",
  pages: "",
  language: "english",
  description: "",
  published: false,
};

type Notice = { kind: "ok" | "error"; text: string } | null;

const input =
  "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/30";
const label = "mb-1 block text-sm font-semibold text-navy";
const button =
  "rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

function validImage(file: File | null) {
  if (!file) return null;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return `"${file.name}" is not a PNG, JPG or WebP picture.`;
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `"${file.name}" is larger than ${MAX_IMAGE_MB} MB.`;
  return null;
}

// Redraws a picture at most 1280 px wide as a JPEG (white behind see-through areas), so uploads stay small.
async function shrinkImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("could not encode");
  return blob;
}

export default function AdminClient() {
  const { user, ready } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState<Form>(emptyForm);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [sampleFiles, setSampleFiles] = useState<File[]>([]);
  const [cover, setCover] = useState<File | null>(null);
  const [removeSample, setRemoveSample] = useState(false);
  const [fileKey, setFileKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [coverBusy, setCoverBusy] = useState<string | null>(null);
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
    setForm((f) => ({ ...f, course: value, term: Number(f.term) > next.terms ? "" : f.term }));
  }

  function resetForm() {
    setForm(emptyForm);
    setPdfFiles([]);
    setSampleFiles([]);
    setCover(null);
    setRemoveSample(false);
    setFileKey((k) => k + 1);
  }

  function startEdit(row: Row) {
    setForm({
      id: row.id,
      title: row.title,
      course: (row.course ?? "bsc-nursing") as CourseValue,
      term: row.term ? String(row.term) : "",
      type: row.type,
      pricing: Number(row.price) === 0 ? "free" : "paid",
      price: Number(row.price) === 0 ? "" : String(row.price),
      pages: row.pages ? String(row.pages) : "",
      language: row.language ?? "english",
      description: row.description ?? "",
      published: row.published,
    });
    setPdfFiles([]);
    setSampleFiles([]);
    setCover(null);
    setRemoveSample(false);
    setFileKey((k) => k + 1);
    setNotice(null);
    formTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function checkForm(): string | null {
    if (!form.title.trim()) return "Enter a title.";
    if (form.pricing === "paid") {
      const price = Number(form.price);
      if (!form.price || !Number.isFinite(price) || price <= 0 || price > 99999) {
        return "Enter a price in rupees between 1 and 99999, or choose Free.";
      }
    }
    if (form.term !== "") {
      const term = Number(form.term);
      if (!Number.isInteger(term) || term < 1 || term > course.terms) {
        return `Choose a ${course.termLabel.toLowerCase()} between 1 and ${course.terms}, or None.`;
      }
    }
    if (form.pages && (!/^\d+$/.test(form.pages) || Number(form.pages) < 1)) {
      return "Pages must be a whole number, or leave it empty.";
    }
    if (!form.id && pdfFiles.length === 0) return "Choose the PDF or pictures to sell.";
    return checkDocumentFiles(pdfFiles) ?? checkDocumentFiles(sampleFiles, true) ?? validImage(cover);
  }

  // Ask the server to make the cover from page 1 of the PDF. Returns an error message, or null.
  async function makeCover(id: string): Promise<string | null> {
    try {
      const res = await fetch("/api/admin/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      if (res.ok) return null;
      const data = await res.json().catch(() => ({}));
      return data.error ?? `The server answered ${res.status}.`;
    } catch {
      return "Could not reach the server.";
    }
  }

  // Sends the admin's own picture (shrunk first, so a big screenshot still uploads). Returns an error message, or null.
  async function uploadCoverImage(id: string, picture: File): Promise<string | null> {
    try {
      const small = await shrinkImage(picture);
      const body = new FormData();
      body.append("productId", id);
      body.append("image", small, "cover.jpg");
      const res = await fetch("/api/admin/cover-image", { method: "POST", body });
      if (res.ok) return null;
      const data = await res.json().catch(() => ({}));
      return data.error ?? `The server answered ${res.status}.`;
    } catch {
      return "Could not read or send the picture.";
    }
  }

  async function createCover(row: Row) {
    setNotice(null);
    setCoverBusy(row.id);
    const problem = await makeCover(row.id);
    setCoverBusy(null);
    setNotice(
      problem
        ? { kind: "error", text: `Cover not made: ${problem}` }
        : { kind: "ok", text: "Cover made. It shows on the site within about a minute." },
    );
    await load();
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
      // Pictures are joined into one PDF here, because the shop stores and reads everything as PDF.
      let pdf: File | null = null;
      let sample: File | null = null;
      try {
        pdf = pdfFiles.length ? await documentToPdf(pdfFiles) : null;
        sample = sampleFiles.length ? await documentToPdf(sampleFiles) : null;
      } catch {
        throw new Error("Could not turn the pictures into a PDF. Try different pictures.");
      }
      for (const made of [pdf, sample]) {
        if (made && made.size > MAX_PDF_MB * 1024 * 1024) {
          throw new Error(`The PDF made from your pictures is ${(made.size / 1024 / 1024).toFixed(1)} MB, more than the ${MAX_PDF_MB} MB limit. Use fewer or smaller pictures.`);
        }
      }

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
        term: form.term === "" ? null : Number(form.term),
        price: form.pricing === "free" ? 0 : Number(form.price),
        pages: form.pages ? Number(form.pages) : null,
        language: form.language,
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

      const saved = editing
        ? "Saved."
        : form.published
          ? "Added and published. It shows on the site within about a minute."
          : "Added as a draft. Tick Published when you want it on the site.";
      // A picture the admin pasted or dropped is the cover; otherwise it is made from the PDF's first page.
      const coverProblem = cover ? await uploadCoverImage(id, cover) : pdf ? await makeCover(id) : null;
      const coverMade = cover ? "Your picture is now the cover." : "The cover was made from the first page.";
      setNotice(
        coverProblem
          ? { kind: "error", text: `${saved} But the cover could not be made (${coverProblem}). Use "Create cover" in the list, or add the picture again by editing.` }
          : { kind: "ok", text: cover || pdf ? `${saved} ${coverMade}` : saved },
      );
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
    if (row.cover_path) await supabase.storage.from("covers").remove([row.cover_path]);
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
              <option value="">None</option>
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
            <label className={label} htmlFor="pricing">Free or Paid</label>
            <select id="pricing" className={input} value={form.pricing} onChange={(e) => set("pricing", e.target.value as "paid" | "free")}>
              <option value="paid">Paid</option>
              <option value="free">Free</option>
            </select>
          </div>

          {form.pricing === "paid" && (
            <div>
              <label className={label} htmlFor="price">Price (₹)</label>
              <input id="price" className={input} inputMode="decimal" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="49" />
            </div>
          )}

          <div>
            <label className={label} htmlFor="pages">Pages (optional)</label>
            <input id="pages" className={input} inputMode="numeric" value={form.pages} onChange={(e) => set("pages", e.target.value)} placeholder="24" />
          </div>

          <div>
            <label className={label} htmlFor="language">Language</label>
            <select id="language" className={input} value={form.language} onChange={(e) => set("language", e.target.value as LanguageValue)}>
              {languages.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={label} htmlFor="description">Short description (optional)</label>
            <textarea id="description" className={`${input} min-h-24`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What is covered, and who it helps." maxLength={600} />
          </div>

          <div>
            <label className={label} htmlFor="pdf">
              {form.id ? "Replace the main file (optional)" : "Main file to sell (PDF or pictures)"}
            </label>
            <FileDropField key={`pdf-${fileKey}`} id="pdf" kind="document" files={pdfFiles} onFiles={setPdfFiles} disabled={busy} />
            <p className="mt-1 text-xs text-muted">One PDF (up to {MAX_PDF_MB} MB), or one or more pictures (PNG, JPG, WebP) that are joined into a PDF, one picture per page. Choose, drag in, or paste.</p>
          </div>

          <div>
            <label className={label} htmlFor="sample">Preview pictures (optional)</label>
            <FileDropField key={`sample-${fileKey}`} id="sample" kind="pictures" files={sampleFiles} onFiles={setSampleFiles} disabled={busy} />
            <p className="mt-1 text-xs text-muted">
              Pictures only (PNG, JPG, WebP, up to 12 MB each). They show as swipeable preview slides on the product page, in the order listed. Adding new ones replaces the current previews.
              {form.id && rows.find((r) => r.id === form.id)?.sample_path ? (
                <label className="ml-2 inline-flex items-center gap-1 font-semibold text-navy">
                  <input type="checkbox" checked={removeSample} onChange={(e) => setRemoveSample(e.target.checked)} /> Remove current previews
                </label>
              ) : null}
            </p>
          </div>

          <div>
            <label className={label} htmlFor="cover">Cover picture (optional)</label>
            <FileDropField key={`cover-${fileKey}`} id="cover" kind="image" file={cover} onFile={setCover} disabled={busy} />
            <p className="mt-1 text-xs text-muted">
              Paste a screenshot, drag a picture in, or choose one. Leave it empty and the cover is made from the PDF&apos;s first page.
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
                <div className="flex min-w-0 gap-3">
                  {r.cover_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrlFor(r.cover_path) ?? ""} alt="" className="h-20 w-14 shrink-0 rounded border border-line bg-white object-contain" />
                  ) : (
                    <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded border border-dashed border-line text-center text-[10px] leading-tight text-muted">No cover</div>
                  )}
                <div className="min-w-0">
                  <p className="font-semibold text-navy">{r.title}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {typeLabelOf(r.type)} · {courseLabel(r.course)} {termText(r.course, r.term) && `· ${termText(r.course, r.term)}`}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {Number(r.price) === 0 ? "Free" : `₹${r.price}`}
                    {r.pages ? ` · ${r.pages} pages` : ""}{r.language ? ` · ${languageLabel(r.language)}` : " · Language not set"} · PDF {r.file_path ? "✓" : "missing"} · Sample {r.sample_path ? "✓" : "none"}
                  </p>
                </div>
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
                  <button type="button" onClick={() => createCover(r)} disabled={coverBusy === r.id} className={`${button} border border-line bg-white text-navy hover:bg-surface`}>
                    {coverBusy === r.id ? "Making cover…" : r.cover_path ? "Refresh cover" : "Create cover"}
                  </button>
                )}
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
