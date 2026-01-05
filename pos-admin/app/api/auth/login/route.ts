import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload: Record<string, unknown> = { ...body };

    if (body?.username && !body?.email) {
      payload.email = body.username;
    }

    if (body?.email && !body?.username) {
      payload.username = body.email;
    }

    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await safeJson(res);

    if (!res.ok) {
      const status = res.status === 401 ? 401 : res.status;
      return NextResponse.json(
        data ?? { status: "error", message: "Login failed" },
        { status }
      );
    }

    if (!data?.data?.accessToken || !data?.data?.refreshToken) {
      return NextResponse.json(
        { status: "error", message: "Missing tokens in response" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ status: "success" });

    response.cookies.set("accessToken", data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    response.cookies.set("refreshToken", data.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
