
"use client"

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadFile,
  deleteFile,
  fetchFilesByContentId,
} from "@/src/features/file";
import {
  createResource,
  deleteResource,
  fetchResourcesByContentId,
} from "@/src/features/resource";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/ui/label";
import { Navbar2 } from "@/components/Navbar2";



type NullableFile = File | null;

const FILE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;
const MAX_RESOURCES = 20;
const MAX_TITLE = 150;
const MAX_DETAILS = 1000;
const MAX_RESOURCE_URL = 1000;

export default function ResearchAttachmentsPage() {
  const params = useParams() as { id?: string };
  const contentId = String(params?.id ?? "");
  const dispatch: any = useDispatch();
  const router = useRouter();

  // Ensure layout RTL so header logo appears on the right in Arabic
  // selectors with fallbacks
  const files = useSelector((s: any) => {
    if (!contentId) return [];
    return (s.file?.byContent?.[contentId] ?? s.file?.byContent?.[String(contentId)] ?? []);
  });

  const resources = useSelector((s: any) => {
    if (!contentId) return [];
  
    // 1) محاولة فتح شكل reducer الشائع: byContent (خريطة)
    const byContent =
      s.resource?.byContent ??
      s.resource?.itemsByContent ??
      s.resource?.resourcesByContent; // مسميات احتياطية
  
    if (byContent) {
      // حاول استخدام المفتاح كما هو، ثم بصيغة upper/lower
      return (
        byContent[contentId] ??
        byContent[String(contentId).toLowerCase()] ??
        byContent[String(contentId).toUpperCase()] ??
        []
      );
    }
  
    // 2) fallback: قد يكون المخزن مصفوفة عامة (items أو list أو مباشرة resource)
    const arr = s.resource?.items ?? s.resource?.list ?? s.resource;
    if (Array.isArray(arr)) {
      const normalized = String(contentId).toLowerCase();
      return arr.filter((r: any) => String((r?.contentId ?? r?.ContentId ?? r?.content_id ?? '')).toLowerCase() === normalized);
    }
  
    // 3) أي شكل آخر -> إرجاع مصفوفة فارغة
    return [];
  });
  const globalLoading = useSelector((s: any) => s.file?.loading || s.resource?.loading);
  const globalError = useSelector((s: any) => s.file?.error || s.resource?.error);

  // local state - files
  const [attTitle, setAttTitle] = useState("");
  const [attDetails, setAttDetails] = useState("");
  const [attFile, setAttFile] = useState<NullableFile>(null);
  const [attError, setAttError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // local state - resources
  const [resTitle, setResTitle] = useState("");
  const [resUrl, setResUrl] = useState("");
  const [resDetails, setResDetails] = useState("");
  const [resError, setResError] = useState<string | null>(null);
  const [creatingResource, setCreatingResource] = useState(false);

  // UI state
  const [confirmDeleteFileId, setConfirmDeleteFileId] = useState<string | null>(null);
  const [confirmDeleteResourceId, setConfirmDeleteResourceId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // panels (curtain) open state
  const [filePanelOpen, setFilePanelOpen] = useState(false);
  const [resourcePanelOpen, setResourcePanelOpen] = useState(false);

  // refs for drag & drop and file input
  const dropRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!contentId) return;
    dispatch(fetchFilesByContentId({ contentId }));
    dispatch(fetchResourcesByContentId({ contentId }));
  }, [contentId, dispatch]);

  useEffect(() => {
    // keep focus/UX consistent when panels open on mobile
    if (filePanelOpen === false) {
      setAttError(null);
    }
    if (resourcePanelOpen === false) {
      setResError(null);
    }
  }, [filePanelOpen, resourcePanelOpen]);

  function formatBytesToMB(bytes: number) {
    return (bytes / (1024 * 1024)).toFixed(2);
  }

  function parseError(err: any) {
    if (!err) return null;
    if (typeof err === "string") return err;
    if (err?.message) return err.message;
    if (err?.data?.message) return err.data.message;
    return JSON.stringify(err);
  }

  // drag/drop and input handling (also attach handlers inline so React captures them on mobile/touch)
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFilePicked(f);
  };

  function handleFilePicked(file: File) {
    setAttError(null);
    if (file.size > FILE_MAX_BYTES) {
      setAttError(`حجم الملف أكبر من ${formatBytesToMB(FILE_MAX_BYTES)} MB`);
      return;
    }
    setAttFile(file);
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    handleFilePicked(f);
    // reset input to allow re-uploading same file
    e.currentTarget.value = "";
  };

  const handleUpload = async () => {
    setAttError(null);
    if (!contentId) return setAttError("معرّف المحتوى مفقود.");
    if (!attTitle.trim()) return setAttError("أدخل عنوان الملف.");
    if (!attFile) return setAttError("اختر ملفاً للرفع.");
    if ((files?.length ?? 0) >= MAX_FILES) return setAttError(`الحد الأقصى للملفات هو ${MAX_FILES}`);

    setUploading(true);
    try {
      const payload = { contentId, title: attTitle.trim(), details: attDetails.trim(), file: attFile };
      await dispatch(uploadFile(payload)).unwrap?.();
      setNotice("تم رفع الملف بنجاح.");
      // reset
      setAttTitle("");
      setAttDetails("");
      setAttFile(null);
      setFilePanelOpen(false);
      // refresh lists
      await dispatch(fetchFilesByContentId({ contentId }));
    } catch (err: any) {
      const msg = parseError(err) || "حدث خطأ أثناء رفع الملف.";
      setAttError(msg);
    } finally {
      setUploading(false);
      setTimeout(() => setNotice(null), 3500);
    }
  };

  const handleRemoveFile = async (id: string) => {
    if (!id) return;
    setAttError(null);
    try {
      await dispatch(deleteFile({ id })).unwrap?.();
      setNotice("تم حذف الملف.");
      await dispatch(fetchFilesByContentId({ contentId }));
    } catch (err: any) {
      setAttError(parseError(err) || "خطأ عند حذف الملف.");
    } finally {
      setConfirmDeleteFileId(null);
      setTimeout(() => setNotice(null), 2500);
    }
  };

  const handleCreateResource = async () => {
    setResError(null);
    if (!contentId) return setResError("معرّف المحتوى مفقود.");
    if (!resTitle.trim()) return setResError("أدخل عنوان المصدر.");
    if (!resUrl.trim()) return setResError("أدخل رابط المصدر.");
    if ((resources?.length ?? 0) >= MAX_RESOURCES)
      return setResError(`الحد الأقصى للمصادر هو ${MAX_RESOURCES}`);

    setCreatingResource(true);
    try {
      await dispatch(
        createResource({ title: resTitle.trim(), url: resUrl.trim(), details: resDetails.trim(), contentId })
      ).unwrap?.();
      setResTitle("");
      setResUrl("");
      setResDetails("");
      setResourcePanelOpen(false);
      setNotice("تم إضافة المصدر.");
      await dispatch(fetchResourcesByContentId({ contentId }));
    } catch (err: any) {
      setResError(parseError(err) || "حدث خطأ أثناء إضافة المصدر.");
    } finally {
      setCreatingResource(false);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleRemoveResource = async (id: string) => {
    if (!id) return;
    try {
      await dispatch(deleteResource({ id })).unwrap?.();
      setNotice("تم حذف المصدر.");
      await dispatch(fetchResourcesByContentId({ contentId }));
    } catch (err: any) {
      setResError(parseError(err) || "خطأ عند حذف المصدر.");
    } finally {
      setConfirmDeleteResourceId(null);
      setTimeout(() => setNotice(null), 2500);
    }
  };

  const withMax = (value: string, max: number) => value.slice(0, max);

  return (
    <>
    <Navbar2></Navbar2>
    <div className="min-h-screen py-6 bg-gradient-to-b from-white/60 to-slate-50 dark:from-slate-900 dark:to-slate-800" dir="rtl">
      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header: on small screens stack, on larger screens row. Logo on right. */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 order-2 sm:order-1">
            <button
              onClick={() => router.push('/')}
              className="text-sm px-4 py-2 rounded-md border hover:shadow-sm touch-manipulation"
              aria-label="العودة للرئيسية"
            >
              الرئيسية
            </button>

            <button
              onClick={() => router.push(`/content/${contentId}`)}
              className="ml-0 sm:ml-3 text-sm px-4 py-2 rounded-md bg-primary text-white hover:opacity-95 touch-manipulation"
            >
              عرض البحث
            </button>
          </div>

       
        </header>

        {/* Notices and global errors */}
        <div className="space-y-2">
          {notice && (
            <div className="p-3 rounded-md bg-green-50 text-green-800 dark:bg-green-900/30">{notice}</div>
          )}
          {globalError && (
            <div className="p-3 rounded-md bg-red-50 text-red-800 dark:bg-red-900/30">{parseError(globalError)}</div>
          )}
        </div>

        {/* Files card */}
        <section className="bg-card p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">الملفات (حد {MAX_FILES}، كل ملف ≤ {formatBytesToMB(FILE_MAX_BYTES)}MB)</h2>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">موجود: {files?.length ?? 0}</div>
              <Button onClick={() => setFilePanelOpen((s) => !s)} aria-expanded={filePanelOpen}>
                {filePanelOpen ? 'إغلاق نموذج الإضافة' : 'إضافة ملف'}
              </Button>
            </div>
          </div>

          {/* Sliding panel (curtain) for file form */}
          <div
            className={`overflow-hidden transition-[max-height] duration-300 mt-4 rounded-md ${filePanelOpen ? 'max-h-[1200px]' : 'max-h-0'}`}
            aria-hidden={!filePanelOpen}
          >
            <div className="p-4 border rounded-lg bg-white/60 dark:bg-slate-900">
              <Label>عنوان الملف *</Label>
              <Input
                value={attTitle}
                onChange={(e) => setAttTitle(withMax(e.target.value, MAX_TITLE))}
                placeholder="سـم الملف (مطلوب)"
                maxLength={MAX_TITLE}
              />
              <div className="text-xs mt-1 text-muted-foreground">{attTitle.length}/{MAX_TITLE}</div>

              <Label className="mt-3">اختر الملف * (سحب و إفلات مدعوم)</Label>

              <div
                ref={dropRef}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                className={`mt-2 p-4 rounded-md border-dashed border-2 ${
                  dragActive ? 'border-primary/80 bg-primary/5' : 'border-muted-foreground/40'
                } touch-manipulation`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">{attFile ? attFile.name : 'اسحب الملف هنا أو اضغط لفتح المتصفح'}</div>
                    <div className="text-xs text-muted-foreground">{attFile ? `${formatBytesToMB(attFile.size)} MB` : ''}</div>
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input ref={fileInputRef} type="file" className="hidden" onChange={onFileInputChange} />
                      <span className="px-3 py-1 rounded-md border">تصفح</span>
                    </label>
                  </div>
                </div>

                <div className="mt-2 text-xs text-muted-foreground">يمكنك سحب ملف من جهازك إلى هذه المنطقة أو الضغط لاختيار ملف.</div>
              </div>

              <Label className="mt-3">تفاصيل (اختياري)</Label>
              <Textarea
                value={attDetails}
                onChange={(e) => setAttDetails(withMax(e.target.value, MAX_DETAILS))}
                maxLength={MAX_DETAILS}
              />
              <div className="text-xs mt-1 text-muted-foreground">{attDetails.length}/{MAX_DETAILS}</div>

              {attError && <div className="text-sm text-destructive mt-2">{attError}</div>}

              <div className="mt-4 flex gap-2">
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? 'جاري الرفع...' : 'رفع الملف'}
                </Button>
                <Button variant="outline" onClick={() => { setAttTitle(''); setAttDetails(''); setAttFile(null); setAttError(null); setFilePanelOpen(false); }}>
                  إلغاء
                </Button>
              </div>
            </div>
          </div>

          {/* Files list (responsive) */}
          <div className="mt-4 grid grid-cols-1 gap-3">
            {(files || []).length === 0 && (
              <div className="p-3 text-muted-foreground">لا توجد ملفات مرفوعة بعد.</div>
            )}

            {(files || []).map((f: any) => (
              <div key={f.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border rounded-md">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm">
                    {f.title?.[0] ?? 'ف'}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{f.title}</div>
                    <div className="text-xs text-muted-foreground">{f.details}</div>
                    <div className="text-xs mt-1">{f.path} • {f.size ?? formatBytesToMB(f.sizeBytes ?? 0)} MB</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => window.open(`/storage/${f.path}`, '_blank')}>عرض</Button>
                  <Button variant="destructive" onClick={() => setConfirmDeleteFileId(String(f.id))}>حذف</Button>
                </div>

                {confirmDeleteFileId === String(f.id) && (
                  <div className="mt-2 w-full sm:w-auto p-2 rounded-md bg-red-50 text-red-800">
                    <div className="text-xs">هل أنت متأكد؟</div>
                    <div className="flex gap-2 mt-1">
                      <Button variant="destructive" onClick={() => handleRemoveFile(String(f.id))}>نعم احذف</Button>
                      <Button variant="outline" onClick={() => setConfirmDeleteFileId(null)}>إلغاء</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Resources card */}
        <section className="bg-card p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">المصادر (حد {MAX_RESOURCES})</h2>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">موجود: {resources?.length ?? 0}</div>
              <Button onClick={() => setResourcePanelOpen((s) => !s)}>
                {resourcePanelOpen ? 'إغلاق نموذج الإضافة' : 'إضافة مصدر'}
              </Button>
            </div>
          </div>

          <div className={`overflow-hidden transition-[max-height] duration-300 mt-4 rounded-md ${resourcePanelOpen ? 'max-h-[1200px]' : 'max-h-0'}`} aria-hidden={!resourcePanelOpen}>
            <div className="p-4 border rounded-lg bg-white/60 dark:bg-slate-900">
              <Label>عنوان المصدر *</Label>
              <Input value={resTitle} onChange={(e) => setResTitle(withMax(e.target.value, MAX_TITLE))} maxLength={MAX_TITLE} />
              <div className="text-xs mt-1 text-muted-foreground">{resTitle.length}/{MAX_TITLE}</div>

              <Label className="mt-3">الرابط *</Label>
              <Input value={resUrl} onChange={(e) => setResUrl(withMax(e.target.value, MAX_RESOURCE_URL))} maxLength={MAX_RESOURCE_URL} placeholder="https://" />

              <Label className="mt-3">تفاصيل (اختياري)</Label>
              <Textarea value={resDetails} onChange={(e) => setResDetails(withMax(e.target.value, MAX_DETAILS))} maxLength={MAX_DETAILS} />
              <div className="text-xs mt-1 text-muted-foreground">{resDetails.length}/{MAX_DETAILS}</div>

              {resError && <div className="text-sm text-destructive mt-2">{resError}</div>}

              <div className="mt-4 flex gap-2">
                <Button onClick={handleCreateResource} disabled={creatingResource}>{creatingResource ? 'جاري الإضافة...' : 'إضافة مصدر'}</Button>
                <Button variant="outline" onClick={() => { setResTitle(''); setResUrl(''); setResDetails(''); setResError(null); setResourcePanelOpen(false); }}>إلغاء</Button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            {(resources || []).length === 0 && (<div className="p-3 text-muted-foreground">لا توجد مصادر بعد.</div>)}

            {(resources || []).map((r: any) => (
              <div key={r.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border rounded-md">
                <div className="flex-1 text-left">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.details}</div>
                  <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-primary break-all">{r.url}</a>
                </div>

                <div className="flex flex-col gap-2 items-end sm:items-center">
                  <Button variant="destructive" onClick={() => setConfirmDeleteResourceId(String(r.id))}>حذف</Button>

                  {confirmDeleteResourceId === String(r.id) && (
                    <div className="mt-2 p-2 rounded-md bg-red-50 text-red-800">
                      <div className="text-xs">هل تريد حذف هذا المصدر؟</div>
                      <div className="flex gap-2 mt-1">
                        <Button variant="destructive" onClick={() => handleRemoveResource(String(r.id))}>نعم احذف</Button>
                        <Button variant="outline" onClick={() => setConfirmDeleteResourceId(null)}>إلغاء</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-xs text-muted-foreground">ملاحظة: الحقول المعلمة بـ * مطلوبة. يمكن تجاهل إضافة الملفات أو المصادر إذا رغبت بالعودة.</footer>
      </main>
    </div>
    </>
  );
}

