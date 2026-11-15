// ============================================================================
//  POST /functions/v1/create-order
//  Creates a Razorpay order for a plan and a matching subscription row.
//
//  Body: { plan_id: "basic" | "pro" }
//  Auth: Authorization: Bearer <supabase access token>
//
//  The amount is ALWAYS read from the `plans` table on the server — the
//  browser can never choose what it pays.
// ============================================================================
import { createClient } from "npm:@supabase/supabase-js@2";
import { handlePreflight, json } from "../_shared/http.ts";

const RAZORPAY_API = "https://api.razorpay.com/v1";
const MIN_AMOUNT_PAISE = 100; // ₹1 — Razorpay's minimum

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
    let body: { plan_id?: unknown } = {};

    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid request body." }, 400);
    }

    const planId = typeof body.plan_id === "string" ? body.plan_id.trim() : "";

    if (!planId) {
      return json({ error: "plan_id is required." }, 400);
    }

    const { data: plan, error: planError } = await admin
      .from("plans")
      .select("id, name, price_inr, job_limit, duration_days, is_active")
      .eq("id", planId)
      .maybeSingle();

    if (planError) {
      console.error("plan lookup failed", planError);
      return json({ error: "Unable to load the selected plan." }, 500);
    }

    if (!plan || !plan.is_active) {
      return json({ error: "This plan is not available." }, 400);
    }

    const amountPaise = Math.round(Number(plan.price_inr) * 100);

    if (!Number.isFinite(amountPaise) || amountPaise < MIN_AMOUNT_PAISE) {
      return json(
        { error: "Plan amount is below the Razorpay minimum of ₹1." },
        400,
      );
    }

    const { data: employer, error: employerError } = await admin
      .from("employers")
      .select("id, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (employerError) {
      console.error("employer lookup failed", employerError);
      return json({ error: "Unable to load your company profile." }, 500);
    }

    if (!employer) {
      return json(
        { error: "Company profile missing. Please fill the form and retry." },
        400,
      );
    }

    // ---- record the attempt (used later by verify-payment) -----------------
    const { data: subscription, error: subscriptionError } = await admin
      .from("employer_subscriptions")
      .insert({
        user_id: user.id,
        employer_id: employer.id,
        plan_id: plan.id,
        plan_name: plan.name,
        amount: plan.price_inr,
        currency: "INR",
        job_limit: plan.job_limit,
        duration_days: plan.duration_days,
        status: "created",
      })
      .select("id")
      .single();

    if (subscriptionError || !subscription) {
      console.error("subscription insert failed", subscriptionError);
      return json({ error: "Unable to start the payment." }, 500);
    }

    const receipt = `rcpt_${subscription.id.replace(/-/g, "").slice(0, 32)}`;

    // ---- create the order at Razorpay --------------------------------------
    const basicAuth = btoa(`${keyId}:${keySecret}`);
    let razorpayResponse: Response;

    try {
      razorpayResponse = await fetch(`${RAZORPAY_API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt,
          notes: {
            subscription_id: subscription.id,
            user_id: user.id,
            plan_id: plan.id,
          },
        }),
      });
    } catch (cause) {
      console.error("razorpay request failed", cause);
      await admin
        .from("employer_subscriptions")
        .update({ status: "failed" })
        .eq("id", subscription.id);
      return json(
        { error: "Could not reach Razorpay. Please try again." },
        502,
      );
    }

    const razorpayOrder = await razorpayResponse.json().catch(() => null);

    if (!razorpayResponse.ok || !razorpayOrder?.id) {
      console.error("razorpay order error", razorpayResponse.status, razorpayOrder);

      await admin
        .from("employer_subscriptions")
        .update({ status: "failed" })
        .eq("id", subscription.id);

      const description =
        razorpayOrder?.error?.description ?? "Order creation failed.";

      return json(
        {
          error:
            razorpayResponse.status === 401
              ? "Razorpay rejected the server credentials."
              : "Razorpay could not create the order.",
          detail: description,
        },
        razorpayResponse.status === 401 ? 500 : 502,
      );
    }

    const { error: updateError } = await admin
      .from("employer_subscriptions")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", subscription.id);

    if (updateError) {
      console.error("could not store order id", updateError);
    }

    return json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency ?? "INR",
      key_id: keyId,
      subscription_id: subscription.id,
      plan: {
        id: plan.id,
        name: plan.name,
        price_inr: plan.price_inr,
        job_limit: plan.job_limit,
        duration_days: plan.duration_days,
      },
    });
  } catch (error) {
    console.error("unexpected error", error);
    return json({ error: "Unexpected error. Please try again." }, 500);
  }
});
