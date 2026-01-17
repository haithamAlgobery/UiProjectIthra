
// "use client"

// import type React from "react"
// import { useEffect, useMemo, useRef, useState } from "react"
// import dynamic from "next/dynamic"
// import { useRouter } from "next/navigation"
// import { useDispatch, useSelector } from "react-redux"
// import { createContent } from "@/src/features/content"

// import { Eye, Tag, X, UploadCloud, ArrowLeft, ImageIcon, FileVideo, Sparkles, Send } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { Badge } from "@/components/ui/badge"
// import { Navbar2 } from "@/components/Navbar2"

// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
// import "react-quill/dist/quill.snow.css"

// export default function CreateResearchPage() {
//   const dispatch = useDispatch<any>()
//   const router = useRouter()
//   const categories = useSelector((s: any) => s.category?.data ?? [])

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
//     [],
//   )

//   const [formData, setFormData] = useState({
//     title: "",
//     categoryId: "",
//     tags: [] as string[],
//     details: "",
//     description: "",
//     mediaFile: null as File | null,
//     mediaType: "" as "" | "image" | "video",
//   })
//   const [currentTag, setCurrentTag] = useState("")
//   const [mediaPreview, setMediaPreview] = useState<string | null>(null)
//   const [errorMsg, setErrorMsg] = useState<string | null>(null)
//   const [isPublishing, setIsPublishing] = useState(false)
//   const [showPreview, setShowPreview] = useState(false)
//   const [dragging, setDragging] = useState(false)

//   const quillRef = useRef<any>(null)

//   useEffect(() => {
//     if (!formData.mediaFile) {
//       setMediaPreview(null)
//       return
//     }
//     const url = URL.createObjectURL(formData.mediaFile)
//     setMediaPreview(url)
//     return () => URL.revokeObjectURL(url)
//   }, [formData.mediaFile])

//   useEffect(() => {
//     const setRtl = () => {
//       const editor = quillRef.current?.getEditor?.()
//       if (!editor) return
//       try {
//         editor.root.setAttribute("dir", "rtl")
//         editor.root.style.textAlign = "right"
//         editor.on("text-change", () => {
//           editor.root.setAttribute("dir", "rtl")
//           editor.root.style.textAlign = "right"
//         })
//       } catch (err) {
//         console.warn("quill not ready", err)
//       }
//     }
//     setRtl()
//     const id = setTimeout(setRtl, 500)
//     return () => clearTimeout(id)
//   }, [])

//   const flattenCategories = (cats: any[]): { id: string; title: string; level: number }[] => {
//     const res: any[] = []
//     const walk = (list: any[], level = 0) => {
//       ;(list || []).forEach((c: any) => {
//         const id = c?.meCategory?.id ?? c?.id ?? String(Math.random())
//         const title = c?.meCategory?.title ?? c?.title ?? "غير مسمى"
//         res.push({ id, title, level })
//         if (Array.isArray(c.children) && c.children.length) walk(c.children, level + 1)
//       })
//     }
//     walk(cats)
//     return res
//   }

//   const addTag = () => {
//     const t = currentTag.trim()
//     if (!t) return
//     if (formData.tags.includes(t)) {
//       setCurrentTag("")
//       return
//     }
//     if (formData.tags.length >= limits.tagsMax) {
//       setErrorMsg(`الحد الأقصى للوسوم هو ${limits.tagsMax}`)
//       return
//     }
//     setFormData((p) => ({ ...p, tags: [...p.tags, t] }))
//     setCurrentTag("")
//     setErrorMsg(null)
//   }
//   const removeTag = (t: string) => setFormData((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }))

//   const onMediaChange = (f?: File | null) => {
//     if (!f) return
//     const isImage = f.type.startsWith("image/")
//     const isVideo = f.type.startsWith("video/")
//     if (!isImage && !isVideo) {
//       setErrorMsg("الملف غير مدعوم")
//       return
//     }
//     if (isImage && f.size > limits.imageMaxBytes) {
//       setErrorMsg("حجم الصورة أكبر من 5MB")
//       return
//     }
//     if (isVideo && f.size > limits.videoMaxBytes) {
//       setErrorMsg("حجم الفيديو أكبر من 15MB")
//       return
//     }
//     setFormData((p) => ({ ...p, mediaFile: f, mediaType: isImage ? "image" : "video" }))
//     setErrorMsg(null)
//   }
//   const removeMedia = () => setFormData((p) => ({ ...p, mediaFile: null, mediaType: "" }))

//   const onDrop = (e: React.DragEvent) => {
//     e.preventDefault()
//     setDragging(false)
//     const f = e.dataTransfer.files?.[0]
//     if (f) onMediaChange(f)
//   }
//   const onDragOver = (e: React.DragEvent) => {
//     e.preventDefault()
//     setDragging(true)
//   }
//   const onDragLeave = (e: React.DragEvent) => {
//     e.preventDefault()
//     setDragging(false)
//   }

