// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";
// import { useDispatch, useSelector } from "react-redux";
// import { createContent } from "@/src/features/content";

// import { Eye, Plus, Tag, X, UploadCloud, Trash2, ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Navbar2 } from "@/components/Navbar2";

// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
// // remember to install: npm i react-quill and import 'react-quill/dist/quill.snow.css' in globals

// export default function CreateResearchPage() {
//   const dispatch = useDispatch<any>();
//   const router = useRouter();
//   const categories = useSelector((s: any) => s.category?.data ?? []);

//   const limits = useMemo(() => ({
//     titleMin: 2,
//     titleMax: 250,
//     descriptionMin: 2,
//     descriptionMax: 120000,
//     detailsMin: 9,
//     detailsMax: 12000,
//     tagsMax: 7,
//     imageMaxBytes: 5 * 1024 * 1024,
//     videoMaxBytes: 15 * 1024 * 1024,
//   }), [] as const);

//   const [formData, setFormData] = useState({
//     title: "",
//     categoryId: "",
//     tags: [] as string[],
//     details: "",
//     description: "",
//     mediaFile: null as File | null,
//     mediaType: "" as "" | "image" | "video",
//   });
//   const [currentTag, setCurrentTag] = useState("");
//   const [mediaPreview, setMediaPreview] = useState<string | null>(null);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [isPublishing, setIsPublishing] = useState(false);
//   const [showPreview, setShowPreview] = useState(false);
//   const [dragging, setDragging] = useState(false);

//   const quillRef = useRef<any>(null);

//   useEffect(() => {
//     if (!formData.mediaFile) { setMediaPreview(null); return; }
//     const url = URL.createObjectURL(formData.mediaFile);
//     setMediaPreview(url);
//     return () => URL.revokeObjectURL(url);
//   }, [formData.mediaFile]);

//   // enforce RTL when Quill ready
//   useEffect(() => {
//     const setRtl = () => {
//       const editor = quillRef.current?.getEditor?.();
//       if (!editor) return;
//       try {
//         editor.root.setAttribute('dir', 'rtl');
//         editor.root.style.textAlign = 'right';
//         // ensure pasted content keeps rtl
//         editor.on('text-change', () => {
//           editor.root.setAttribute('dir', 'rtl');
//           editor.root.style.textAlign = 'right';
//         });
//       } catch (err) { console.warn('quill not ready', err); }
//     };
//     // try immediately and also after small delay (in case of lazy load)
//     setRtl();
//     const id = setTimeout(setRtl, 500);
//     return () => clearTimeout(id);
//   }, []);

//   const flattenCategories = (cats: any[]): { id: string; title: string; level: number }[] => {
//     const res: any[] = [];
//     const walk = (list: any[], level = 0) => {
//       (list || []).forEach((c: any) => {
//         const id = c?.meCategory?.id ?? c?.id ?? String(Math.random());
//         const title = c?.meCategory?.title ?? c?.title ?? "غير مسمى";
//         res.push({ id, title, level });
//         if (Array.isArray(c.children) && c.children.length) walk(c.children, level + 1);
//       });
//     };
//     walk(cats);
//     return res;
//   };

//   const addTag = () => {
//     const t = currentTag.trim();
//     if (!t) return;
//     if (formData.tags.includes(t)) { setCurrentTag(""); return; }
//     if (formData.tags.length >= limits.tagsMax) { setErrorMsg(`الحد الأقصى للوسوم هو ${limits.tagsMax}`); return; }
//     setFormData(p => ({ ...p, tags: [...p.tags, t] }));
//     setCurrentTag("");
//     setErrorMsg(null);
//   };
//   const removeTag = (t: string) => setFormData(p => ({ ...p, tags: p.tags.filter(x => x !== t) }));

//   const onMediaChange = (f?: File | null) => {
//     if (!f) return;
//     const isImage = f.type.startsWith("image/");
//     const isVideo = f.type.startsWith("video/");
//     if (!isImage && !isVideo) { setErrorMsg("الملف غير مدعوم"); return; }
//     if (isImage && f.size > limits.imageMaxBytes) { setErrorMsg("حجم الصورة أكبر من 5MB"); return; }
//     if (isVideo && f.size > limits.videoMaxBytes) { setErrorMsg("حجم الفيديو أكبر من 15MB"); return; }
//     setFormData(p => ({ ...p, mediaFile: f, mediaType: isImage ? "image" : "video" }));
//     setErrorMsg(null);
//   };
//   const removeMedia = () => setFormData(p => ({ ...p, mediaFile: null, mediaType: "" }));

