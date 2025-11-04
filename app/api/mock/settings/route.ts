import { NextResponse } from "next/server"
import { mockSettings } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockSettings)
}