//   const stripHtml = (s: string) => s.replace(/<(.|\n)*?>/g, "").trim()

//   const validate = (): string | null => {
//     const tlen = formData.title.trim().length
//     if (tlen < limits.titleMin || tlen > limits.titleMax)
//       return `العنوان بين ${limits.titleMin} و ${limits.titleMax} حرفاً.`
//     const details = formData.details.trim().length
//     if (details < limits.detailsMin || details > limits.detailsMax)
//       return `النظرة العامة بين ${limits.detailsMin} و ${limits.detailsMax} حرفاً.`
//     const description = stripHtml(formData.description || "")
//     if (description.length < limits.descriptionMin || description.length > limits.descriptionMax)
//       return `المحتوى بين ${limits.descriptionMin} و ${limits.descriptionMax} حرفاً.`
//     if (!formData.categoryId) return "القسم مطلوب."
//     if (formData.tags.length > limits.tagsMax) return `الحد الأقصى للوسوم ${limits.tagsMax}.`
//     return null
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setErrorMsg(null)
//     const v = validate()
//     if (v) {
//       setErrorMsg(v)
//       return
//     }
//     setIsPublishing(true)
//     try {
//       const payload: any = {
//         title: formData.title.trim(),
//         description: formData.description,
//         details: formData.details,
//         categoryId: formData.categoryId,
//         tags: formData.tags,
//         typeCode: "research",
//       }
//       if (formData.mediaFile) payload.file = formData.mediaFile

//       const created = await dispatch(createContent(payload)).unwrap()
//       const contentId = created?.id || created?.contentId || created?.data?.id || created?.data?.contentId
//       if (!contentId) {
//         console.error("createContent response:", created)
//         throw new Error("لم نستلم معرف المحتوى (id) من السيرفر.")
//       }
//       router.push(`/research/${contentId}/attachments`)
//     } catch (err: any) {
//       const msg = typeof err === "string" ? err : err?.message || JSON.stringify(err)
//       setErrorMsg(msg)
//       console.error(err)
//     } finally {
//       setIsPublishing(false)
//     }
//   }

//   const quillModules = useMemo(
//     () => ({
//       toolbar: {
//         container: [
//           [{ header: [1, 2, 3, 4, 5, 6, false] }],
//           [{ font: [] }],
//           [{ size: ["small", false, "large", "huge"] }],
//           ["bold", "italic", "underline", "strike"],
//           [{ color: [] }, { background: [] }],
//           [{ script: "sub" }, { script: "super" }],
//           [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
//           [{ direction: "rtl" }, { align: [] }],
//           ["blockquote", "code-block"],
//           ["link"],
//           ["clean"],
//         ],
//       },
//     }),
//     [],
//   )

//   const siteFont = "var(--font-sans, 'Cairo', 'Noto Naskh Arabic', system-ui)"

//   return (
//     <>
//       <Navbar2 />
//       <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: siteFont }}>
//         {/* Animated background */}
//         <div className="fixed inset-0 -z-10 bg-background">
//           <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
//           <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
//           <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
//         </div>

//         <div className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
//           <div className="container mx-auto px-4 py-3 flex items-center justify-between">
//             <Button
//               variant="ghost"
//               onClick={() => router.push("/")}
//               className="group gap-2 hover:gap-3 transition-all duration-300 rounded-full hover:bg-muted/50"
//             >
//               <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
//               <span>رجوع</span>
//             </Button>
//             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//               <Sparkles className="h-4 w-4 animate-pulse" />
//               <span>إنشاء بحث جديد</span>
//             </div>
//           </div>
//         </div>

//         <header className="container mx-auto px-4 pt-12 pb-8 text-center">
//           <h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance bg-gradient-to-l from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
//             شارك بحثك مع العالم
//           </h1>
//           <p className="text-sm text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
//             انشر أفكارك واكتشافاتك العلمية في منصة احترافية تصل إلى الباحثين والمهتمين حول العالم
//           </p>
//         </header>

//         <main className="container mx-auto px-4 pb-20">
//           <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
//             <div className="space-y-2">
//               <Label htmlFor="title" className="text-sm font-medium">
//                 عنوان البحث *
//               </Label>
//               <Input
//                 id="title"
//                 value={formData.title}
//                 onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
//                 placeholder="اكتب عنواناً واضحاً وجذاباً"
//                 required
//                 className="h-11 text-base bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:bg-card/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
//               />
//               <div className="flex justify-between text-xs text-muted-foreground">
//                 <span>الحد الأدنى: {limits.titleMin}</span>
//                 <span className={formData.title.trim().length > limits.titleMax ? "text-destructive" : ""}>
//                   {formData.title.trim().length} / {limits.titleMax}
//                 </span>
//               </div>
//             </div>