//   const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) onMediaChange(f); };
//   const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
//   const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); };

//   const stripHtml = (s: string) => s.replace(/<(.|)*?>/g, '').trim();

//   const validate = (): string | null => {
//     const tlen = formData.title.trim().length;
//     if (tlen < limits.titleMin || tlen > limits.titleMax) return `العنوان بين ${limits.titleMin} و ${limits.titleMax} حرفاً.`;
//     const details = formData.details.trim().length;
//     if (details < limits.detailsMin || details > limits.detailsMax) return `النظرة العامة بين ${limits.detailsMin} و ${limits.detailsMax} حرفاً.`;
//     const description = stripHtml(formData.description || '');
//     if (description.length < limits.descriptionMin || description.length > limits.descriptionMax)
//       return `المحتوى بين ${limits.descriptionMin} و ${limits.descriptionMax} حرفاً.`;
//     if (!formData.categoryId) return "القسم مطلوب.";
//     if (formData.tags.length > limits.tagsMax) return `الحد الأقصى للوسوم ${limits.tagsMax}.`;
//     return null;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrorMsg(null);
//     const v = validate(); if (v) { setErrorMsg(v); return; }
//     setIsPublishing(true);
//     try {
//       const payload: any = {
//         title: formData.title.trim(),
//         description: formData.description,
//         details: formData.details,
//         categoryId: formData.categoryId,
//         tags: formData.tags,
//         typeCode: "research",
//       };
//       if (formData.mediaFile) payload.file = formData.mediaFile;

//       const created = await dispatch(createContent(payload)).unwrap();
//       const contentId = created?.id || created?.contentId || created?.data?.id || created?.data?.contentId;
//       if (!contentId) { console.error("createContent response:", created); throw new Error("لم نستلم معرف المحتوى (id) من السيرفر."); }
//       router.push(`/research/${contentId}/attachments`);
//     } catch (err: any) {
//       const msg = typeof err === "string" ? err : err?.message || JSON.stringify(err);
//       setErrorMsg(msg);
//       console.error(err);
//     } finally { setIsPublishing(false); }
//   };

//   const quillModules = useMemo(() => ({
//     toolbar: {
//       container: [
//         [{ header: [1, 2, 3, false] }],
//         ['bold', 'italic', 'underline', 'strike'],
//         [{ 'list': 'ordered' }, { 'list': 'bullet' }],
//         ['blockquote', 'code-block'],
//         ['link', 'image'],
//         [{ 'align': [] }],
//         ['clean']
//       ]
//     }
//   }), []);

//   const siteFont = "var(--site-font, 'Cairo', 'Noto Naskh Arabic', system-ui)";

//   const LivePreview = () => (
//     <aside className="hidden lg:block w-80 sticky top-20 self-start">
//       <div className="rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-slate-900 border dark:border-slate-800">
//         <div className="p-4 border-b dark:border-slate-800">
//           <h3 className="text-lg font-semibold">معاينة مباشرة</h3>
//           <p className="text-sm text-muted-foreground">انظر كيف سيظهر بحثك فورياً</p>
//         </div>
//         <div className="p-4 space-y-3">
//           {mediaPreview ? (
//             <div className="rounded-md overflow-hidden">
//               {formData.mediaType === 'image' ? <img src={mediaPreview} alt="media" className="w-full h-36 object-cover" /> : <video src={mediaPreview} controls className="w-full h-36" />}
//             </div>
//           ) : (
//             <div className="h-36 rounded-md bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-sm text-muted-foreground">لا توجد وسائط</div>
//           )}

//           <div>
//             <h4 className="text-base font-semibold" style={{ fontFamily: siteFont }}>{formData.title || 'عنوان البحث'}</h4>
//             <div className="text-xs text-muted-foreground">{flattenCategories(categories).find(c => c.id === formData.categoryId)?.title ?? 'القسم'}</div>
//           </div>

//           <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formData.description || '<i>المحتوى سيظهر هنا...</i>' }} />

//           <div className="flex flex-wrap gap-2 pt-2">
//             {formData.tags.map(t => <Badge key={t}>{t}</Badge>)}
//           </div>
//         </div>
//       </div>
//     </aside>
//   );

