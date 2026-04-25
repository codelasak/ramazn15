import { NextResponse } from "next/server";
import { apiAuthErrorResponse, requireUser } from "../../../../lib/api-auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    return NextResponse.json({ user });
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}
