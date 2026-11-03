import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, UserSession } from "@/lib/auth";

export interface MobileAuthResult {
  valid: boolean;
  errorResponse?: NextResponse;
  setting?: {
    id: number;
    site_name: string;
    api_app: string | null;
  };
}

export interface MobileUserAuthResult extends MobileAuthResult {
  user?: {
    id: number;
    uuid: string;
    username: string;
    email: string;
    name: string | null;
    balance: number;
    level: string;
    server_area: string;
    api_key: string | null;
    create_at: Date;
  };
  session?: UserSession;
}

/**
 * Validates the Mobile App Key (`api_app` from Setting table)
 * The mobile app must supply this in the header:
 * - `x-api-app`: <api_app> OR
 * - `x-app-key`: <api_app> OR
 * - query parameter: `?api_app=<api_app>`
 */
export async function validateMobileApp(request: Request): Promise<MobileAuthResult> {
  try {
    const setting = await prisma.setting.findFirst({
      orderBy: { id: "asc" },
      select: {
        id: true,
        site_name: true,
        api_app: true,
      },
    });

    const configuredAppKey = setting?.api_app?.trim();

    // If api_app is configured in setting table, enforce strict matching
    if (configuredAppKey) {
      const incomingAppKey =
        request.headers.get("x-api-app") ||
        request.headers.get("x-app-key") ||
        new URL(request.url).searchParams.get("api_app");

      if (!incomingAppKey || incomingAppKey.trim() !== configuredAppKey) {
        return {
          valid: false,
          errorResponse: NextResponse.json(
            {
              success: false,
              message: "Unauthorized: Invalid or missing Mobile App Key (x-api-app header)",
            },
            { status: 401 }
          ),
        };
      }
    }

    return {
      valid: true,
      setting: setting
        ? {
            id: setting.id,
            site_name: setting.site_name,
            api_app: setting.api_app,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Mobile app validation error:", error);
    return {
      valid: false,
      errorResponse: NextResponse.json(
        { success: false, message: "Internal server error during mobile security check" },
        { status: 500 }
      ),
    };
  }
}

/**
 * Validates both:
 * 1. Mobile App Key (`api_app`)
 * 2. User Authentication Token (`Authorization: Bearer <token>`, `x-user-token`, or cookie `user_session`)
 */
export async function authenticateMobileUser(request: Request): Promise<MobileUserAuthResult> {
  // 1. Verify App Key
  const appCheck = await validateMobileApp(request);
  if (!appCheck.valid) {
    return appCheck;
  }

  // 2. Extract User Token
  const authHeader = request.headers.get("authorization");
  let userToken: string | null = null;

  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    userToken = authHeader.slice(7).trim();
  } else if (request.headers.get("x-user-token")) {
    userToken = request.headers.get("x-user-token")?.trim() || null;
  } else {
    // Cookie fallback
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/user_session=([^;]+)/);
    if (match) {
      userToken = decodeURIComponent(match[1]);
    }
  }

  if (!userToken) {
    return {
      valid: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          message: "Unauthorized: User token is required. Provide 'Authorization: Bearer <token>'",
        },
        { status: 401 }
      ),
    };
  }

  // 3. Verify Session
  const session = await verifySessionToken(userToken);
  if (!session?.uuid) {
    return {
      valid: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          message: "Sesi tidak valid atau telah berakhir. Silakan login kembali.",
        },
        { status: 401 }
      ),
    };
  }

  // 4. Load fresh user data from database
  const user = await prisma.user.findUnique({
    where: { uuid: session.uuid },
    select: {
      id: true,
      uuid: true,
      username: true,
      email: true,
      name: true,
      balance: true,
      level: true,
      server_area: true,
      api_key: true,
      create_at: true,
    },
  });

  if (!user) {
    return {
      valid: false,
      errorResponse: NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      ),
    };
  }

  return {
    valid: true,
    session,
    user: {
      ...user,
      balance: Number(user.balance),
    },
    setting: appCheck.setting,
  };
}