//             <div className="grid md:grid-cols-2 gap-5">
//               <div className="space-y-2">
//                 <Label htmlFor="category" className="text-sm font-medium">
//                   القسم العلمي *
//                 </Label>
//                 <select
//                   id="category"
//                   value={formData.categoryId}
//                   onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
//                   className="w-full h-11 px-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 outline-none text-sm shadow-sm hover:shadow-md"
//                   required
//                 >
//                   <option value="">اختر القسم</option>
//                   {flattenCategories(categories).map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {"\u00A0".repeat(c.level * 3)}
//                       {c.title}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="tags" className="text-sm font-medium">
//                   الكلمات المفتاحية
//                 </Label>
//                 <div className="flex gap-2">
//                   <Input
//                     id="tags"
//                     value={currentTag}
//                     onChange={(e) => setCurrentTag(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") {
//                         e.preventDefault()
//                         addTag()
//                       }
//                     }}
//                     placeholder="أضف وسماً"
//                     className="h-11 text-sm bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:bg-card/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
//                   />
//                   <Button
//                     type="button"
//                     onClick={addTag}
//                     size="icon"
//                     variant="ghost"
//                     className="group h-11 w-11 shrink-0 rounded-xl hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
//                   >
//                     <Tag className="h-4 w-4 transition-transform group-hover:rotate-12 group-hover:scale-110" />
//                   </Button>
//                 </div>
//                 {formData.tags.length > 0 && (
//                   <div className="flex flex-wrap gap-2 pt-1">
//                     {formData.tags.map((t) => (
//                       <Badge
//                         key={t}
//                         variant="secondary"
//                         className="group pl-1 pr-3 py-1 text-xs gap-1.5 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md"
//                       >
//                         <span>{t}</span>
//                         <button
//                           type="button"
//                           onClick={() => removeTag(t)}
//                           className="hover:bg-destructive/20 rounded-full p-0.5 transition-all duration-200 group-hover:rotate-90"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </Badge>
//                     ))}
//                   </div>
//                 )}
//                 <p className="text-xs text-muted-foreground">
//                   {formData.tags.length} / {limits.tagsMax}
//                 </p>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label className="text-sm font-medium">صورة أو فيديو توضيحي</Label>

//               {!formData.mediaFile ? (
//                 <div
//                   onDrop={onDrop}
//                   onDragOver={onDragOver}
//                   onDragLeave={onDragLeave}
//                   className={`
//                     group relative rounded-2xl p-10 
//                     bg-gradient-to-br from-card/40 via-card/60 to-card/40 backdrop-blur-sm
//                     border-2 border-dashed transition-all duration-500 ease-out
//                     shadow-sm hover:shadow-xl
//                     ${
//                       dragging
//                         ? "border-primary/70 bg-primary/5 scale-[1.02] shadow-2xl shadow-primary/20 ring-4 ring-primary/10"
//                         : "border-border/40 hover:border-primary/40 hover:bg-card/70"
//                     }
//                   `}
//                 >
//                   <div className="flex flex-col items-center gap-4 text-center">
//                     <div
//                       className={`
//                       p-4 rounded-2xl transition-all duration-500 ease-out
//                       ${dragging ? "bg-primary/15 scale-110 rotate-6 shadow-lg shadow-primary/20" : "bg-muted/30 group-hover:bg-primary/10 group-hover:scale-105"}
//                     `}
//                     >
//                       <UploadCloud
//                         className={`h-12 w-12 transition-all duration-500 ${dragging ? "text-primary animate-bounce" : "text-muted-foreground group-hover:text-primary"}`}
//                       />
//                     </div>

//                     <div className="space-y-1.5">
//                       <p className="text-base font-medium">اسحب الملف وأفلته هنا</p>
//                       <p className="text-xs text-muted-foreground">أو اختر من جهازك</p>
//                     </div>

//                     <label className="cursor-pointer">
//                       <input
//                         type="file"
//                         accept="image/*,video/*"
//                         className="hidden"
//                         onChange={(e) => onMediaChange(e.target.files?.[0] ?? null)}
//                       />
//                       <Button
//                         type="button"
//                         size="sm"
//                         variant="outline"
//                         className="group/btn gap-2 rounded-full hover:scale-105 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md bg-transparent"
//                         asChild
//                       >
//                         <span>
//                           <ImageIcon className="h-4 w-4 transition-transform group-hover/btn:scale-110 group-hover/btn:rotate-12" />
//                           اختيار ملف
//                         </span>
//                       </Button>
//                     </label>

