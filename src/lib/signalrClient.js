// lib/signalrClient.js
import * as signalR from "@microsoft/signalr";

/**
 * Simple state machine to avoid race conditions when starting/stopping/reconnecting.
 *
 * Usage:
 *  initSignalR(hubUrl, { getToken, tryRefresh, onNotification })
 *  forceReconnect() -> force re-create connection using current getToken()
 *  stopSignalR()
 */

let connection = null;
let startLock = false; // لمنع محاولات start متزامنة
let currentVersion = 0; // يُستخدم لتفادي استرجاعات قديمة
let hubUrlGlobal = null;
let optsGlobal = {};

function buildConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl(hubUrlGlobal, {
      accessTokenFactory: () => {
        try {
          // SignalR سيستدعي هذه الدالة عند الحاجة. يجب أن تعيد أحدث توكن (أو null)
          return typeof optsGlobal.getToken === "function"
            ? optsGlobal.getToken()
            : null;
        } catch (e) {
          return null;
        }
      },
      // إذا لديك إعدادات withCredentials أو headers خاصة أضفها هنا
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

function attachHandlers(conn, onNotification) {
  // افترض اسم الحدث ReceiveNotification — غيّره حسب حاجتك
  conn.on("ReceiveNotification", (title, message, meta) => {
    try {
      const payload = { title, message, meta };
      if (typeof onNotification === "function") onNotification(payload);
    } catch (e) {
      console.error("[SignalR] on handler error:", e);
    }
  });

  conn.onreconnecting((err) => {
    console.warn("[SignalR] reconnecting...", err);
  });
  conn.onreconnected(() => {
    console.log("[SignalR] reconnected");
  });
  conn.onclose((err) => {
    console.warn("[SignalR] closed", err);
  });
}

async function startConnection(version) {
  // لا نسمح بتداخل محاولات البدء
  if (startLock) {
    // انتظر حتى ينتهي من المحاولة الجارية (poll) — بديل بسيط
    while (startLock) {
      await new Promise((r) => setTimeout(r, 50));
    }
    // إذا تغيّر الإصدار أثناء الانتظار فاعمل start من جديد
    if (version !== currentVersion) {
      return startConnection(currentVersion);
    }
    return connection;
  }

  startLock = true;
  try {
    // (إعادة)بناء الاتصال كل مرة نريد فيها التأكد من أن accessTokenFactory سيعطي التوكن الجديد
    if (connection) {
      try {
        await connection.stop();
      } catch (e) {
        /* ignore */
      }
      connection = null;
    }

    connection = buildConnection();
    attachHandlers(connection, optsGlobal.onNotification);

    try {
      await connection.start();
    } catch (err) {
      // لا نرمي لأن AutomaticReconnect سيتولى المحاولات
    }

    return connection;
  } finally {
    startLock = false;
  }
}

function waitForTokenWithTimeout(timeoutMs = 1500) {
  // يحاول تنفيذ tryRefresh (إن وُجد) لكن لا ينتظر أبداً أكثر من timeoutMs
  return new Promise(async (resolve) => {
    if (typeof optsGlobal.getToken === "function") {
      const t = optsGlobal.getToken();
      if (t) return resolve(t);
    }

    if (typeof optsGlobal.tryRefresh !== "function") {
      // لا يوجد تجديد — نرجع null فوراً
      return resolve(null);
    }

    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(null);
      }
    }, timeoutMs);

    try {
      const res = await optsGlobal.tryRefresh();
      if (!done) {
        done = true;
        clearTimeout(timer);
        // tryRefresh قد يعيد كائن أو token مباشرة
        const token = (res && res.token) ? res.token : (typeof res === "string" ? res : null);
        resolve(token);
      }
    } catch (e) {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(null);
      }
    }
  });
}

/**
 * initSignalR(hubUrl, { getToken, tryRefresh, onNotification })
 *  - getToken: () => token|string|null (synchronous)
 *  - tryRefresh: async () => { token }  (اختياري) — دالة تحاول تجديد التوكن (مثل استدعاء refreshToken thunk)
 *  - onNotification: notification handler
 *  - preWaitMs: مدة الانتظار لمحاولة تجديد قبل بدء الاتصال (default 1500ms)
 */
export async function initSignalR(hubUrl, { getToken, tryRefresh, onNotification, preWaitMs = 1500 } = {}) {
  if (!hubUrl) throw new Error("hubUrl required");
  hubUrlGlobal = hubUrl;
  optsGlobal = { getToken, tryRefresh, onNotification };

  // إصدار جديد — كل إعادة init تعتبر تغيير في النسخة
  currentVersion++;

  // 1) نحاول الحصول على التوكن بسرعة (محاولة تجديد مع مهلة) لكي نبدأ اتصال بالحالة المناسبة
  try {
    await waitForTokenWithTimeout(preWaitMs);
  } catch (e) {
    // ignore
  }

  // 2) ابدأ الاتصال (سيقرأ getToken عند negotiation/start)
  return startConnection(currentVersion);
}

/**
 * Force reconnect: يستعمل عند login/logout أو عندما تريد إعادة إنشاء الاتصال
 * - mode: "prefer-auth" أو "anonymous" (اختياري). إذا prefer-auth سيحاول استخدام getToken.
 */
export async function forceReconnect({ mode = "prefer-auth" } = {}) {
  currentVersion++;
  // إذا طلب الوضع anonymous: نبدّل مؤقتاً getToken ليرجع null ثم نعيد start
  const originalGetToken = optsGlobal.getToken;
  if (mode === "anonymous") {
    optsGlobal.getToken = () => null;
  }
  try {
    return await startConnection(currentVersion);
  } finally {
    // استعد الدالة الأصلية
    optsGlobal.getToken = originalGetToken;
  }
}

export async function stopSignalR() {
  currentVersion++;
  if (!connection) return;
  try {
    await connection.stop();
  } catch (e) {
    /* ignore */
  } finally {
    connection = null;
  }
}

// exposed to check state (اختياري)
export function getConnection() {
  return connection;
}
