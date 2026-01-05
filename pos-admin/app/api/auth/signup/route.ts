import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;

const DEFAULT_SIGNUP_ENDPOINTS = [
  "/api/v1/auth/signup",
  "/api/v1/auth/register",
];

function parseEndpoints(raw?: string | null) {
  if (!raw) return DEFAULT_SIGNUP_ENDPOINTS;
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

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
    const { username, email, password, fullName } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { status: "error", message: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { status: "error", message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { status: "error", message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const endpoints = parseEndpoints(process.env.BACKEND_SIGNUP_ENDPOINTS);
    let lastData: any = null;
    let lastStatus = 500;

    for (const endpoint of endpoints) {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, fullName }),
      });

      const data = await safeJson(res);

      if (res.status === 404) {
        lastData = data;
        lastStatus = 404;
        continue;
      }

      if (!res.ok) {
        return NextResponse.json(data ?? { status: "error", message: "Signup failed" }, { status: res.status });
      }

      // Backend returns tokens?
      if (data?.data?.accessToken && data?.data?.refreshToken) {
        const { accessToken, refreshToken } = data.data;

        const response = NextResponse.json({
          status: "success",
          message: "Account created successfully",
        });

        response.cookies.set("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 15, // 15 minutes
        });

        response.cookies.set("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
      }

      return NextResponse.json({
        status: "success",
        message: data?.message ?? "Account created successfully",
        requiresVerification: data?.requiresVerification ?? false,
      });
    }

    return NextResponse.json(
      lastData ?? { status: "error", message: "Signup endpoint not available" },
      { status: lastStatus === 404 ? 502 : lastStatus }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
