
"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter, useParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchContentById, updateContentById, clearContent } from "@/src/features/editableContentSlice"
import { fetchTagsByContentId, updateTagsByContentId } from "@/src/features/tagsSlice"
import { ArrowRight, Upload, X, Save, XCircle, Edit3, Plus, ExternalLink, LayoutGrid, Type, FileText, Image as ImageIcon, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import useDataBasic from "@/src/hooks/useDataBasic"
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
  const { urlRoot } = useDataBasic()
 const IMG_BASE = urlRoot + "/UpLoadFileContent"
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
    <div className="min-h-screen bg-muted/10 relative pb-20">
      {/* Header Bar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="rounded-full hover:bg-muted"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold hidden sm:block">تعديل المحتوى</h1>
          </div>
          <div className="flex items-center gap-3">
             {isResearch && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/research/${id}/attachments`)}
                  className="gap-2 hidden sm:flex"
                >
                  <ExternalLink className="w-4 h-4" />
                  المرفقات
                </Button>
             )}
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              {content?.types?.title || "تعديل البيانات"}
            </h1>
            <p className="text-muted-foreground">
              قم بتحديث البيانات أدناه. التغييرات ستنعكس فوراً بعد الحفظ.
            </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-muted-foreground animate-pulse">جاري تحميل البيانات...</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-xl text-destructive text-center flex flex-col items-center">
             <XCircle className="w-10 h-10 mb-2 opacity-50"/>
            خطأ: {String(error)}
          </div>
        )}

        {!loading && content && (
          <form onSubmit={handleUpdateContent} className="space-y-8">
            
            {/* Grid Layout for Main Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card: Basic Info */}
              <div className="bg-card border border-border/50 rounded-xl shadow-sm p-6 space-y-6 md:col-span-2">
                <div className="flex items-center gap-2 pb-4 border-b border-border/50">
                    <Type className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-lg">البيانات الأساسية</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                         العنوان <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                        <input
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                        className="w-full h-11 px-4 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        dir="rtl"
                        placeholder="أدخل عنواناً مميزاً..."
                        />
                         <div className="absolute left-3 top-3 text-[10px] text-muted-foreground/70 font-mono bg-background px-1">
                            {formData.title.trim().length}/{limits.titleMax}
                        </div>
                    </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                        القسم <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                         <LayoutGrid className="absolute right-3 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                        className="w-full h-11 pr-10 pl-4 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                        dir="rtl"
                        >
                        <option value="">-- اختر القسم المناسب --</option>
                        {flattenCategories(categories).map((c) => (
                            <option key={c.id} value={c.id}>
                            {"\u00A0".repeat(c.level * 4)}
                            {c.title}
                            </option>
                        ))}
                        </select>
                    </div>
                    </div>
                </div>

                {/* Tags Section */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            الوسوم
                        </label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingTags(!isEditingTags)}
                            className="h-8 text-xs hover:bg-primary/5 hover:text-primary"
                        >
                            <Edit3 className="w-3.5 h-3.5 ml-1.5" />
                            {isEditingTags ? "إنهاء التعديل" : "إدارة الوسوم"}
                        </Button>
                    </div>

                    {isEditingTags && (
                    <div className="flex gap-2 animate-in slide-in-from-top-1 fade-in duration-200">
                        <input
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        placeholder="اكتب الوسم ثم اضغط Enter"
                        className="flex-1 h-10 px-4 bg-muted/30 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        dir="rtl"
                        autoFocus
                        />
                        <Button type="button" onClick={addTag} size="sm" className="px-4">
                        <Plus className="w-4 h-4 ml-1" /> إضافة
                        </Button>
                    </div>
                    )}

                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-lg bg-muted/20 border border-dashed border-border/60">
                         {localTags.length === 0 && !isEditingTags && (
                             <span className="text-muted-foreground text-sm py-1 px-1">لا توجد وسوم مضافة.</span>
                         )}
                        {localTags.map((t) => (
                        <div
                            key={t}
                            className="group inline-flex items-center gap-1.5 px-3 py-1 bg-background border border-border rounded-full text-sm shadow-sm transition-all hover:border-primary/50"
                        >
                            <span className="text-foreground/80 font-medium">#{t}</span>
                            <button
                            type="button"
                            onClick={() => removeTag(t)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full p-0.5 transition-colors"
                            >
                            <X className="w-3 h-3" />
                            </button>
                        </div>
                        ))}
                    </div>
                </div>
              </div>

               {/* Card: Overview & Media */}
               <div className="bg-card border border-border/50 rounded-xl shadow-sm p-6 space-y-6 md:col-span-2">
                    <div className="flex items-center gap-2 pb-4 border-b border-border/50">
                        <FileText className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-lg">التفاصيل والوسائط</h2>
                    </div>

                    {/* Overview */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1">
                            نظرة عامة (ملخص) <span className="text-destructive">*</span>
                        </label>
                        <textarea
                            value={formData.details}
                            onChange={(e) => setFormData((p) => ({ ...p, details: e.target.value }))}
                            rows={4}
                            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
                            dir="rtl"
                            placeholder="اكتب وصفاً مختصراً يظهر في البطاقات..."
                        />
                         <div className="text-xs text-muted-foreground text-left">
                            {formData.details.trim().length}/{limits.detailsMax}
                        </div>
                    </div>

                    {/* Media Upload */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            الصورة البارزة أو الفيديو
                        </label>
                        
                        <div
                        className={`relative group border-2 border-dashed rounded-xl transition-all duration-300 overflow-hidden ${
                            isDragging
                            ? "border-primary bg-primary/5 scale-[1.01]"
                            : "border-border/60 hover:border-primary/50 hover:bg-muted/30"
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
                            <div className="flex flex-col items-center justify-center py-10 px-4 cursor-pointer text-center">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-medium mb-1">اسحب وأفلت الملف هنا</p>
                                <p className="text-xs text-muted-foreground mb-4">أو اضغط للاختيار من جهازك</p>
                                
                                <label className="cursor-pointer">
                                    <span className="px-4 py-2 bg-background border border-input rounded-md shadow-sm text-xs hover:bg-accent transition-colors">
                                        تصفح الملفات
                                    </span>
                                    <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={(e) => onMediaChange(e.target.files?.[0])}
                                    className="hidden"
                                    />
                                </label>
                                <p className="text-[10px] text-muted-foreground/60 mt-4 font-mono">
                                    IMG &lt; 5MB | VIDEO &lt; 15MB
                                </p>
                            </div>
                        ) : (
                            <div className="relative w-full h-full bg-black/5 min-h-[250px] flex items-center justify-center">
                            {formData.mediaType === "image" ? (
                                <img
                                src={IMG_BASE +"/"+ mediaPreview || "/placeholder.svg"}
                                alt="Preview"
                                className="w-full h-full max-h-[400px] object-contain"
                                />
                            ) : (
                                <video src={IMG_BASE +"/"+ mediaPreview } className="w-full max-h-[400px]" controls />
                            )}
                            
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    type="button"
                                    onClick={removeMedia}
                                    variant="destructive"
                                    size="sm"
                                    className="shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                                >
                                    <XCircle className="w-4 h-4 ml-2" />
                                    إزالة الملف
                                </Button>
                            </div>
                            </div>
                        )}
                        </div>
                    </div>
               </div>
            </div>

            {/* Editor Section (Full Width) */}
            {isResearch && (
              <div className="bg-card border border-border/50 rounded-xl shadow-sm p-6 space-y-4">
                 <div className="flex items-center gap-2 pb-4 border-b border-border/50">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-lg">محتوى البحث التفصيلي</h2>
                </div>
                
                <div
                  className="rounded-lg overflow-hidden border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all bg-background"
                >
                    {/* Custom styling wrapper for Quill to match Shadcn Theme */}
                   <div className="[&_.ql-toolbar]:bg-muted/30 [&_.ql-toolbar]:border-b-border/50 [&_.ql-toolbar]:border-0 [&_.ql-container]:border-0 [&_.ql-editor]:text-base [&_.ql-editor]:min-h-[500px] [&_.ql-editor]:font-sans">
                        {typeof window !== "undefined" && ReactQuill ? (
                            <ReactQuill
                            value={formData.description || ""}
                            onChange={(v) => setFormData((p) => ({ ...p, description: v }))}
                            modules={quillModules}
                            theme="snow"
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
                            className="w-full h-full px-6 py-4 bg-background border-0 focus:outline-none resize-none"
                            dir="rtl"
                            />
                        )}
                   </div>
                </div>
                <div className="text-xs text-muted-foreground text-left px-1">
                  {stripHtml(formData.description || "").length}/{limits.descriptionMax} حرف
                </div>
              </div>
            )}

            {/* Feedback Messages */}
            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 text-destructive animate-in slide-in-from-top-2">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{errorMsg}</p>
              </div>
            )}
            {saveError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 text-destructive animate-in slide-in-from-top-2">
                 <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                 <p className="text-sm font-medium">{String(saveError)}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6 border-t border-border/40">
              <Button
                type="submit"
                disabled={saving}
                size="lg"
                className="min-w-[160px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                {saving ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
                        جاري الحفظ...
                    </>
                ) : (
                    <>
                        <Save className="ml-2 w-4 h-4" />
                        حفظ التعديلات
                    </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                className="hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
              >
                إلغاء
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}