import { supabase } from "./supabaseClient";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let checkoutPromise = null;

/** Loads Razorpay's Checkout script once (lazy, only when a payment starts). */
function loadCheckoutScript() {
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve();
  }

  if (checkoutPromise) {
    return checkoutPromise;
  }

  checkoutPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${CHECKOUT_SRC}"]`);

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => {
        checkoutPromise = null;
        reject(new Error("Unable to load Razorpay Checkout."));
      });
      return;
    }

    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      checkoutPromise = null;
      reject(
        new Error(
          "Unable to load the Razorpay Checkout. Check your connection and retry.",
        ),
      );
    };

    document.body.appendChild(script);
  });

  return checkoutPromise;
}

/** Pulls `{ error }` out of a Supabase FunctionsHttpError response. */
async function readFunctionError(error, fallback) {
  try {
    const response = error?.context;

    if (response && typeof response.clone === "function") {
      const payload = await response.clone().json();
      if (payload?.error) {
        return payload.detail ? `${payload.error} (${payload.detail})` : payload.error;
      }
    }
  } catch {
    // response was not JSON — fall through to the generic message
  }

  return error?.message || fallback;
}

/** POST /functions/v1/create-order */
export async function createOrder(planId) {
  const { data, error } = await supabase.functions.invoke("create-order", {
    body: { plan_id: planId },
  });

  if (error) {
    throw new Error(
      await readFunctionError(error, "Unable to start the payment."),
    );
  }

  if (!data?.order_id) {
    throw new Error("The payment order could not be created.");
  }

  return data;
}

/** POST /functions/v1/verify-payment */
export async function verifyPayment(paymentResponse) {
  const { data, error } = await supabase.functions.invoke("verify-payment", {
    body: {
      razorpay_order_id: paymentResponse?.razorpay_order_id,
      razorpay_payment_id: paymentResponse?.razorpay_payment_id,
      razorpay_signature: paymentResponse?.razorpay_signature,
    },
  });

  if (error) {
    throw new Error(
      await readFunctionError(error, "Payment verification failed."),
    );
  }

  if (!data?.success) {
    throw new Error(data?.error || "Payment verification failed.");
  }

  return data;
}

/**
 * Full Razorpay Standard Checkout flow.
 *
 * Resolves with the verify-payment response on success.
 * Rejects with an Error whose `code` is:
 *   "cancelled" — modal closed by the user
 *   "failed"    — Razorpay reported a failed payment
 *   undefined   — network / server / verification error
 */
export async function payForPlan({ planId, prefill = {} }) {
  const order = await createOrder(planId);

  await loadCheckoutScript();

  const key = order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!key) {
    throw new Error("Razorpay key id is missing.");
  }

  if (typeof window.Razorpay !== "function") {
    throw new Error("Razorpay Checkout is not available in this browser.");
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    let paymentReceived = false;

    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    };

    const checkout = new window.Razorpay({
      key,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "VMWjobs",
      description: `${order.plan?.name || "Plan"} — ${order.plan?.job_limit || ""} job posts`,
      order_id: order.order_id,
      prefill: {
        name: prefill.name || "",
        email: prefill.email || "",
        contact: prefill.contact || "",
      },
      notes: {
        subscription_id: order.subscription_id,
        plan_id: order.plan?.id || planId,
      },
      theme: { color: "#1d4ed8" },
      handler: async (response) => {
        // The payment succeeded — ignore any "dismissed" event that follows.
        paymentReceived = true;

        try {
          finish(null, await verifyPayment(response));
        } catch (error) {
          finish(error);
        }
      },
      modal: {
        ondismiss: () => {
          if (settled || paymentReceived) return;

          const error = new Error("Payment cancelled.");
          error.code = "cancelled";
          finish(error);
        },
      },
    });

    checkout.on("payment.failed", (response) => {
      if (settled || paymentReceived) return;

      const error = new Error(
        response?.error?.description || "The payment could not be completed.",
      );
      error.code = "failed";
      finish(error);
    });

    checkout.open();
  });
}
