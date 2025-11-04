import { NextResponse } from "next/server"
import { mockState } from "@/lib/mock-data"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const content = mockState.content.find((item) => item.content.id === params.id)

  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 })
  }

  return NextResponse.json(content)
}