//   return (
//     <>
//     <Navbar2 />
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-900 p-6" style={{ fontFamily: siteFont }}>
//       <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8 px-4">

//         <section className="space-y-6">

//           <div className="flex items-center justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <div>
//                 <h1 className="text-2xl font-bold leading-tight">انشر بحثك — واجهة احترافية</h1>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               <button type="button" onClick={() => router.push('/')} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-slate-800"> <ArrowLeft /> رجوع</button>
//               <button type="button" onClick={() => setShowPreview(true)} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-white border dark:bg-slate-800"> <Eye /> معاينة</button>
//             </div>
//           </div>

//           {/* centered narrow form container to avoid edge-to-edge fields */}
//           <div className="mx-auto max-w-3xl">
//             <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border dark:border-slate-800">

//               <div className="space-y-1">
//                 <Label className="font-medium">العنوان *</Label>
//                 <Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="عنوان البحث" required className="text-lg font-semibold" />
//                 <div className="flex justify-between text-xs text-muted-foreground">
//                   <div>الحد: {limits.titleMin}-{limits.titleMax}</div>
//                   <div>{formData.title.trim().length}/{limits.titleMax}</div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="md:col-span-2">
//                   <Label>القسم *</Label>
//                   <div className="mt-1">
//                     <select value={formData.categoryId} onChange={e => setFormData(p => ({ ...p, categoryId: e.target.value }))} className="w-full p-3 rounded-md bg-transparent border">
//                       <option value="">اختر القسم</option>
//                       {flattenCategories(categories).map(c => (
//                         <option key={c.id} value={c.id}>{' '.repeat(c.level * 2)}{c.title}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <Label>وسوم</Label>
//                   <div className="mt-1 flex gap-2">
//                     <Input value={currentTag} onChange={e => setCurrentTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="أضف وسم واضغط Enter" />
//                     <Button type="button" onClick={addTag}><Tag /></Button>
//                   </div>
//                   <div className="mt-2 flex gap-2 flex-wrap">
//                     {formData.tags.map(t => (
//                       <Badge key={t} className="flex items-center gap-2">
//                         {t}
//                         <button type="button" onClick={() => removeTag(t)} className="p-1 rounded-full hover:bg-muted"><X size={14} /></button>
//                       </Badge>
//                     ))}
//                   </div>
//                   <div className="text-xs text-muted-foreground mt-1">الحد الأقصى: {limits.tagsMax}</div>
//                 </div>
//               </div>

//               <div>
//                 <Label>صورة/فيديو (اختياري)</Label>
//                 <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} className={`mt-2 rounded-lg p-4 border-2 ${dragging ? 'border-indigo-400 bg-indigo-50/40 shadow-lg' : 'border-dashed bg-transparent'} flex flex-col items-center gap-3`}> 
//                   <UploadCloud size={30} />
//                   <div className="text-sm">اسحب واسقط الملف هنا أو اضغط لاختياره</div>
//                   <div className="flex gap-2">
//                     <label className="px-4 py-2 rounded-md bg-white border cursor-pointer dark:bg-slate-800">
//                       <input type="file" accept="image/*,video/*" className="hidden" onChange={e => onMediaChange(e.target.files?.[0] ?? null)} />
//                       اختر ملف
//                     </label>
//                     {formData.mediaFile && <button type="button" onClick={removeMedia} className="px-4 py-2 rounded-md bg-white/80 dark:bg-slate-800 border">إزالة</button>}
//                   </div>
//                   <div className="w-full">
//                     {mediaPreview ? (
//                       <div className="rounded-md overflow-hidden mt-3">
//                         {formData.mediaType === 'image' ? <img src={mediaPreview} alt="preview" className="w-full h-44 object-cover" /> : <video src={mediaPreview} controls className="w-full h-44" />}
//                       </div>
//                     ) : (
//                       <div className="mt-3 rounded-md h-44 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-sm text-muted-foreground">لم تقم بتحميل ملف بعد</div>
//                     )}
//                     <div className="mt-2 text-xs text-muted-foreground">حد الصورة: 5MB — حد الفيديو: 15MB</div>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <Label>النظرة العامة *</Label>
//                 <Textarea value={formData.details} onChange={e => setFormData(p => ({ ...p, details: e.target.value }))} rows={4} placeholder="سطران أو ثلاثة تلخّص البحث" />
//                 <div className="flex justify-between text-xs text-muted-foreground">
//                   <div>الحد: {limits.detailsMin}-{limits.detailsMax}</div>
//                   <div>{formData.details.trim().length}/{limits.detailsMax}</div>
//                 </div>
//               </div>