//                     <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
//                       <span className="flex items-center gap-1.5">
//                         <ImageIcon className="h-3.5 w-3.5" />
//                         صور 5MB
//                       </span>
//                       <span className="text-border">•</span>
//                       <span className="flex items-center gap-1.5">
//                         <FileVideo className="h-3.5 w-3.5" />
//                         فيديو 15MB
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="relative rounded-2xl overflow-hidden bg-card/30 border border-border/40 group shadow-sm hover:shadow-xl transition-all duration-300">
//                   {formData.mediaType === "image" ? (
//                     <img src={mediaPreview! || "/placeholder.svg"} alt="معاينة" className="w-full h-64 object-cover" />
//                   ) : (
//                     <video src={mediaPreview!} controls className="w-full h-64" />
//                   )}
//                   <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
//                     <Button
//                       type="button"
//                       onClick={removeMedia}
//                       size="icon"
//                       variant="destructive"
//                       className="h-9 w-9 rounded-full shadow-lg hover:scale-110 transition-transform"
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </div>
//                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
//                     <p className="text-white text-sm font-medium truncate">{formData.mediaFile.name}</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="details" className="text-sm font-medium">
//                 نظرة عامة على البحث *
//               </Label>
//               <Textarea
//                 id="details"
//                 value={formData.details}
//                 onChange={(e) => setFormData((p) => ({ ...p, details: e.target.value }))}
//                 rows={4}
//                 placeholder="ملخص موجز يوضح الفكرة الرئيسية والأهداف..."
//                 className="resize-none bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:bg-card/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm leading-relaxed rounded-xl shadow-sm hover:shadow-md"
//                 required
//               />
//               <div className="flex justify-between text-xs text-muted-foreground">
//                 <span>الحد الأدنى: {limits.detailsMin}</span>
//                 <span className={formData.details.trim().length > limits.detailsMax ? "text-destructive" : ""}>
//                   {formData.details.trim().length} / {limits.detailsMax}
//                 </span>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label className="text-sm font-medium">محتوى البحث الكامل *</Label>
//               <p className="text-xs text-muted-foreground">اكتب بحثك بالتفصيل مع إمكانية التنسيق الكامل</p>

//               <div className="rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border/40 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300">
//                 {typeof window !== "undefined" && (
//                   <>
//                     <style>{`
//                       .premium-editor {
//                         font-family: ${siteFont} !important;
//                       }
//                       .premium-editor .ql-container {
//                         direction: rtl !important;
//                         font-family: ${siteFont} !important;
//                         min-height: 500px;
//                         border: none;
//                       }
//                       .premium-editor .ql-editor {
//                         direction: rtl !important;
//                         text-align: right !important;
//                         font-family: ${siteFont} !important;
//                         font-size: 16px;
//                         line-height: 1.8;
//                         padding: 24px 28px;
//                         min-height: 500px;
//                         color: hsl(var(--foreground));
//                       }
//                       .premium-editor .ql-editor.ql-blank::before {
//                         right: 28px;
//                         left: auto;
//                         font-style: normal;
//                         color: hsl(var(--muted-foreground));
//                         opacity: 0.5;
//                       }
//                       .premium-editor .ql-toolbar {
//                         direction: ltr;
//                         border: none;
//                         border-bottom: 1px solid hsl(var(--border) / 0.3);
//                         background: hsl(var(--muted) / 0.15);
//                         padding: 12px 16px;
//                         backdrop-filter: blur(8px);
//                       }
//                       .premium-editor .ql-toolbar button {
//                         border-radius: 8px;
//                         transition: all 0.3s ease;
//                         width: 32px;
//                         height: 32px;
//                       }
//                       .premium-editor .ql-toolbar button:hover {
//                         background: hsl(var(--primary) / 0.1);
//                         transform: scale(1.05);
//                       }
//                       .premium-editor .ql-toolbar button.ql-active {
//                         background: hsl(var(--primary) / 0.15);
//                         color: hsl(var(--primary));
//                         box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
//                       }
//                       .premium-editor .ql-stroke {
//                         stroke: hsl(var(--foreground) / 0.6);
//                         transition: stroke 0.3s;
//                       }
//                       .premium-editor .ql-fill {
//                         fill: hsl(var(--foreground) / 0.6);
//                         transition: fill 0.3s;
//                       }
//                       .premium-editor .ql-picker-label {
//                         color: hsl(var(--foreground) / 0.6);
//                         transition: color 0.3s;
//                       }
//                       .premium-editor .ql-toolbar button:hover .ql-stroke {
//                         stroke: hsl(var(--primary));
//                       }
//                       .premium-editor .ql-toolbar button:hover .ql-fill {
//                         fill: hsl(var(--primary));
//                       }
//                       .premium-editor .ql-editor h1,
//                       .premium-editor .ql-editor h2,
//                       .premium-editor .ql-editor h3 {
//                         font-weight: 700;
//                         margin-top: 1.5em;
//                         margin-bottom: 0.5em;
//                         color: hsl(var(--foreground));
//                       }
//                       .premium-editor .ql-editor p {
//                         margin-bottom: 1em;
//                       }
//                       .premium-editor .ql-editor blockquote {
//                         border-right: 4px solid hsl(var(--primary) / 0.4);
//                         padding-right: 20px;
//                         margin: 1.5em 0;
//                         color: hsl(var(--muted-foreground));
//                         font-style: italic;
//                       }
//                       .premium-editor .ql-editor ul,
//                       .premium-editor .ql-editor ol {
//                         padding-right: 1.5em;
//                       }
//                       .premium-editor .ql-editor a {
//                         color: hsl(var(--primary));
//                         text-decoration: underline;
//                       }
//                     `}</style>
//                     <ReactQuill
//                       ref={quillRef}
//                       value={formData.description}
//                       onChange={(v: string) => setFormData((p) => ({ ...p, description: v }))}
//                       modules={quillModules}
//                       placeholder="ابدأ الكتابة هنا... استخدم أدوات التنسيق لتحسين مظهر بحثك"
//                       theme="snow"
//                       className="premium-editor"
//                     />
//                   </>
//                 )}
//               </div>

