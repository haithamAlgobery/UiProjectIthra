import { NextResponse } from "next/server"
import { mockState } from "@/lib/mock-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const categoryId = searchParams.get("categoryId") || ""
  const type = searchParams.get("type") || ""
  const take = Number.parseInt(searchParams.get("take") || "3")
  const skip = Number.parseInt(searchParams.get("skip") || "0")
  const sort = searchParams.get("sort") || "Newest"
  const userId = searchParams.get("userId") || ""

  let filteredContent = [...mockState.content]

  // Filter by category
  if (categoryId) {
    filteredContent = filteredContent.filter((item) => item.content.categoryId === categoryId)
  }

  // Filter by type
  if (type) {
    filteredContent = filteredContent.filter((item) => item.content.code === type)
  }

  // Filter by user
  if (userId) {
    filteredContent = filteredContent.filter((item) => item.content.userId === userId)
  }

  // Sort content
  switch (sort) {
    case "MostViewed":
      filteredContent.sort((a, b) => b.interactiveCounts.showCount - a.interactiveCounts.showCount)
      break
    case "MostLiked":
      filteredContent.sort((a, b) => b.interactiveCounts.likeCount - a.interactiveCounts.likeCount)
      break
    case "MostCommented":
      filteredContent.sort((a, b) => b.interactiveCounts.commentCount - a.interactiveCounts.commentCount)
      break
    case "Newest":
    default:
      filteredContent.sort(
        (a, b) => new Date(b.content.dateCreate).getTime() - new Date(a.content.dateCreate).getTime(),
      )
      break
  }

  // Paginate
  const paginatedContent = filteredContent.slice(skip, skip + take)

  return NextResponse.json(paginatedContent)
}

export async function POST(request: Request) {
  const body = await request.json()

  const newContent = {
    content: {
      id: `new-${Date.now()}`,
      title: body.title,
      details: body.details,
      dateCreate: new Date().toISOString(),
      userId: mockState.currentUser.id,
      urlImage: body.urlImage || null,
      categoryId: body.categoryId,
      dateUpdate: new Date().toISOString(),
      code: body.code || "post",
    },
    interactiveCounts: {
      showCount: 0,
      likeCount: 0,
      commentCount: 0,
      notLikeCount: 0,
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: false,
    },
    shortDetailsUser: {
      id: mockState.currentUser.id,
      userName: "currentuser",
      lastName: "User",
      firstName: "Current",
      urlImage: "/diverse-user-avatars.png",
      details: "Platform user",
    },
    category: {
      id: body.categoryId,
      title: "عام",
      description: "قسم عام",
      icon: null,
      urlImage: null,
      categoryMainId: "",
      dateCreated: new Date().toISOString(),
      userCreated: mockState.currentUser.id,
    },
  }

  // Add to beginning of content array
  mockState.content.unshift(newContent)

  return NextResponse.json(newContent)
}
