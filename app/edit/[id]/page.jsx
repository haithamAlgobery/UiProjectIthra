



// // ===== file: app/edit/[id]/page.js =====
// "use client";

// import React, { useEffect, useMemo, useState, useRef } from "react";
// import dynamic from "next/dynamic";
// import { useRouter, useParams } from "next/navigation";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchContentById,
//   updateContentById,
//   setContentField,
//   clearContent,
// } from "@/src/features/editableContentSlice";
// import {
//   fetchTagsByContentId,
//   updateTagsByContentId,
//   setLocalTags,
// } from "@/src/features/tagsSlice";

// // dynamic Quill for research description (client only)
// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
// import "react-quill/dist/quill.snow.css";

// export default function EditContentPage() {
//   const router = useRouter();
//   const { id } = useParams();
//   const dispatch = useDispatch();

//   const { content, loading, error, saving, saveError } = useSelector(
//     (s) => s.editableContent ?? { content: null, loading: false }
//   );
//   const tagsState = useSelector((s) => s.tags ?? { tags: [] });
//   const categories = useSelector((s) => s.category?.data ?? []);

//   const limits = useMemo(
//     () => ({
//       titleMin: 2,
//       titleMax: 250,
//       descriptionMin: 2,
//       descriptionMax: 120000,
//       detailsMin: 9,
//       detailsMax: 12000,
//       tagsMax: 7,
//       imageMaxBytes: 5 * 1024 * 1024,
//       videoMaxBytes: 15 * 1024 * 1024,
//     }),
//     []
//   );

//   // local form state (prefilled from content when loaded)
//   const [formData, setFormData] = useState({
//     title: "",
//     details: "",
//     description: "",
//     categoryId: "",
//     mediaFile: null,
//     mediaType: "",
//   });
//   const [mediaPreview, setMediaPreview] = useState(null);
//   const [currentTag, setCurrentTag] = useState("");
//   const [localTags, setLocalTagsState] = useState([]);
//   const [errorMsg, setErrorMsg] = useState(null);

//   useEffect(() => {
//     if (!id) return;
//     dispatch(fetchContentById(id));
//     dispatch(fetchTagsByContentId(id));
//     return () => {
//       dispatch(clearContent());
//     };
//   }, [id]);

//   // populate local form when content arrives
//   useEffect(() => {
//     if (!content) return;
//     setFormData({
//       title: content.title || "",
//       details: content.details || "",
//       description: content.description || "",
//       categoryId: content.categoryId || "",
//       mediaFile: null,
//       mediaType: content.urlImage ? "image" : "",
//     });
//     // tags
//     setLocalTagsState(tagsState.tags || []);
//     // media preview: use urlImage if present
//     if (content.urlImage) setMediaPreview(content.urlImage);
//   }, [content, tagsState.tags]);

//   useEffect(() => {
//     // revoke object urls when media removed
//     return () => {
//       if (mediaPreview && mediaPreview.startsWith("blob:")) URL.revokeObjectURL(mediaPreview);
//     };
//   }, [mediaPreview]);

//   const onMediaChange = (f) => {
//     if (!f) return;
//     const isImage = f.type.startsWith("image/");
//     const isVideo = f.type.startsWith("video/");
//     if (!isImage && !isVideo) {
//       setErrorMsg("الملف غير مدعوم");
//       return;
//     }
//     if (isImage && f.size > limits.imageMaxBytes) {
//       setErrorMsg("حجم الصورة أكبر من 5MB");
//       return;
//     }
//     if (isVideo && f.size > limits.videoMaxBytes) {
//       setErrorMsg("حجم الفيديو أكبر من 15MB");
//       return;
//     }
//     setFormData((p) => ({ ...p, mediaFile: f, mediaType: isImage ? "image" : "video" }));
//     try {
//       const url = URL.createObjectURL(f);
//       setMediaPreview(url);
//     } catch {
//       setMediaPreview(null);
//     }
//     setErrorMsg(null);
//   };

//   const removeMedia = () => {
//     setFormData((p) => ({ ...p, mediaFile: null, mediaType: "" }));
//     setMediaPreview(null);
//   };

//   const addTag = () => {
//     const t = currentTag.trim();
//     if (!t) return;
//     if (localTags.includes(t)) {
//       setCurrentTag("");
//       return;
//     }
//     if (localTags.length >= limits.tagsMax) {
//       setErrorMsg(`الحد الأقصى للوسوم هو ${limits.tagsMax}`);
//       return;
//     }
//     setLocalTagsState((p) => [...p, t]);
//     setCurrentTag("");
//     setErrorMsg(null);
//   };
//   const removeTag = (t) => setLocalTagsState((p) => p.filter((x) => x !== t));

