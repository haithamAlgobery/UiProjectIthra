import type { Metadata } from "next"
import ContentDetailPageClient from "@/components/content-detail-page-client"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: "منشور من منصة أثراء",
    description: "هذا المنشور تم نشره من خلال منصة أثراء، حيث نشارك أفضل المحتويات والأعمال.",

    openGraph: {
      title: "منشور من منصة أثراء",
      description: "منصة أثراء تقدم لك محتوى مميز يتم مشاركته عبر شبكات التواصل.",
      type: "article",
      url: `https://yoursite.com/content/${params.id}`,
      images: [
        {
          url: "/logoA.png",
          width: 1200,
          height: 630,
          alt: "منصة أثراء",
        },
      ],
      locale: "ar_SA",
    },

    twitter: {
      card: "summary_large_image",
      title: "منشور من منصة أثراء",
      description: "اكتشف هذا المنشور المميز من منصة أثراء.",
      images: ["/logoA.png"],
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
  return <ContentDetailPageClient params={params} />
}
