

import type { Metadata } from "next"
import ContentDetailPageClient from "@/components/content-detail-page-client"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // const content = await fetchContentForSEO(params.id);

  // For now, return dynamic metadata structure
  // In production, populate with actual content data
  return {
    title: "عنوان المحتوى | اسم الموقع",
    description: "وصف المحتوى هنا - أول 150-160 حرف من المحتوى",
    openGraph: {
      title: "عنوان المحتوى",
      description: "وصف المحتوى للمشاركة على وسائل التواصل",
      type: "article",
      url: `https://yoursite.com/content/${params.id}`,
      images: [
        {
          url: "/article-hero.png",
          width: 1200,
          height: 630,
          alt: "صورة المحتوى",
        },
      ],
      locale: "ar_SA",
    },
    twitter: {
      card: "summary_large_image",
      title: "عنوان المحتوى",
      description: "وصف المحتوى للمشاركة على تويتر",
      images: ["/article-hero.png"],
    },
    alternates: {
      canonical: `https://yoursite.com/content/${params.id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  // No need to pass mock data - the component uses Redux hooks to fetch real data
  return <ContentDetailPageClient params={params} />
}
