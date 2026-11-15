// ============================================================================
//  POST /functions/v1/verify-payment
//  Verifies the Razorpay signature, checks the payment with Razorpay and
//  activates the employer's subscription.
//
//  Body: {
//    razorpay_order_id, razorpay_payment_id, razorpay_signature
//  }
//  Auth: Authorization: Bearer <supabase access token>
//
//  A subscription is marked approved ONLY when:
//    1. HMAC-SHA256("<order_id>|<payment_id>", KEY_SECRET) matches, AND
//    2. Razorpay confirms the payment belongs to the order, AND
//    3. the paid amount matches the plan price, AND
//    4. the payment is captured (or authorised).
// ============================================================================
import { createClient } from "npm:@supabase/supabase-js@2";
import { handlePreflight, json } from "../_shared/http.ts";

const RAZORPAY_API = "https://api.razorpay.com/v1";

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time comparison so signatures cannot be guessed byte by byte. */
function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }

  let diff = 0;

  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return diff === 0;
}

Deno.serve(async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      console.error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not configured.");
      return json({ error: "Payment gateway is not configured." }, 500);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing.");
      return json({ error: "Server configuration error." }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // ---- authenticate the caller -------------------------------------------
    const token = (req.headers.get("Authorization") ?? "").replace(
      /^Bearer\s+/i,
      "",
    );

    if (!token) {
      return json({ error: "Please log in and try again." }, 401);
    }

    const { data: userData, error: userError } = await admin.auth.getUser(token);

    if (userError || !userData?.user) {
      return json({ error: "Your session expired. Please log in again." }, 401);
    }

    const user = userData.user;

    // ---- validate the input ------------------------------------------------
    let body: Record<string, unknown> = {};

    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid request body." }, 400);
    }

    const orderId = typeof body.razorpay_order_id === "string"
      ? body.razorpay_order_id.trim()
      : "";
    const paymentId = typeof body.razorpay_payment_id === "string"
      ? body.razorpay_payment_id.trim()
      : "";
    const signature = typeof body.razorpay_signature === "string"
      ? body.razorpay_signature.trim()
      : "";

    if (!orderId || !paymentId || !signature) {
      return json(
        {
          error:
            "razorpay_order_id, razorpay_payment_id and razorpay_signature are required.",
        },
        400,
      );
    }

    // ---- find our subscription ---------------------------------------------
    const { data: subscription, error: subscriptionError } = await admin
      .from("employer_subscriptions")
      .select("id, user_id, amount, plan_id, plan_name, job_limit, status")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();

    if (subscriptionError) {
      console.error("subscription lookup failed", subscriptionError);
      return json({ error: "Unable to verify this payment." }, 500);
    }

    if (!subscription) {
      return json({ error: "Unknown order." }, 404);
    }

    if (subscription.user_id !== user.id) {
      return json({ error: "This order does not belong to you." }, 403);
    }

    // ---- 1. signature check ------------------------------------------------
    const expectedSignature = await hmacSha256Hex(
      `${orderId}|${paymentId}`,
      keySecret,
    );

    if (!timingSafeEqual(expectedSignature, signature)) {
      console.warn("signature mismatch", { orderId, paymentId, userId: user.id });

      await admin
        .from("employer_subscriptions")
        .update({ status: "failed" })
        .eq("id", subscription.id)
        .neq("status", "approved");

      return json(
        { error: "Payment signature verification failed." },
        400,
      );
    }

    // ---- 2. confirm with Razorpay -----------------------------------------
    const basicAuth = btoa(`${keyId}:${keySecret}`);

    let paymentResponse: Response;

    try {
      paymentResponse = await fetch(
        `${RAZORPAY_API}/payments/${encodeURIComponent(paymentId)}`,
        { headers: { Authorization: `Basic ${basicAuth}` } },
      );
    } catch (cause) {
      console.error("razorpay payment lookup failed", cause);
      return json(
        { error: "Could not confirm the payment with Razorpay. Try again." },
        502,
      );
    }

    const payment = await paymentResponse.json().catch(() => null);

    if (!paymentResponse.ok || !payment) {
      console.error("razorpay payment error", paymentResponse.status, payment);
      return json(
        { error: "Could not confirm the payment with Razorpay." },
        502,
      );
    }

    if (payment.order_id !== orderId) {
      return json({ error: "Payment does not match this order." }, 400);
    }

    const expectedPaise = Math.round(Number(subscription.amount) * 100);

    if (Number(payment.amount) !== expectedPaise) {
      console.error("amount mismatch", {
        paid: payment.amount,
        expected: expectedPaise,
      });
      return json({ error: "Paid amount does not match the plan price." }, 400);
    }

    let paymentStatus = String(payment.status);

    // Razorpay accounts with manual capture leave the payment as "authorized".
    // Capture it here so the money is actually collected.
    if (paymentStatus === "authorized") {
      try {
        const captureResponse = await fetch(
          `${RAZORPAY_API}/payments/${encodeURIComponent(paymentId)}/capture`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${basicAuth}`,
            },
            body: JSON.stringify({
              amount: expectedPaise,
              currency: payment.currency ?? "INR",
            }),
          },
        );

        const captured = await captureResponse.json().catch(() => null);

        if (captureResponse.ok && captured?.status) {
          paymentStatus = String(captured.status);
        } else {
          console.error("capture failed", captureResponse.status, captured);
        }
      } catch (cause) {
        console.error("capture request failed", cause);
      }
    }

    if (!["captured", "authorized"].includes(paymentStatus)) {
      return json(
        {
          error: `Payment is ${paymentStatus}. It has not been captured yet.`,
        },
        400,
      );
    }

    // ---- 3. store the payment and activate --------------------------------
    const { error: storeError } = await admin
      .from("employer_subscriptions")
      .update({
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        status: "pending",
      })
      .eq("id", subscription.id);

    if (storeError) {
      console.error("could not store payment", storeError);
      return json({ error: "Unable to save the payment." }, 500);
    }

    const { data: activated, error: activationError } = await admin.rpc(
      "activate_employer_subscription",
      { p_subscription_id: subscription.id },
    );

    if (activationError) {
      console.error("activation failed", activationError);
      return json(
        {
          error:
            "Payment received but activation failed. Please contact support.",
        },
        500,
      );
    }

    const { data: employer } = await admin
      .from("employers")
      .select("id, status, job_limit, subscription_expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    return json({
      success: true,
      message: "Payment verified. Your plan is active.",
      payment_id: paymentId,
      subscription: activated ?? null,
      employer: employer ?? null,
    });
  } catch (error) {
    console.error("unexpected error", error);
    return json({ error: "Unexpected error. Please try again." }, 500);
  }
});
