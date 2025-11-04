import { NextResponse } from "next/server"
import { mockState } from "@/lib/mock-data"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const { action, userId } = body

  const contentIndex = mockState.content.findIndex((item) => item.content.id === params.id)

  if (contentIndex === -1) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 })
  }

  const content = mockState.content[contentIndex]

  // Handle interactions
  switch (action) {
    case "like":
      if (content.myInterActive.isLike) {
        // Unlike
        content.myInterActive.isLike = false
        content.interactiveCounts.likeCount--
      } else {
        // Like
        content.myInterActive.isLike = true
        content.myInterActive.isNotLike = false
        content.interactiveCounts.likeCount++
        if (content.interactiveCounts.notLikeCount > 0) {
          content.interactiveCounts.notLikeCount--
        }
      }
      break

    case "notLike":
      if (content.myInterActive.isNotLike) {
        // Remove dislike
        content.myInterActive.isNotLike = false
        content.interactiveCounts.notLikeCount--
      } else {
        // Dislike
        content.myInterActive.isNotLike = true
        content.myInterActive.isLike = false
        content.interactiveCounts.notLikeCount++
        if (content.interactiveCounts.likeCount > 0) {
          content.interactiveCounts.likeCount--
        }
      }
      break

    case "save":
      // Toggle save state (not implemented in UI yet)
      break
  }

  return NextResponse.json({
    interactiveCounts: content.interactiveCounts,
    myInterActive: content.myInterActive,
  })
}
