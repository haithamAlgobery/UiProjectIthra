// components/post-modal.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Upload, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    details: string;
    categoryId: string;
    tags: string[];
    file?: File | null;
    typeCode?: string;
    description?: string;
  }) => Promise<void>;
}

export function PostModal({ isOpen, onClose, onSubmit }: PostModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    details: "",
    categoryId: "",
    tags: [] as string[],
  });
  const categories = useSelector((state: any) => state.category?.data ?? []);

  const [currentTag, setCurrentTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings] = useState({
    minTitle: 3,
    maxTitleLength: 200,
    minDetails: 5,
    maxDetails: 10000,
    maxTags: 7,
    maxImageMB: 4,
    maxVideoMB: 10,
  });

  // file state + preview
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);

  // server/user errors
  const [serverError, setServerError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // reset
      setFormData({ title: "", details: "", categoryId: "", tags: [] });
      setCurrentTag("");
      setIsSubmitting(false);
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
      setFile(null);
      setFilePreviewUrl(null);
      setFileType(null);
      setServerError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (f: File | null) => {
    if (!f) return;
    const isImage = f.type.startsWith("image/");
    const isVideo = f.type.startsWith("video/");
    if (!isImage && !isVideo) {
      setServerError("نوع الملف غير مدعوم — الرجاء رفع صورة (PNG/JPG/GIF) أو فيديو (MP4).");
      return;
    }
    const sizeMB = f.size / (1024 * 1024);
    if (isImage && sizeMB > settings.maxImageMB) {
      setServerError(`حجم الصورة يجب أن لا يتجاوز ${settings.maxImageMB} MB.`);
      return;
    }
    if (isVideo && sizeMB > settings.maxVideoMB) {
      setServerError(`حجم الفيديو يجب أن لا يتجاوز ${settings.maxVideoMB} MB.`);
      return;
    }
    setFile(f);
    setFileType(isImage ? "image" : "video");
    setServerError(null);
    try {
      const url = URL.createObjectURL(f);
      setFilePreviewUrl(url);
    } catch {
      setFilePreviewUrl(null);
    }
  };

  const onDrop = (ev: React.DragEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    const f = ev.dataTransfer.files?.[0] ?? null;
    handleFileSelected(f);
  };
  const onDragOver = (ev: React.DragEvent) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "copy";
  };

  const handleAddTag = () => {
    const t = currentTag.trim();
    if (!t) return;
    if (formData.tags.includes(t)) {
      setCurrentTag("");
      return;
    }
    if (formData.tags.length >= settings.maxTags) {
      setServerError(`الحد الأقصى للوسوم هو ${settings.maxTags}.`);
      return;
    }
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, t] }));
    setCurrentTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }));
  };

  const extractErrorMessage = (err: any) => {
    if (!err) return "فشل إنشاء المنشور";
    // if thrown string
    if (typeof err === "string") return err;
    // if axios rejectWithValue (string) or object
    if (err?.message && typeof err.message === "string") return err.message;
    if (err?.payload && typeof err.payload === "string") return err.payload;
    if (err?.response?.data) {
      const d = err.response.data;
      if (typeof d === "string") return d;
      if (d?.message) return d.message;
      try {
        return JSON.stringify(d);
      } catch {
        return "فشل الاتصال بالخادم";
      }
    }
    try {
      return JSON.stringify(err);
    } catch {
      return "فشل إنشاء المنشور";
    }
  };

  const validateBeforeSend = (): { ok: boolean; message?: string } => {
    const titleLen = formData.title.trim().length;
    const detailsLen = formData.details.trim().length;
    if (titleLen < settings.minTitle) return { ok: false, message: `العنوان يجب أن يحتوي على الأقل ${settings.minTitle} أحرف.` };
    if (titleLen > settings.maxTitleLength) return { ok: false, message: `العنوان يجب ألا يتجاوز ${settings.maxTitleLength} حرف.` };
    if (detailsLen < settings.minDetails) return { ok: false, message: `التفاصيل يجب أن تحتوي على الأقل ${settings.minDetails} أحرف.` };
    if (detailsLen > settings.maxDetails) return { ok: false, message: `التفاصيل يجب ألا تتجاوز ${settings.maxDetails} حرف.` };
    if (!formData.categoryId) return { ok: false, message: "الرجاء اختيار القسم." };
    if (formData.tags.length > settings.maxTags) return { ok: false, message: `الوسوم لا تتجاوز ${settings.maxTags}.` };
    if (file) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const sizeMB = file.size / (1024 * 1024);
      if (!isImage && !isVideo) return { ok: false, message: "نوع الملف غير مدعوم." };
      if (isImage && sizeMB > settings.maxImageMB) return { ok: false, message: `حجم الصورة أكبر من ${settings.maxImageMB} MB.` };
      if (isVideo && sizeMB > settings.maxVideoMB) return { ok: false, message: `حجم الفيديو أكبر من ${settings.maxVideoMB} MB.` };
    }
    return { ok: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setServerError(null);

    const validation = validateBeforeSend();
    if (!validation.ok) {
      setServerError(validation.message ?? "التحقق فشل");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: formData.title.trim(),
        details: formData.details.trim(),
        categoryId: formData.categoryId,
        tags: formData.tags,
        file: file ?? undefined,
        typeCode: "post",
        description: "",
      });
      onClose();
      // success: parent should close modal (our design) but ensure cleanup here if needed
    } catch (err) {
      const msg = extractErrorMessage(err);
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const flattenCategories = (cats: any[] = []) => {
    const result: Array<{ id: string; title: string; level: number }> = [];
    const walk = (arr: any[], level = 0) => {
      arr.forEach((c) => {
        result.push({ id: c.meCategory.id, title: c.meCategory.title, level });
        if (c.children && c.children.length) walk(c.children, level + 1);
      });
    };
    walk(cats);
    return result;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto mx-4 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-balance">إنشاء منشور جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">العنوان *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value.slice(0, settings.maxTitleLength) }))}
              placeholder="اكتب عنوان منشورك هنا..."
              className="text-right"
              required
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>مطلوب</span>
              <span>{formData.title.length}/{settings.maxTitleLength}</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="details" className="text-sm font-medium">التفاصيل *</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => setFormData((p) => ({ ...p, details: e.target.value }))}
              placeholder="اكتب تفاصيل منشورك هنا..."
              className="min-h-[120px] text-right resize-none"
              required
            />
             <div className="flex justify-between text-xs text-muted-foreground">
              <span>مطلوب</span>
              <span>{formData.details.length}/{settings.maxDetails}</span>
              </div>
            {/* <div className="text-xs text-muted-foreground">مطلوب</div> */}

          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">القسم *</Label>
            <Select value={formData.categoryId} onValueChange={(v) => setFormData((p) => ({ ...p, categoryId: v }))}>
              <SelectTrigger className="text-right">
                <SelectValue placeholder="اختر القسم المناسب" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {flattenCategories(categories).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span style={{ paddingRight: `${c.level * 16}px` }}>{c.title}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">مطلوب</div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium">الوسوم (اختياري)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                placeholder="أضف وسم واضغط Enter"
                className="text-right flex-1"
                disabled={formData.tags.length >= settings.maxTags}
              />
              <Button type="button" onClick={handleAddTag} disabled={!currentTag.trim() || formData.tags.length >= settings.maxTags} variant="outline" size="icon" className="shrink-0">
                <Tag className="h-4 w-4" />
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <span>{tag}</span>
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="text-xs text-muted-foreground">{formData.tags.length}/{settings.maxTags} وسوم</div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">الصورة أو الفيديو (اختياري)</Label>

            <div
              ref={dropRef}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onClick={(e) => {
                // فتح picker عند النقر في أي مكان بالمنطقة (ما عدا الأزرار الداخلية)
                if ((e.target as HTMLElement).closest("button")) return;
                openFilePicker();
              }}
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer select-none"
              role="button"
              aria-label="Upload file"
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">اسحب وأفلت الملف هنا أو انقر لاختيار ملف</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, MP4 — صورة ≤ {settings.maxImageMB}MB — فيديو ≤ {settings.maxVideoMB}MB</p>

              <div className="mt-3 flex items-center justify-center gap-3">
                <Button type="button" onClick={(e) => { e.stopPropagation(); openFilePicker(); }} variant="outline" size="sm">
                  اختر ملف
                </Button>
                {file && (
                  <>
                    <div className="max-w-[160px] max-h-[120px] overflow-hidden rounded">
                      {fileType === "image" && filePreviewUrl && <img src={filePreviewUrl} alt="preview" className="object-cover w-full h-full" />}
                      {fileType === "video" && filePreviewUrl && <video src={filePreviewUrl} className="object-cover w-full h-full" controls />}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>{file.name}</div>
                      <div>{Math.round(file.size / 1024)} KB</div>
                      <div>
                        <Button type="button" variant="ghost" onClick={() => { if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl); setFile(null); setFilePreviewUrl(null); setFileType(null); }} className="text-sm">إزالة الملف</Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  handleFileSelected(f);
                  // reset value so same file can be selected again if removed
                  e.currentTarget.value = "";
                }}
              />
            </div>
          </div>

          {/* server error */}
          {serverError && <div className="text-sm text-destructive">{serverError}</div>}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent order-2 sm:order-1">إلغاء</Button>
            <Button type="submit" disabled={isSubmitting} className={cn("flex-1 order-1 sm:order-2", isSubmitting && "opacity-50")}>
              {isSubmitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> جاري النشر...</>) : "نشر المنشور"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