//               <div className="flex justify-between text-xs text-muted-foreground">
//                 <span>الحد الأدنى: {limits.descriptionMin}</span>
//                 <span
//                   className={stripHtml(formData.description).length > limits.descriptionMax ? "text-destructive" : ""}
//                 >
//                   {stripHtml(formData.description).length} / {limits.descriptionMax}
//                 </span>
//               </div>
//             </div>

//             {errorMsg && (
//               <div className="rounded-xl p-4 bg-destructive/10 border border-destructive/30 backdrop-blur-sm shadow-sm">
//                 <div className="flex items-start gap-3">
//                   <div className="shrink-0 w-1 h-full bg-destructive rounded-full" />
//                   <p className="text-sm text-destructive leading-relaxed">{errorMsg}</p>
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-border/30">
//               <Button
//                 type="button"
//                 variant="ghost"
//                 onClick={() => router.push("/")}
//                 disabled={isPublishing}
//                 className="group rounded-xl hover:bg-muted/50 transition-all duration-300 shadow-sm hover:shadow-md"
//               >
//                 <span className="transition-transform group-hover:scale-95">إلغاء</span>
//               </Button>

//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => setShowPreview(true)}
//                 disabled={isPublishing}
//                 className="group gap-2 rounded-xl hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md"
//               >
//                 <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
//                 <span>معاينة</span>
//               </Button>

//               <Button
//                 type="submit"
//                 disabled={isPublishing}
//                 className="group gap-2 min-w-[140px] rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 bg-primary text-primary-foreground"
//               >
//                 {isPublishing ? (
//                   <>
//                     <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
//                     <span>جارٍ النشر...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
//                     <span>نشر البحث</span>
//                   </>
//                 )}
//               </Button>
//             </div>
//           </form>
//         </main>

//         {/* Preview modal - unchanged */}
//         {showPreview && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg p-4 animate-in fade-in duration-300">
//             <div className="w-full max-w-3xl bg-card rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 border border-border/40">
//               <div className="flex items-center justify-between p-5 border-b border-border/30 bg-muted/10">
//                 <div>
//                   <h3 className="text-lg font-bold">معاينة البحث</h3>
//                   <p className="text-xs text-muted-foreground mt-1">هكذا سيظهر بحثك للقراء</p>
//                 </div>
//                 <Button
//                   type="button"
//                   onClick={() => setShowPreview(false)}
//                   size="icon"
//                   variant="ghost"
//                   className="rounded-full h-10 w-10 hover:bg-muted/50 transition-all"
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>

//               <div className="overflow-y-auto p-6 space-y-5">
//                 <div className="space-y-2">
//                   <h1 className="text-2xl font-bold text-balance">{formData.title || "عنوان البحث"}</h1>
//                   <p className="text-xs text-muted-foreground">
//                     {flattenCategories(categories).find((c) => c.id === formData.categoryId)?.title ?? "القسم"}
//                   </p>
//                 </div>

//                 {mediaPreview && (
//                   <div className="rounded-xl overflow-hidden border border-border/40">
//                     {formData.mediaType === "image" ? (
//                       <img src={mediaPreview || "/placeholder.svg"} alt="معاينة" className="w-full h-64 object-cover" />
//                     ) : (
//                       <video src={mediaPreview} controls className="w-full h-64" />
//                     )}
//                   </div>
//                 )}