//               <div>
//                 <Label>البحث *</Label>
//                 <div className="mt-2">
//                   {typeof window !== 'undefined' && ReactQuill ? (
//                     // @ts-ignore
//                     <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--muted-border, #e5e7eb)' }}>
//                       <style>{`
//                         .ql-container { direction: rtl !important; }
//                         .ql-editor { direction: rtl !important; text-align: right !important; font-family: ${siteFont} !important; font-size: 16px; line-height: 1.7; padding: 18px; }
//                         .ql-toolbar { direction: ltr; }
//                       `}</style>
//                       {/* @ts-ignore */}
//                       <ReactQuill
//                         value={formData.description}
//                         onChange={(v: string) => setFormData(p => ({ ...p, description: v }))}
//                         modules={quillModules}
//                         placeholder="اكتب البحث هنا — يدعم العربية بالكامل"
//                         theme="snow"
//                         onFocus={() => {
//                           const ed = quillRef.current?.getEditor?.();
//                           if (ed) { ed.root.setAttribute('dir','rtl'); ed.format('align','right'); }
//                         }}
//                       />
//                     </div>
//                   ) : (
//                     <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={12} placeholder="اكتب البحث هنا" />
//                   )}
//                   <div className="flex justify-between text-xs text-muted-foreground mt-2">
//                     <div>الحد: {limits.descriptionMin}-{limits.descriptionMax}</div>
//                     <div>{stripHtml(formData.description).length}/{limits.descriptionMax}</div>
//                   </div>
//                 </div>
//               </div>

//               {errorMsg && (
//                 <div className="rounded-md p-3 bg-rose-50 border border-rose-100 text-rose-700">
//                   <div className="font-medium">خطأ</div>
//                   <div className="text-sm mt-1">{errorMsg}</div>
//                 </div>
//               )}

//               <div className="flex items-center justify-end gap-3">
//                 <Button variant="outline" type="button" onClick={() => router.push('/')} disabled={isPublishing}>رجوع</Button>
//                 <Button type="button" onClick={() => setShowPreview(true)} disabled={isPublishing}><Eye /> معاينة</Button>
//                 <Button type="submit" disabled={isPublishing}>{isPublishing ? 'جارٍ النشر...' : (<><Plus /> نشر</>)}</Button>
//               </div>

//             </form>
//           </div>

//         </section>

//         <LivePreview />

//         {/* mobile floating preview button */}
//         <button onClick={() => setShowPreview(true)} className="lg:hidden fixed bottom-6 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg">
//           <Eye />
//         </button>

//       </main>

//       {/* shared preview modal for desktop & mobile */}
//       {showPreview && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-auto max-h-[90vh] p-6">
//             <div className="flex items-start justify-between">
//               <div>
//                 <h3 className="text-2xl font-semibold">{formData.title || "(عنوان...)"}</h3>
//                 <p className="text-sm text-muted-foreground mt-1">{flattenCategories(categories).find(c => c.id === formData.categoryId)?.title ?? "-"}</p>
//               </div>
//               <div>
//                 <button type="button" onClick={() => setShowPreview(false)} aria-label="إغلاق" className="p-2 rounded hover:bg-muted">
//                   <X />
//                 </button>
//               </div>
//             </div>

//             <div className="mt-4 space-y-4">
//               {mediaPreview && (
//                 <div className="w-full rounded overflow-hidden">
//                   {formData.mediaType === "image" ? (
//                     <img src={mediaPreview} alt="preview" className="w-full h-64 object-cover rounded" />
//                   ) : (
//                     <video src={mediaPreview} controls className="w-full h-64 rounded" />
//                   )}
//                 </div>
//               )}

//               <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formData.description || "<i>لا يوجد محتوى بعد</i>" }} />

//               <div className="pt-4 border-t border-muted/30">
//                 <h4 className="font-medium">النظرة العامة</h4>
//                 <p className="text-sm text-muted-foreground">{formData.details || "-"}</p>
//               </div>

//               <div className="pt-4 flex flex-wrap gap-2">
//                 {formData.tags.map(t => <Badge key={t}>{t}</Badge>)}
//               </div>

