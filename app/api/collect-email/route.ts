import { NextResponse } from "next/server";

export const runtime = "nodejs";

type EmailCollectionRequest = {
  email: string;
  timestamp?: string;
  sessionId?: string;
  reason?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EmailCollectionRequest;
    const { email, timestamp, sessionId, reason } = body;

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // 日志记录
    console.log("Email collected:", {
      email,
      timestamp: timestamp || new Date().toISOString(),
      sessionId: sessionId || "unknown",
      reason: reason || "customer service request",
    });

    // TODO: 在这里实现实际的数据保存逻辑
    // 例如：
    // 1. 保存到数据库
    // await db.emails.create({
    //   email,
    //   timestamp: new Date(timestamp || Date.now()),
    //   sessionId,
    //   reason,
    // });

    // 2. 发送通知邮件给客服团队
    // await sendNotificationEmail({
    //   to: 'support@example.com',
    //   subject: 'New customer service request',
    //   body: `User ${email} requested customer service. Reason: ${reason}`,
    // });

    // 3. 添加到 CRM 系统
    // await crmClient.createContact({
    //   email,
    //   source: 'chatbot',
    //   tags: ['customer-service-request'],
    // });

    // 4. 发送确认邮件给用户
    // await sendConfirmationEmail({
    //   to: email,
    //   subject: '我们已收到您的联系请求',
    //   body: '感谢您的联系，我们的客服团队会尽快与您取得联系。',
    // });

    return NextResponse.json({
      success: true,
      message: "Email collected successfully",
    });
  } catch (error) {
    console.error("Failed to collect email:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// 可选：添加 GET 方法来查看收集的邮箱（仅用于开发/调试）
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  // TODO: 从数据库获取邮箱列表
  // const emails = await db.emails.findMany();

  return NextResponse.json({
    message: "This endpoint is for development only",
    // emails,
  });
}