//   const stripHtml = (s) => (s || "").replace(/<(.|)*?>/g, "").trim();

//   const validate = () => {
//     const tlen = (formData.title || "").trim().length;
//     if (tlen < limits.titleMin || tlen > limits.titleMax) return `العنوان بين ${limits.titleMin} و ${limits.titleMax} حرفاً.`;
//     const details = (formData.details || "").trim().length;
//     if (details < limits.detailsMin || details > limits.detailsMax) return `النظرة العامة بين ${limits.detailsMin} و ${limits.detailsMax} حرفاً.`;
//     const description = stripHtml(formData.description || "");
//     if (content?.types?.code === "research") {
//       if (description.length < limits.descriptionMin || description.length > limits.descriptionMax) return `المحتوى بين ${limits.descriptionMin} و ${limits.descriptionMax} حرفاً.`;
//     }
//     if (!formData.categoryId) return "القسم مطلوب.";
//     if (localTags.length > limits.tagsMax) return `الحد الأقصى للوسوم ${limits.tagsMax}.`;
//     return null;
//   };

//   const handleUpdateContent = async (e) => {
//     e.preventDefault();
//     setErrorMsg(null);
//     const v = validate();
//     if (v) {
//       setErrorMsg(v);
//       return;
//     }
//     try {
//       const payload = {
//         title: formData.title.trim(),
//         details: formData.details,
//         description: content?.types?.code === "research" ? formData.description : null,
//         categoryId: formData.categoryId,
//         file: formData.mediaFile ?? null,
//       };
//       await dispatch(updateContentById({ contentId: id, payload })) //({ contentId: id, payload }).unwrap();
//       // success: maybe refetch
//       await dispatch(fetchContentById(id));
//       setErrorMsg(null);
//       alert("تم تحديث المحتوى بنجاح");
//     } catch (err) {
//       setErrorMsg(err?.message || String(err) || "فشل التحديث");
//     }
//   };

//   const handleUpdateTags = async (e) => {
//     e.preventDefault();
//     try {
//       await dispatch(updateTagsByContentId({ contentId: id, tags: localTags })).unwrap();
//       alert("تم تحديث الوسوم بنجاح");
//     } catch (err) {
//       setErrorMsg(err?.message || String(err) || "فشل تحديث الوسوم");
//     }
//   };

//   // small helpers
//   const flattenCategories = (cats = []) => {
//     const res = [];
//     const walk = (list, level = 0) => {
//       (list || []).forEach((c) => {
//         const id = c?.meCategory?.id ?? c?.id ?? String(Math.random());
//         const title = c?.meCategory?.title ?? c?.title ?? "غير مسمى";
//         res.push({ id, title, level });
//         if (Array.isArray(c.children) && c.children.length) walk(c.children, level + 1);
//       });
//     };
//     walk(cats);
//     return res;
//   };

//   // decide which form to show
//   const isResearch = content?.types?.code === "research";

//   return (
//     <div className="min-h-screen p-6">
//       <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow">
//         <div className="flex items-center justify-between mb-4">
//           <h1 className="text-xl font-semibold">تعديل المحتوى</h1>
//           <div className="text-sm text-muted-foreground">نوع المحتوى: <strong className="mr-2">{content?.types?.title || "..."}</strong></div>
//         </div>

//         {loading && <div>جاري جلب البيانات...</div>}
//         {error && <div className="text-rose-600">خطأ: {String(error)}</div>}

//         {!loading && content && (
//           <form onSubmit={handleUpdateContent} className="space-y-4">
//             <div>
//               <label className="block font-medium">العنوان *</label>
//               <input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full p-2 border rounded mt-1" />
//               <div className="text-xs text-muted-foreground">{formData.title.trim().length}/{limits.titleMax}</div>
//             </div>