//                 <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
//                   <h4 className="text-sm font-semibold mb-2">نظرة عامة</h4>
//                   <p className="text-sm text-muted-foreground leading-relaxed">
//                     {formData.details || "لا توجد نظرة عامة بعد"}
//                   </p>
//                 </div>

//                 {formData.tags.length > 0 && (
//                   <div className="flex flex-wrap gap-2">
//                     {formData.tags.map((t) => (
//                       <Badge key={t} variant="secondary" className="text-xs rounded-full">
//                         {t}
//                       </Badge>
//                     ))}
//                   </div>
//                 )}

//                 <div className="prose prose-sm max-w-none dark:prose-invert">
//                   <div
//                     dangerouslySetInnerHTML={{
//                       __html: formData.description || "<p class='text-muted-foreground italic'>لا يوجد محتوى بعد</p>",
//                     }}
//                   />
//                 </div>
//               </div>

//               <div className="flex items-center justify-end gap-2 p-4 border-t border-border/30 bg-muted/10">
//                 <Button type="button" onClick={() => setShowPreview(false)} className="rounded-xl">
//                   إغلاق
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   )
// }



"use client"
import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { createContent } from "@/src/features/content"
import {
  Eye,
  Tag,
  X,
  UploadCloud,
  ArrowLeft,
  ImageIcon,
  FileVideo,
  Sparkles,
  Send,
  LayoutTemplate,
  Type,
  AlignRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Navbar2 } from "@/components/Navbar2"

// استدعاء المحرر ديناميكياً
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

