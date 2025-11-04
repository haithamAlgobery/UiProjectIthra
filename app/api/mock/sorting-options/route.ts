import { NextResponse } from "next/server"
import { mockSortingOptions } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockSortingOptions)
}