//             <div>
//               <label className="block font-medium">القسم *</label>
//               <select value={formData.categoryId} onChange={(e) => setFormData(p => ({ ...p, categoryId: e.target.value }))} className="w-full p-2 border rounded mt-1">
//                 <option value="">اختر القسم</option>
//                 {flattenCategories(categories).map(c => (
//                   <option key={c.id} value={c.id}>{'\u00A0'.repeat(c.level*2)}{c.title}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block font-medium">الوسوم</label>
//               <div className="flex gap-2 mt-2">
//                 <input value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="أضف وسم واضغط Enter" className="flex-1 p-2 border rounded" />
//                 <button type="button" onClick={addTag} className="px-3 py-2 bg-slate-100 rounded">أضف</button>
//               </div>
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {localTags.map(t => (
//                   <span key={t} className="px-2 py-1 bg-gray-100 rounded flex items-center gap-2">
//                     {t}
//                     <button type="button" onClick={() => removeTag(t)} className="text-xs">✕</button>
//                   </span>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block font-medium">صورة/فيديو (اختياري)</label>
//               <div className="mt-2 border-dashed border p-4 rounded" onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{ e.preventDefault(); const f = e.dataTransfer.files?.[0]; onMediaChange(f); }}>
//                 <div className="flex gap-2 items-center">
//                   <input type="file" accept="image/*,video/*" onChange={(e)=> onMediaChange(e.target.files?.[0])} />
//                   {mediaPreview && (
//                     <div className="ml-4 max-w-[160px] max-h-[120px] overflow-hidden">
//                       {formData.mediaType === 'image' ? <img src={mediaPreview} className="object-cover w-full h-full" /> : <video src={mediaPreview} className="w-full h-full" controls />}
//                     </div>
//                   )}
//                   {mediaPreview && <button type="button" onClick={removeMedia} className="ml-auto text-sm">إزالة</button>}
//                 </div>
//                 <div className="text-xs text-muted-foreground mt-2">حد الصورة: 5MB — حد الفيديو: 15MB</div>
//               </div>
//             </div>

//             <div>
//               <label className="block font-medium">النظرة العامة *</label>
//               <textarea value={formData.details} onChange={(e)=>setFormData(p=>({...p, details: e.target.value}))} rows={4} className="w-full p-2 border rounded mt-1" />
//             </div>

//             {isResearch ? (
//               <div>
//                 <label className="block font-medium">البحث *</label>
//                 <div className="mt-2">
//                   {typeof window !== 'undefined' && ReactQuill ? (
//                     <ReactQuill value={formData.description || ""} onChange={(v)=> setFormData(p => ({ ...p, description: v }))} />
//                   ) : (
//                     <textarea value={formData.description || ""} onChange={(e)=> setFormData(p => ({ ...p, description: e.target.value }))} rows={8} className="w-full p-2 border rounded" />
//                   )}
//                 </div>
//               </div>
//             ) : null}

//             {errorMsg && <div className="text-rose-600">{errorMsg}</div>}
//             {saveError && <div className="text-rose-600">{String(saveError)}</div>}

//             <div className="flex gap-3 justify-end">
//               <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded">إلغاء</button>
//               <button type="button" onClick={handleUpdateTags} className="px-4 py-2 bg-yellow-100 rounded">تحديث الوسوم</button>
//               <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }

"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter, useParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchContentById, updateContentById, clearContent } from "@/src/features/editableContentSlice"
import { fetchTagsByContentId, updateTagsByContentId } from "@/src/features/tagsSlice"
import { ArrowRight, Upload, X, Save, XCircle, Edit3, Plus, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

export default function EditContentPage() {
  const router = useRouter()
  const { id } = useParams()
  const dispatch = useDispatch()

  const { content, loading, error, saving, saveError } = useSelector(
    (s) => s.editableContent ?? { content: null, loading: false },
  )
  const tagsState = useSelector((s) => s.tags ?? { tags: [] })
  const categories = useSelector((s) => s.category?.data ?? [])

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
    details: "",
    description: "",
    categoryId: "",
    mediaFile: null,
    mediaType: "",
  })
  const [mediaPreview, setMediaPreview] = useState(null)
  const [currentTag, setCurrentTag] = useState("")
  const [localTags, setLocalTagsState] = useState([])
  const [initialTags, setInitialTags] = useState([])
  const [errorMsg, setErrorMsg] = useState(null)
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!id) return
    dispatch(fetchContentById(id))
    dispatch(fetchTagsByContentId(id))
    return () => {
      dispatch(clearContent())
    }
  }, [id, dispatch])

  useEffect(() => {
    if (!content) return
    setFormData({
      title: content.title || "",
      details: content.details || "",
      description: content.description || "",
      categoryId: content.categoryId || "",
      mediaFile: null,
      mediaType: content.urlImage ? "image" : "",
    })
    const tags = tagsState.tags || []
    setLocalTagsState(tags)
    setInitialTags(tags)
    if (content.urlImage) setMediaPreview(content.urlImage)
  }, [content, tagsState.tags])

  useEffect(() => {
    return () => {
      if (mediaPreview && mediaPreview.startsWith("blob:")) URL.revokeObjectURL(mediaPreview)
    }
  }, [mediaPreview])

  const onMediaChange = (f) => {
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
    setFormData((p) => ({
      ...p,
      mediaFile: f,
      mediaType: isImage ? "image" : "video",
    }))
    try {
      const url = URL.createObjectURL(f)
      setMediaPreview(url)
    } catch {
      setMediaPreview(null)
    }
    setErrorMsg(null)
  }

  const removeMedia = () => {
    setFormData((p) => ({ ...p, mediaFile: null, mediaType: "" }))
    setMediaPreview(null)
  }

  const addTag = () => {
    const t = currentTag.trim()
    if (!t) return
    if (localTags.includes(t)) {
      setCurrentTag("")
      return
    }
    if (localTags.length >= limits.tagsMax) {
      setErrorMsg(`الحد الأقصى للوسوم هو ${limits.tagsMax}`)
      return
    }
    setLocalTagsState((p) => [...p, t])
    setCurrentTag("")
    setErrorMsg(null)
  }

  const removeTag = (t) => setLocalTagsState((p) => p.filter((x) => x !== t))

  const stripHtml = (s) => (s || "").replace(/<(.|\n)*?>/g, "").trim()

  const validate = () => {
    const tlen = (formData.title || "").trim().length
    if (tlen < limits.titleMin || tlen > limits.titleMax)
      return `العنوان بين ${limits.titleMin} و ${limits.titleMax} حرفاً.`
    const details = (formData.details || "").trim().length
    if (details < limits.detailsMin || details > limits.detailsMax)
      return `النظرة العامة بين ${limits.detailsMin} و ${limits.detailsMax} حرفاً.`
    const description = stripHtml(formData.description || "")
    if (content?.types?.code === "research") {
      if (description.length < limits.descriptionMin || description.length > limits.descriptionMax)
        return `المحتوى بين ${limits.descriptionMin} و ${limits.descriptionMax} حرفاً.`
    }
    if (!formData.categoryId) return "القسم مطلوب."
    if (localTags.length > limits.tagsMax) return `الحد الأقصى للوسوم ${limits.tagsMax}.`
    return null
  }

  const tagsChanged = () => {
    if (localTags.length !== initialTags.length) return true
    return !localTags.every((tag) => initialTags.includes(tag))
  }

  const handleUpdateContent = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    const v = validate()
    if (v) {
      setErrorMsg(v)
      return
    }
    try {
      const payload = {
        title: formData.title.trim(),
        details: formData.details,
        description: content?.types?.code === "research" ? formData.description : null,
        categoryId: formData.categoryId,
        file: formData.mediaFile ?? null,
      }
      await dispatch(updateContentById({ contentId: id, payload }))

      if (tagsChanged()) {
        await dispatch(updateTagsByContentId({ contentId: id, tags: localTags }))
      }

      await dispatch(fetchContentById(id))
      setErrorMsg(null)

      if (content?.types?.code === "research") {
        router.push(`/research/${id}/attachments`)
      } else {
        router.push("/")
      }
    } catch (err) {
      setErrorMsg(err?.message || String(err) || "فشل التحديث")
    }
  }

  const flattenCategories = (cats = []) => {
    const res = []
    const walk = (list, level = 0) => {
      ;(list || []).forEach((c) => {
        const id = c?.meCategory?.id ?? c?.id ?? String(Math.random())
        const title = c?.meCategory?.title ?? c?.title ?? "غير مسمى"
        res.push({ id, title, level })
        if (Array.isArray(c.children) && c.children.length) walk(c.children, level + 1)
      })
    }
    walk(cats)
    return res
  }

  const isResearch = content?.types?.code === "research"

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        [{ direction: "rtl" }],
        ["link"],
        ["clean"],
      ],
    }),
    [],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="group hover:bg-primary/10 transition-all duration-300"
          >
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            رجوع
          </Button>

          {isResearch && (
            <Button
              variant="outline"
              onClick={() => router.push(`/research/${id}/attachments`)}
              className="group hover:bg-accent/10 hover:border-accent transition-all duration-300"
            >
              <ExternalLink className="ml-2 group-hover:rotate-12 transition-transform duration-300" />
              انتقل إلى المرفقات
            </Button>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-l from-foreground to-foreground/70 bg-clip-text text-transparent">
            تعديل المحتوى
          </h1>
          <p className="text-muted-foreground">{content?.types?.title || "جاري التحميل..."}</p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-muted-foreground">جاري جلب البيانات...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-destructive text-center">
            خطأ: {String(error)}
          </div>
        )}

        {!loading && content && (
          <form onSubmit={handleUpdateContent} className="space-y-6">
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Title */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-foreground/90">العنوان *</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  className="w-full h-11 px-4 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 hover:border-primary/30"
                  dir="rtl"
                />
                <div className="text-xs text-muted-foreground text-left">
                  {formData.title.trim().length}/{limits.titleMax}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-foreground/90">القسم *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                  className="w-full h-11 px-4 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 hover:border-primary/30"
                  dir="rtl"
                >
                  <option value="">اختر القسم</option>
                  {flattenCategories(categories).map((c) => (
                    <option key={c.id} value={c.id}>
                      {"\u00A0".repeat(c.level * 2)}
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground/90">الوسوم</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingTags(!isEditingTags)}
                    className="group hover:bg-primary/10 transition-all duration-300"
                  >
                    <Edit3 className="ml-1 w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                    {isEditingTags ? "إخفاء" : "تعديل"}
                  </Button>
                </div>

                {isEditingTags && (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="أضف وسم واضغط Enter"
                      className="flex-1 h-10 px-4 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                      dir="rtl"
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      size="sm"
                      className="group hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="ml-1 w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                      إضافة
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {localTags.map((t) => (
                    <span
                      key={t}
                      className="group px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105"
                    >
                      <span className="text-sm">{t}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="text-muted-foreground hover:text-destructive transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-foreground/90">صورة أو فيديو (اختياري)</label>
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-border/50 hover:border-primary/50 hover:bg-accent/5"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const f = e.dataTransfer.files?.[0]
                    onMediaChange(f)
                  }}
                >
                  {!mediaPreview ? (
                    <div className="text-center py-8">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">اسحب وأفلت الملف هنا أو</p>
                      <label className="inline-block px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105">
                        <span className="text-sm font-medium">اختر ملف</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => onMediaChange(e.target.files?.[0])}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-muted-foreground mt-3">حد الصورة: 5MB — حد الفيديو: 15MB</p>
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="rounded-xl overflow-hidden max-h-64">
                        {formData.mediaType === "image" ? (
                          <img
                            src={mediaPreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video src={mediaPreview} className="w-full h-full" controls />
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={removeMedia}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      >
                        <XCircle className="w-4 h-4 ml-1" />
                        إزالة
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Overview/Details */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/90">النظرة العامة *</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData((p) => ({ ...p, details: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 hover:border-primary/30 resize-none"
                  dir="rtl"
                />
                <div className="text-xs text-muted-foreground text-left">
                  {formData.details.trim().length}/{limits.detailsMax}
                </div>
              </div>
            </div>

            {isResearch && (
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <label className="text-sm font-medium text-foreground/90 mb-3 block">محتوى البحث *</label>
                <div
                  className="rounded-xl overflow-hidden border border-border/50 focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-300"
                  style={{ minHeight: "500px" }}
                >
                  {typeof window !== "undefined" && ReactQuill ? (
                    <ReactQuill
                      value={formData.description || ""}
                      onChange={(v) => setFormData((p) => ({ ...p, description: v }))}
                      modules={quillModules}
                      theme="snow"
                      className="h-full [&_.ql-container]:min-h-[450px] [&_.ql-editor]:min-h-[450px] [&_.ql-editor]:text-base [&_.ql-editor]:font-sans"
                      style={{ direction: "rtl" }}
                    />
                  ) : (
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      rows={20}
                      className="w-full h-full px-4 py-3 bg-background/50 border-0 focus:outline-none resize-none"
                      dir="rtl"
                    />
                  )}
                </div>
                <div className="text-xs text-muted-foreground text-left mt-2">
                  {stripHtml(formData.description || "").length}/{limits.descriptionMax}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                {errorMsg}
              </div>
            )}
            {saveError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                {String(saveError)}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="group hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all duration-300"
              >
                <XCircle className="ml-2 group-hover:rotate-90 transition-transform duration-300" />
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Save className="ml-2 group-hover:rotate-12 transition-transform duration-300" />
                {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

