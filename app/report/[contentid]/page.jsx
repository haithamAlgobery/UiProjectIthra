
"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useReportTypes from "@/src/hooks/useReportTypes"
import useReports from "@/src/hooks/useReports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Home, CheckCircle2, AlertCircle } from "lucide-react"

export default function ReportPage({ params }) {
  const contentId = params?.contentid ?? ""
  const router = useRouter()

  const { items: types, loading: typesLoading, loadTypes } = useReportTypes()
  console.log(types)
  const { creating, error, sendReport } = useReports()

  // Rules
  const TITLE_MIN = 2
  const TITLE_MAX = 100
  const DETAIL_MIN = 5
  const DETAIL_MAX = 300

  const [title, setTitle] = useState("")
  const [typeId, setTypeId] = useState("")
  const [detail, setDetail] = useState("")
  const [touched, setTouched] = useState({ title: false, type: false, detail: false })
  const [successModal, setSuccessModal] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    loadTypes().catch(() => {})
  }, [loadTypes])

  const titleValid = title.trim().length >= TITLE_MIN && title.trim().length <= TITLE_MAX
  const typeValid = !!typeId
  const detailValid =
    detail.trim().length == 0 || (detail.trim().length >= DETAIL_MIN && detail.trim().length <= DETAIL_MAX)
  const formValid = titleValid && typeValid && detailValid

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ title: true, type: true, detail: true })
    setSubmitError(null)

    if (!formValid) return

    try {
      await sendReport({
        title: title.trim(),
        detail: detail.trim(),
        contentId,
        typeReportId: typeId,
      })
      // show success modal
      setSuccessModal(true)
      // reset
      setTitle("")
      setTypeId("")
      setDetail("")
      setTouched({ title: false, type: false, detail: false })
    } catch (err) {
      setSubmitError(err?.message || "حدث خطأ أثناء إرسال البلاغ")
    }
  }

  const handleGoHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-transparent"></div>
      </div>

      <header className="relative z-10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-3xl mx-auto flex justify-end">
          <button
            onClick={handleGoHome}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <Home className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
            <span className="text-sm text-white/80 group-hover:text-white transition-colors">الرئيسية</span>
          </button>
        </div>
      </header>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">إرسال بلاغ عن المحتوى</h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
          </div>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl shadow-blue-500/10">
            <CardHeader className="px-6 pt-6 border-b border-white/10">
              <CardTitle className="text-white text-xl">نموذج البلاغ</CardTitle>
              <p className="text-sm text-white/60 mt-2">املأ الحقول التالية بدقة — سنراجع البلاغ فور استلامه.</p>
            </CardHeader>

            <CardContent className="px-6 pb-6 pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white/90 text-sm font-medium">
                    عنوان البلاغ <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, title: true }))}
                    placeholder="اكتب عنوانًا مختصرًا للبلاغ"
                    maxLength={TITLE_MAX}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-blue-400/50 transition-all duration-300 backdrop-blur-sm"
                  />
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <div className={`${touched.title && !titleValid ? "text-red-400" : "text-white/50"}`}>
                      {touched.title && !titleValid
                        ? `العنوان يجب أن يكون بين ${TITLE_MIN} و ${TITLE_MAX} حرفاً`
                        : "العنوان مطلوب"}
                    </div>
                    <div className="text-white/50">
                      {title.length} / {TITLE_MAX}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/90 text-sm font-medium">
                    نوع البلاغ <span className="text-red-400">*</span>
                  </Label>
                  <select
                    className="w-full rounded-md border border-white/20 px-3 py-2 bg-white/5 backdrop-blur-sm text-white text-sm focus:bg-white/10 focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                    value={typeId}
                    onChange={(e) => setTypeId(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, type: true }))}
                  >
                    <option value="" className="bg-slate-900 text-white">
                      -- اختر نوع البلاغ --
                    </option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                        {t.title}
                      </option>
                    ))}
                  </select>
                  {touched.type && !typeValid && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      <span>يجب اختيار نوع البلاغ</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-white/90 text-sm font-medium">
                    تفاصيل البلاغ <span className="text-white/50">(شرح المشكلة)</span>
                  </Label>
                  <Textarea
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, detail: true }))}
                    placeholder="اكتب تفاصيل البلاغ هنا"
                    rows={6}
                    maxLength={DETAIL_MAX}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-blue-400/50 transition-all duration-300 backdrop-blur-sm resize-none"
                  />
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <div className={`${touched.detail && !detailValid ? "text-red-400" : "text-white/50"}`}>
                      {touched.detail && !detailValid
                        ? `التفاصيل يجب أن تكون بين ${DETAIL_MIN} و ${DETAIL_MAX} حرفاً`
                        : "وصف مختصر ومفيد يساعدنا على اتخاذ القرار"}
                    </div>
                    <div className="text-white/50">
                      {detail.length} / {DETAIL_MAX}
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>خطأ من الخادم: {String(error)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 pt-2">
                  <Button
                    type="submit"
                    disabled={!formValid || creating === "pending"}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                  >
                    {creating === "pending" ? "جاري الإرسال..." : "إرسال البلاغ"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    إلغاء والعودة
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setSuccessModal(false)
              handleGoHome()
            }}
          ></div>
          <Card className="max-w-lg w-full mx-4 z-10 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl shadow-green-500/20 animate-in zoom-in-95 duration-300">
            <CardContent className="px-8 py-10 text-center">
              {/* Success icon with animation */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-4">
                    <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-3">تم استلام البلاغ بنجاح</h3>

              {/* Description */}
              <p className="text-white/70 mb-8 text-base leading-relaxed">
                شكراً لإبلاغك. تم استلام البلاغ وسيتم مراجعته من قبل فريقنا في أقرب وقت ممكن.
              </p>

              {/* Confirm button */}
              <Button
                onClick={() => {
                  setSuccessModal(false)
                  handleGoHome()
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg shadow-green-500/30 px-8 py-6 text-base font-medium transition-all duration-300"
              >
                تم، العودة للرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