export default function CreateResearchPage() {
  // ==================== Logic Section (Unchanged) ====================
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

  // Improved RTL Enforcement Logic
  useEffect(() => {
    const setRtl = () => {
      const editor = quillRef.current?.getEditor?.()
      if (!editor) return
      try {
        editor.root.setAttribute("dir", "rtl")
        editor.root.style.textAlign = "right"
        editor.root.style.direction = "rtl"
        
        // Force font family
        editor.root.style.fontFamily = "var(--font-sans, 'Cairo', 'Noto Naskh Arabic', sans-serif)"

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

  // ==================== Enhanced Editor Config ====================
  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, false] }], // Custom headers
          [{ font: [] }], // Fonts
          ["bold", "italic", "underline", "strike"], // Formatting
          [{ color: [] }, { background: [] }], // Colors
          [{ align: [] }, { direction: "rtl" }], // Alignment & Direction
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }], // Lists
          ["link", "blockquote", "code-block"], // Blocks
          ["clean"], // Clear format
        ],
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [],
  )

  // Use system font to match the design
  const siteFont = "var(--font-sans, 'Cairo', 'Noto Naskh Arabic', system-ui)"

  // ==================== UI Render Section ====================
  return (
    <>
      <Navbar2 />
      <div className="min-h-screen relative overflow-hidden bg-background" style={{ fontFamily: siteFont }}>
        {/* Animated Ambient Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] opacity-70 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] opacity-70" />
        </div>

        {/* Top Action Bar */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-30 supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="group gap-2 hover:bg-muted/60 rounded-full px-4"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">رجوع</span>
            </Button>
            
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full border border-border/40">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-foreground/80">وضع الإنشاء المتقدم</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
          {/* Header Section */}
          <header className="mb-10 text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent pb-2">
              إنشاء بحث جديد
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              شارك معرفتك واكتشافاتك مع المجتمع العلمي. استخدم الأدوات أدناه لصياغة بحث احترافي.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Card 1: Basic Info */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6 border-b border-border/30 pb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <LayoutTemplate className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">المعلومات الأساسية</h2>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="title" className="text-base font-semibold">
                    عنوان البحث <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                      placeholder="مثال: تأثير الذكاء الاصطناعي على التعليم الطبي"
                      className="h-12 text-lg px-4 bg-background/50 border-border/60 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                      required
                    />
                    <div className="absolute left-3 top-3.5 text-xs text-muted-foreground font-medium bg-background/80 px-1 rounded">
                      {formData.title.trim().length}/{limits.titleMax}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="category" className="text-base font-semibold">
                      القسم العلمي <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <select
                        id="category"
                        value={formData.categoryId}
                        onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                        className="w-full h-12 px-4 rounded-xl bg-background/50 border border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="">اختر القسم المناسب</option>
                        {flattenCategories(categories).map((c) => (
                          <option key={c.id} value={c.id}>
                            {"\u00A0".repeat(c.level * 3)} {c.title}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="tags" className="text-base font-semibold">الكلمات المفتاحية</Label>
                    <div className="relative flex gap-2">
                      <Input
                        id="tags"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        placeholder="اضغط Enter لإضافة وسم"
                        className="h-12 bg-background/50 border-border/60 rounded-xl"
                      />
                      <Button
                        type="button"
                        onClick={addTag}
                        variant="secondary"
                        className="h-12 w-12 rounded-xl shrink-0"
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.tags.map((t) => (
                          <Badge
                            key={t}
                            variant="outline"
                            className="px-3 py-1.5 text-sm gap-2 rounded-lg bg-primary/5 hover:bg-primary/10 border-primary/20 transition-colors"
                          >
                            {t}
                            <button
                              type="button"
                              onClick={() => removeTag(t)}
                              className="hover:text-destructive transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Media Upload */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-border/30 pb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                </div>
                <h2 className="text-xl font-bold">الوسائط المرفقة</h2>
              </div>

              {!formData.mediaFile ? (
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={`
                    relative group cursor-pointer
                    border-3 border-dashed rounded-3xl p-12
                    flex flex-col items-center justify-center text-center
                    transition-all duration-300 ease-in-out
                    ${dragging 
                      ? "border-primary bg-primary/5 scale-[1.01]" 
                      : "border-border/40 hover:border-primary/50 hover:bg-muted/30"
                    }
                  `}
                >
                  <div className="h-20 w-20 bg-background rounded-full shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud className={`h-10 w-10 ${dragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"} transition-colors`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">اسحب وأفلت الملف هنا</h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                    يدعم الصور (JPEG, PNG) والفيديو (MP4). الحد الأقصى للصور 5MB وللفيديو 15MB
                  </p>
                  
                  <label className="relative">
                    <Button variant="default" className="rounded-full px-8 cursor-pointer pointer-events-none">
                      تصفح ملفاتك
                    </Button>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => onMediaChange(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              ) : (
                <div className="relative rounded-3xl overflow-hidden bg-black/5 border border-border/50 group">
                  <div className="aspect-video w-full relative">
                    {formData.mediaType === "image" ? (
                      <img src={mediaPreview!} alt="preview" className="w-full h-full object-contain bg-black/40 backdrop-blur-xl" />
                    ) : (
                      <video src={mediaPreview!} controls className="w-full h-full bg-black" />
                    )}
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button
                      type="button"
                      onClick={removeMedia}
                      variant="destructive"
                      size="sm"
                      className="rounded-full shadow-lg"
                    >
                      <X className="h-4 w-4 ml-1" />
                      حذف الملف
                    </Button>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <p className="text-sm font-medium truncate">{formData.mediaFile.name}</p>
                    <p className="text-xs opacity-70">{(formData.mediaFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Abstract */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-border/30 pb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <AlignRight className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">ملخص البحث</h2>
                  <p className="text-sm text-muted-foreground">نبذة مختصرة تظهر في نتائج البحث (SEO)</p>
                </div>
              </div>
              
              <Textarea
                value={formData.details}
                onChange={(e) => setFormData((p) => ({ ...p, details: e.target.value }))}
                rows={4}
                placeholder="اكتب ملخصاً جذاباً يوضح أهمية بحثك..."
                className="resize-none text-base leading-relaxed bg-background/50 border-border/60 focus:border-primary rounded-xl p-4"
              />
               <div className="flex justify-end mt-2 text-xs text-muted-foreground">
                  <span>{formData.details.length}/{limits.detailsMax}</span>
               </div>
            </div>

            {/* Card 4: The Editor (Main Event) */}
            <div className="bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden flex flex-col">
              <div className="bg-muted/30 p-4 border-b border-border/50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Type className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">محتوى البحث الكامل</h2>
                      <p className="text-xs text-muted-foreground hidden md:block">استخدم أدوات التنسيق لجعل بحثك احترافياً</p>
                    </div>
                 </div>
              </div>

              {/* Editor Container with Custom Styles */}
              <div className="relative bg-background min-h-[500px]">
                {/* CSS Injection for the Editor */}
                <style jsx global>{`
                  /* تخصيص شريط الأدوات */
                  .ql-toolbar.ql-snow {
                    border: none !important;
                    border-bottom: 1px solid hsl(var(--border) / 0.5) !important;
                    background: hsl(var(--muted) / 0.2);
                    padding: 12px !important;
                    position: sticky;
                    top: 60px; /* Adjust based on navbar height */
                    z-index: 10;
                    backdrop-filter: blur(8px);
                  }
                  .ql-toolbar .ql-formats {
                    margin-right: 15px !important;
                  }
                  
                  /* تخصيص منطقة الكتابة */
                  .ql-container.ql-snow {
                    border: none !important;
                    font-family: ${siteFont} !important;
                    font-size: 1.125rem; /* 18px */
                  }
                  
                  .ql-editor {
                    min-height: 500px;
                    padding: 40px 50px !important;
                    line-height: 2 !important;
                    direction: rtl !important;
                    text-align: right !important;
                    color: hsl(var(--foreground));
                  }
                  
                  .ql-editor.ql-blank::before {
                    right: 50px !important;
                    left: auto !important;
                    font-style: normal !important;
                    color: hsl(var(--muted-foreground));
                    opacity: 0.6;
                  }

                  /* تحسينات العناوين والنصوص داخل المحرر */
                  .ql-editor h1, .ql-editor h2, .ql-editor h3 {
                    font-weight: 800 !important;
                    margin-top: 1.5em !important;
                    margin-bottom: 0.5em !important;
                    line-height: 1.3 !important;
                  }
                  .ql-editor h1 { font-size: 2.25em !important; color: hsl(var(--primary)); }
                  .ql-editor h2 { font-size: 1.8em !important; }
                  .ql-editor h3 { font-size: 1.5em !important; }
                  
                  .ql-editor blockquote {
                    border-right: 4px solid hsl(var(--primary)) !important;
                    border-left: none !important;
                    background: hsl(var(--primary) / 0.05);
                    padding: 1rem 1.5rem !important;
                    border-radius: 8px;
                    font-style: italic;
                  }
                  
                  .ql-editor img {
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    margin: 1.5rem auto;
                    display: block;
                  }

                  /* Responsive Mobile padding */
                  @media (max-width: 768px) {
                    .ql-editor { padding: 20px !important; }
                    .ql-editor.ql-blank::before { right: 20px !important; }
                  }
                `}</style>
                
                {typeof window !== "undefined" && (
                  <ReactQuill
                    ref={quillRef}
                    value={formData.description}
                    onChange={(v: string) => setFormData((p) => ({ ...p, description: v }))}
                    modules={quillModules}
                    placeholder="ابدأ بكتابة بحثك هنا... يمكنك إضافة عناوين، صور، وقوائم."
                    theme="snow"
                  />
                )}
              </div>
              
              <div className="bg-muted/20 border-t border-border/50 px-4 py-2 flex justify-between items-center text-xs text-muted-foreground">
                <span>يتم الحفظ تلقائياً في الذاكرة المؤقتة</span>
                <span className={stripHtml(formData.description).length > limits.descriptionMax ? "text-destructive" : ""}>
                   {stripHtml(formData.description).length} حرف
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3 animate-in shake">
                 <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                 <p className="font-medium">{errorMsg}</p>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-4 pt-4 pb-20">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/")}
                disabled={isPublishing}
                className="w-full md:w-auto rounded-xl h-12 text-muted-foreground hover:text-foreground"
              >
                إلغاء الأمر
              </Button>
              
              <div className="flex gap-4 w-full md:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  disabled={isPublishing}
                  className="flex-1 md:flex-none rounded-xl h-12 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  معاينة
                </Button>
                
                <Button
                  type="submit"
                  disabled={isPublishing}
                  className="flex-1 md:flex-none rounded-xl h-12 gap-2 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1"
                >
                  {isPublishing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      جاري النشر...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 rtl:rotate-180" />
                      نشر البحث
                    </>
                  )}
                </Button>
              </div>
            </div>

          </form>
        </div>

        {/* ==================== Preview Modal (Improved) ==================== */}
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowPreview(false)} />
            <div className="relative w-full max-w-4xl bg-card rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-5 border border-border/50">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg">معاينة البحث</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto p-6 md:p-10 space-y-8 bg-background scrollbar-thin scrollbar-thumb-primary/20">
                {/* Hero */}
                <div className="space-y-4 text-center border-b border-border/40 pb-8">
                  <Badge variant="outline" className="mb-2 border-primary/30 text-primary bg-primary/5 px-3 py-1">
                     {flattenCategories(categories).find((c) => c.id === formData.categoryId)?.title ?? "قسم عام"}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-balance">
                    {formData.title || "عنوان البحث التجريبي"}
                  </h1>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      {formData.tags.map((t) => (
                        <span key={t} className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Media */}
                {mediaPreview && (
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-border/40 bg-muted">
                    {formData.mediaType === "image" ? (
                      <img src={mediaPreview} alt="معاينة" className="w-full max-h-[500px] object-contain mx-auto" />
                    ) : (
                      <video src={mediaPreview} controls className="w-full max-h-[500px]" />
                    )}
                  </div>
                )}

                {/* Details Box */}
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-xl">
                  <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    نظرة عامة
                  </h4>
                  <p className="text-foreground/90 leading-relaxed">
                    {formData.details || "لا يوجد ملخص متاح."}
                  </p>
                </div>

                {/* Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary">
                  <div dangerouslySetInnerHTML={{ __html: formData.description || "<p class='text-center text-muted-foreground italic py-10'>لم يتم إضافة محتوى بعد</p>" }} />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border/40 bg-muted/30 flex justify-end">
                <Button onClick={() => setShowPreview(false)} className="rounded-xl px-6">
                  إغلاق المعاينة
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}