//               <div className="flex justify-end mt-4">
//                 <button type="button" onClick={() => setShowPreview(false)} className="px-4 py-2 rounded bg-slate-100 dark:bg-slate-800">إغلاق</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//     </>
//   );
// }
"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { createContent } from "@/src/features/content"

import { Eye, Tag, X, UploadCloud, ArrowLeft, ImageIcon, FileVideo, Sparkles, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Navbar2 } from "@/components/Navbar2"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

export default function CreateResearchPage() {
  const dispatch = useDispatch<any>()
  const router = useRouter()
  const categories = useSelector((s: any) => s.category?.data ?? [])

  const limits = useMemo(
    () => ({
      titleMin: 2,
      titleMax: 250,
      descriptionMin: 2,
      descriptionMax: 120000,
      detailsMin: 9,
      detailsMax: 12000,
      tagsMax: 7,
      imageMaxBytes: 5 * 1024 * 1024,
      videoMaxBytes: 15 * 1024 * 1024,
    }),
    [],
  )

  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    tags: [] as string[],
    details: "",
    description: "",
    mediaFile: null as File | null,
    mediaType: "" as "" | "image" | "video",
  })
  const [currentTag, setCurrentTag] = useState("")
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [dragging, setDragging] = useState(false)

  const quillRef = useRef<any>(null)

  useEffect(() => {
    if (!formData.mediaFile) {
      setMediaPreview(null)
      return
    }
    const url = URL.createObjectURL(formData.mediaFile)
    setMediaPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [formData.mediaFile])

  useEffect(() => {
    const setRtl = () => {
      const editor = quillRef.current?.getEditor?.()
      if (!editor) return
      try {
        editor.root.setAttribute("dir", "rtl")
        editor.root.style.textAlign = "right"
        editor.on("text-change", () => {
          editor.root.setAttribute("dir", "rtl")
          editor.root.style.textAlign = "right"
        })
      } catch (err) {
        console.warn("quill not ready", err)
      }
    }
    setRtl()
    const id = setTimeout(setRtl, 500)
    return () => clearTimeout(id)
  }, [])

  const flattenCategories = (cats: any[]): { id: string; title: string; level: number }[] => {
    const res: any[] = []
    const walk = (list: any[], level = 0) => {
      ;(list || []).forEach((c: any) => {
        const id = c?.meCategory?.id ?? c?.id ?? String(Math.random())
        const title = c?.meCategory?.title ?? c?.title ?? "غير مسمى"
        res.push({ id, title, level })
        if (Array.isArray(c.children) && c.children.length) walk(c.children, level + 1)
      })
    }
    walk(cats)
    return res
  }

  const addTag = () => {
    const t = currentTag.trim()
    if (!t) return
    if (formData.tags.includes(t)) {
      setCurrentTag("")
      return
    }
    if (formData.tags.length >= limits.tagsMax) {
      setErrorMsg(`الحد الأقصى للوسوم هو ${limits.tagsMax}`)
      return
    }
    setFormData((p) => ({ ...p, tags: [...p.tags, t] }))
    setCurrentTag("")
    setErrorMsg(null)
  }
  const removeTag = (t: string) => setFormData((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }))

  const onMediaChange = (f?: File | null) => {
    if (!f) return
    const isImage = f.type.startsWith("image/")
    const isVideo = f.type.startsWith("video/")
    if (!isImage && !isVideo) {
      setErrorMsg("الملف غير مدعوم")
      return
    }
    if (isImage && f.size > limits.imageMaxBytes) {
      setErrorMsg("حجم الصورة أكبر من 5MB")
      return
    }
    if (isVideo && f.size > limits.videoMaxBytes) {
      setErrorMsg("حجم الفيديو أكبر من 15MB")
      return
    }
    setFormData((p) => ({ ...p, mediaFile: f, mediaType: isImage ? "image" : "video" }))
    setErrorMsg(null)
  }
  const removeMedia = () => setFormData((p) => ({ ...p, mediaFile: null, mediaType: "" }))

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onMediaChange(f)
  }
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }

  const stripHtml = (s: string) => s.replace(/<(.|\n)*?>/g, "").trim()

  const validate = (): string | null => {
    const tlen = formData.title.trim().length
    if (tlen < limits.titleMin || tlen > limits.titleMax)
      return `العنوان بين ${limits.titleMin} و ${limits.titleMax} حرفاً.`
    const details = formData.details.trim().length
    if (details < limits.detailsMin || details > limits.detailsMax)
      return `النظرة العامة بين ${limits.detailsMin} و ${limits.detailsMax} حرفاً.`
    const description = stripHtml(formData.description || "")
    if (description.length < limits.descriptionMin || description.length > limits.descriptionMax)
      return `المحتوى بين ${limits.descriptionMin} و ${limits.descriptionMax} حرفاً.`
    if (!formData.categoryId) return "القسم مطلوب."
    if (formData.tags.length > limits.tagsMax) return `الحد الأقصى للوسوم ${limits.tagsMax}.`
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    const v = validate()
    if (v) {
      setErrorMsg(v)
      return
    }
    setIsPublishing(true)
    try {
      const payload: any = {
        title: formData.title.trim(),
        description: formData.description,
        details: formData.details,
        categoryId: formData.categoryId,
        tags: formData.tags,
        typeCode: "research",
      }
      if (formData.mediaFile) payload.file = formData.mediaFile

      const created = await dispatch(createContent(payload)).unwrap()
      const contentId = created?.id || created?.contentId || created?.data?.id || created?.data?.contentId
      if (!contentId) {
        console.error("createContent response:", created)
        throw new Error("لم نستلم معرف المحتوى (id) من السيرفر.")
      }
      router.push(`/research/${contentId}/attachments`)
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || JSON.stringify(err)
      setErrorMsg(msg)
      console.error(err)
    } finally {
      setIsPublishing(false)
    }
  }

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          [{ direction: "rtl" }, { align: [] }],
          ["blockquote", "code-block"],
          ["link"],
          ["clean"],
        ],
      },
    }),
    [],
  )

  const siteFont = "var(--font-sans, 'Cairo', 'Noto Naskh Arabic', system-ui)"

  return (
    <>
      <Navbar2 />
      <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: siteFont }}>
        {/* Animated background */}
        <div className="fixed inset-0 -z-10 bg-background">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="group gap-2 hover:gap-3 transition-all duration-300 rounded-full hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>رجوع</span>
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>إنشاء بحث جديد</span>
            </div>
          </div>
        </div>

        <header className="container mx-auto px-4 pt-12 pb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance bg-gradient-to-l from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            شارك بحثك مع العالم
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            انشر أفكارك واكتشافاتك العلمية في منصة احترافية تصل إلى الباحثين والمهتمين حول العالم
          </p>
        </header>

        <main className="container mx-auto px-4 pb-20">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                عنوان البحث *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="اكتب عنواناً واضحاً وجذاباً"
                required
                className="h-11 text-base bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:bg-card/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>الحد الأدنى: {limits.titleMin}</span>
                <span className={formData.title.trim().length > limits.titleMax ? "text-destructive" : ""}>
                  {formData.title.trim().length} / {limits.titleMax}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  القسم العلمي *
                </Label>
                <select
                  id="category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                  className="w-full h-11 px-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 outline-none text-sm shadow-sm hover:shadow-md"
                  required
                >
                  <option value="">اختر القسم</option>
                  {flattenCategories(categories).map((c) => (
                    <option key={c.id} value={c.id}>
                      {"\u00A0".repeat(c.level * 3)}
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                  الكلمات المفتاحية
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    placeholder="أضف وسماً"
                    className="h-11 text-sm bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:bg-card/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    size="icon"
                    variant="ghost"
                    className="group h-11 w-11 shrink-0 rounded-xl hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <Tag className="h-4 w-4 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.tags.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="group pl-1 pr-3 py-1 text-xs gap-1.5 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(t)}
                          className="hover:bg-destructive/20 rounded-full p-0.5 transition-all duration-200 group-hover:rotate-90"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.tags.length} / {limits.tagsMax}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">صورة أو فيديو توضيحي</Label>

              {!formData.mediaFile ? (
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={`
                    group relative rounded-2xl p-10 
                    bg-gradient-to-br from-card/40 via-card/60 to-card/40 backdrop-blur-sm
                    border-2 border-dashed transition-all duration-500 ease-out
                    shadow-sm hover:shadow-xl
                    ${
                      dragging
                        ? "border-primary/70 bg-primary/5 scale-[1.02] shadow-2xl shadow-primary/20 ring-4 ring-primary/10"
                        : "border-border/40 hover:border-primary/40 hover:bg-card/70"
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div
                      className={`
                      p-4 rounded-2xl transition-all duration-500 ease-out
                      ${dragging ? "bg-primary/15 scale-110 rotate-6 shadow-lg shadow-primary/20" : "bg-muted/30 group-hover:bg-primary/10 group-hover:scale-105"}
                    `}
                    >
                      <UploadCloud
                        className={`h-12 w-12 transition-all duration-500 ${dragging ? "text-primary animate-bounce" : "text-muted-foreground group-hover:text-primary"}`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-base font-medium">اسحب الملف وأفلته هنا</p>
                      <p className="text-xs text-muted-foreground">أو اختر من جهازك</p>
                    </div>

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => onMediaChange(e.target.files?.[0] ?? null)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="group/btn gap-2 rounded-full hover:scale-105 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md bg-transparent"
                        asChild
                      >
                        <span>
                          <ImageIcon className="h-4 w-4 transition-transform group-hover/btn:scale-110 group-hover/btn:rotate-12" />
                          اختيار ملف
                        </span>
                      </Button>
                    </label>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5" />
                        صور 5MB
                      </span>
                      <span className="text-border">•</span>
                      <span className="flex items-center gap-1.5">
                        <FileVideo className="h-3.5 w-3.5" />
                        فيديو 15MB
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-card/30 border border-border/40 group shadow-sm hover:shadow-xl transition-all duration-300">
                  {formData.mediaType === "image" ? (
                    <img src={mediaPreview! || "/placeholder.svg"} alt="معاينة" className="w-full h-64 object-cover" />
                  ) : (
                    <video src={mediaPreview!} controls className="w-full h-64" />
                  )}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                      type="button"
                      onClick={removeMedia}
                      size="icon"
                      variant="destructive"
                      className="h-9 w-9 rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                    <p className="text-white text-sm font-medium truncate">{formData.mediaFile.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="details" className="text-sm font-medium">
                نظرة عامة على البحث *
              </Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) => setFormData((p) => ({ ...p, details: e.target.value }))}
                rows={4}
                placeholder="ملخص موجز يوضح الفكرة الرئيسية والأهداف..."
                className="resize-none bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:bg-card/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm leading-relaxed rounded-xl shadow-sm hover:shadow-md"
                required
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>الحد الأدنى: {limits.detailsMin}</span>
                <span className={formData.details.trim().length > limits.detailsMax ? "text-destructive" : ""}>
                  {formData.details.trim().length} / {limits.detailsMax}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">محتوى البحث الكامل *</Label>
              <p className="text-xs text-muted-foreground">اكتب بحثك بالتفصيل مع إمكانية التنسيق الكامل</p>

              <div className="rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border/40 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                {typeof window !== "undefined" && (
                  <>
                    <style>{`
                      .premium-editor {
                        font-family: ${siteFont} !important;
                      }
                      .premium-editor .ql-container {
                        direction: rtl !important;
                        font-family: ${siteFont} !important;
                        min-height: 500px;
                        border: none;
                      }
                      .premium-editor .ql-editor {
                        direction: rtl !important;
                        text-align: right !important;
                        font-family: ${siteFont} !important;
                        font-size: 16px;
                        line-height: 1.8;
                        padding: 24px 28px;
                        min-height: 500px;
                        color: hsl(var(--foreground));
                      }
                      .premium-editor .ql-editor.ql-blank::before {
                        right: 28px;
                        left: auto;
                        font-style: normal;
                        color: hsl(var(--muted-foreground));
                        opacity: 0.5;
                      }
                      .premium-editor .ql-toolbar {
                        direction: ltr;
                        border: none;
                        border-bottom: 1px solid hsl(var(--border) / 0.3);
                        background: hsl(var(--muted) / 0.15);
                        padding: 12px 16px;
                        backdrop-filter: blur(8px);
                      }
                      .premium-editor .ql-toolbar button {
                        border-radius: 8px;
                        transition: all 0.3s ease;
                        width: 32px;
                        height: 32px;
                      }
                      .premium-editor .ql-toolbar button:hover {
                        background: hsl(var(--primary) / 0.1);
                        transform: scale(1.05);
                      }
                      .premium-editor .ql-toolbar button.ql-active {
                        background: hsl(var(--primary) / 0.15);
                        color: hsl(var(--primary));
                        box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
                      }
                      .premium-editor .ql-stroke {
                        stroke: hsl(var(--foreground) / 0.6);
                        transition: stroke 0.3s;
                      }
                      .premium-editor .ql-fill {
                        fill: hsl(var(--foreground) / 0.6);
                        transition: fill 0.3s;
                      }
                      .premium-editor .ql-picker-label {
                        color: hsl(var(--foreground) / 0.6);
                        transition: color 0.3s;
                      }
                      .premium-editor .ql-toolbar button:hover .ql-stroke {
                        stroke: hsl(var(--primary));
                      }
                      .premium-editor .ql-toolbar button:hover .ql-fill {
                        fill: hsl(var(--primary));
                      }
                      .premium-editor .ql-editor h1,
                      .premium-editor .ql-editor h2,
                      .premium-editor .ql-editor h3 {
                        font-weight: 700;
                        margin-top: 1.5em;
                        margin-bottom: 0.5em;
                        color: hsl(var(--foreground));
                      }
                      .premium-editor .ql-editor p {
                        margin-bottom: 1em;
                      }
                      .premium-editor .ql-editor blockquote {
                        border-right: 4px solid hsl(var(--primary) / 0.4);
                        padding-right: 20px;
                        margin: 1.5em 0;
                        color: hsl(var(--muted-foreground));
                        font-style: italic;
                      }
                      .premium-editor .ql-editor ul,
                      .premium-editor .ql-editor ol {
                        padding-right: 1.5em;
                      }
                      .premium-editor .ql-editor a {
                        color: hsl(var(--primary));
                        text-decoration: underline;
                      }
                    `}</style>
                    <ReactQuill
                      ref={quillRef}
                      value={formData.description}
                      onChange={(v: string) => setFormData((p) => ({ ...p, description: v }))}
                      modules={quillModules}
                      placeholder="ابدأ الكتابة هنا... استخدم أدوات التنسيق لتحسين مظهر بحثك"
                      theme="snow"
                      className="premium-editor"
                    />
                  </>
                )}
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>الحد الأدنى: {limits.descriptionMin}</span>
                <span
                  className={stripHtml(formData.description).length > limits.descriptionMax ? "text-destructive" : ""}
                >
                  {stripHtml(formData.description).length} / {limits.descriptionMax}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-xl p-4 bg-destructive/10 border border-destructive/30 backdrop-blur-sm shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-1 h-full bg-destructive rounded-full" />
                  <p className="text-sm text-destructive leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-border/30">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/")}
                disabled={isPublishing}
                className="group rounded-xl hover:bg-muted/50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <span className="transition-transform group-hover:scale-95">إلغاء</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(true)}
                disabled={isPublishing}
                className="group gap-2 rounded-xl hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>معاينة</span>
              </Button>

              <Button
                type="submit"
                disabled={isPublishing}
                className="group gap-2 min-w-[140px] rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 bg-primary text-primary-foreground"
              >
                {isPublishing ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>جارٍ النشر...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                    <span>نشر البحث</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </main>

        {/* Preview modal - unchanged */}
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-3xl bg-card rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 border border-border/40">
              <div className="flex items-center justify-between p-5 border-b border-border/30 bg-muted/10">
                <div>
                  <h3 className="text-lg font-bold">معاينة البحث</h3>
                  <p className="text-xs text-muted-foreground mt-1">هكذا سيظهر بحثك للقراء</p>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  size="icon"
                  variant="ghost"
                  className="rounded-full h-10 w-10 hover:bg-muted/50 transition-all"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="overflow-y-auto p-6 space-y-5">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-balance">{formData.title || "عنوان البحث"}</h1>
                  <p className="text-xs text-muted-foreground">
                    {flattenCategories(categories).find((c) => c.id === formData.categoryId)?.title ?? "القسم"}
                  </p>
                </div>

                {mediaPreview && (
                  <div className="rounded-xl overflow-hidden border border-border/40">
                    {formData.mediaType === "image" ? (
                      <img src={mediaPreview || "/placeholder.svg"} alt="معاينة" className="w-full h-64 object-cover" />
                    ) : (
                      <video src={mediaPreview} controls className="w-full h-64" />
                    )}
                  </div>
                )}

                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <h4 className="text-sm font-semibold mb-2">نظرة عامة</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {formData.details || "لا توجد نظرة عامة بعد"}
                  </p>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs rounded-full">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formData.description || "<p class='text-muted-foreground italic'>لا يوجد محتوى بعد</p>",
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 p-4 border-t border-border/30 bg-muted/10">
                <Button type="button" onClick={() => setShowPreview(false)} className="rounded-xl">
                  إغلاق
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
