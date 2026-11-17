import { useEffect, useState } from "react";
import {
  Building2,
  Check,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import AdminMenu from "../../components/AdminMenu";
import { FormMessage, LoadingState } from "../../components/ui";

export default function AdminEmployers() {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  function showMessage(text, type) {
    setMessage(text);
    setMessageType(type);
  }

  async function fetchData() {
    setLoading(true);

    const [subResult, empResult] = await Promise.all([
      supabase
        .from("employer_subscriptions")
        .select(
          `
          id,
          plan_name,
          amount,
          job_limit,
          duration_days,
          upi_reference,
          razorpay_order_id,
          razorpay_payment_id,
          paid_at,
          status,
          created_at,
          profiles (name, email),
          employers (company_name, user_id)
        `,
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("employers")
        .select(
          `
          id,
          user_id,
          company_name,
          status,
          is_verified,
          job_limit,
          created_at,
          profiles (name, email)
        `,
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);

    if (subResult.error) {
      console.error(subResult.error);
      showMessage("Unable to load payment requests.", "error");
    }

    if (empResult.error) {
      console.error(empResult.error);
      showMessage("Unable to load pending employers.", "error");
    }

    setPaymentRequests(subResult.data || []);
    setPendingEmployers(empResult.data || []);
    setLoading(false);
  }

  async function handleApprovePayment(request) {
    setActionLoadingId(request.id);
    setMessage("");

    try {
      const { error: subError } = await supabase
        .from("employer_subscriptions")
        .update({ status: "approved" })
        .eq("id", request.id);

      if (subError) throw subError;

      const days =
        request.duration_days ||
        (request.plan_name?.toLowerCase().includes("pro") ? 90 : 30);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      const userId = request.employers?.user_id;

      if (!userId) {
        throw new Error("This payment request is not linked to an employer.");
      }

      const { error: employerError } = await supabase
        .from("employers")
        .update({
          status: "active",
          is_verified: true,
          job_limit: request.job_limit,
          subscription_expires_at: expiresAt.toISOString(),
        })
        .eq("user_id", userId);

      if (employerError) throw employerError;

      showMessage(
        `Payment approved. ${request.employers?.company_name || "Employer"} is now active with ${request.job_limit} job credits.`,
        "success",
      );
      await fetchData();
    } catch (err) {
      console.error(err);
      showMessage(err.message || "Unable to approve this payment.", "error");
    }

    setActionLoadingId(null);
  }

  async function handleRejectPayment(request) {
    if (!window.confirm("Reject this payment request?")) return;

    setActionLoadingId(request.id);
    setMessage("");

    const { error } = await supabase
      .from("employer_subscriptions")
      .update({ status: "rejected" })
      .eq("id", request.id);

    if (error) {
      console.error(error);
      showMessage("Unable to reject this payment request.", "error");
    } else {
      showMessage("Payment request rejected.", "success");
      await fetchData();
    }

    setActionLoadingId(null);
  }

  async function handleApproveEmployer(employer) {
    const confirmed = window.confirm(
      `Activate ${employer.company_name || "this employer"} manually with 5 free job credits? This bypasses payment and should only be used for legacy accounts.`,
    );

    if (!confirmed) return;

    setActionLoadingId(employer.id);
    setMessage("");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error } = await supabase
      .from("employers")
      .update({
        status: "active",
        is_verified: true,
        job_limit: 5,
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq("id", employer.id);

    if (error) {
      console.error(error);
      showMessage("Unable to activate this employer.", "error");
    } else {
      showMessage("Employer activated manually with 5 job credits.", "success");
      await fetchData();
    }

    setActionLoadingId(null);
  }

  async function handleRejectEmployer(employer) {
    if (!window.confirm("Block this employer?")) return;

    setActionLoadingId(employer.id);
    setMessage("");

    const { error } = await supabase
      .from("employers")
      .update({ status: "blocked" })
      .eq("id", employer.id);

    if (error) {
      console.error(error);
      showMessage("Unable to block this employer.", "error");
    } else {
      showMessage("Employer blocked.", "success");
      await fetchData();
    }

    setActionLoadingId(null);
  }

  return (
    <div className="page-shell">
      <div className="container-page max-w-6xl py-8 sm:py-12">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Employers</h1>

        <div className="mt-6">
          <AdminMenu />
        </div>

        {message && (
          <div className="mb-5">
            <FormMessage type={messageType === "success" ? "success" : "error"}>
              {message}
            </FormMessage>
          </div>
        )}

        {loading ? (
          <LoadingState label="Loading..." />
        ) : (
          <>
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
              <p>
                <strong>Automatic activation is on.</strong> When Razorpay confirms
                a payment signature, the employer account is activated without a
                manual step. Review this list only for payments that need attention.
              </p>
            </div>

            <h2 className="mb-4 text-xl font-bold text-ink">Payment Requests</h2>

            {paymentRequests.length === 0 ? (
              <p className="mb-8 rounded-2xl border border-line bg-white px-5 py-6 text-sm text-muted shadow-soft">
                No payment requests pending.
              </p>
            ) : (
              <div className="mb-8 flex flex-col gap-4">
                {paymentRequests.map((req) => {
                  const busy = actionLoadingId === req.id;
                  const reference =
                    req.razorpay_payment_id || req.upi_reference || "Not provided";

                  return (
                    <div key={req.id} className="card p-5 sm:p-6">
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-brand">
                              <Building2 className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <h3 className="text-lg font-bold text-ink">
                              {req.employers?.company_name || "New Company"}
                            </h3>
                          </div>

                          <div className="mt-4 space-y-2 text-sm text-slate-600">
                            <p>
                              <strong className="text-ink">Contact:</strong>{" "}
                              {req.profiles?.name || "—"}
                            </p>
                            <p>
                              <strong className="text-ink">Email:</strong>{" "}
                              {req.profiles?.email || "—"}
                            </p>
                            <p>
                              <strong className="text-ink">Plan:</strong>{" "}
                              {req.plan_name} (₹{req.amount})
                            </p>
                            <p>
                              <strong className="text-ink">Job Limit:</strong>{" "}
                              {req.job_limit} Jobs
                            </p>
                            <p>
                              <strong className="text-ink">Date:</strong>{" "}
                              {new Date(req.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center">
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                              {req.razorpay_payment_id
                                ? "Razorpay Payment ID:"
                                : "UTR / Transaction Number:"}
                            </p>
                            <p className="mt-1 break-all text-base font-extrabold tracking-wide text-ink">
                              {reference}
                            </p>
                            {req.razorpay_order_id && (
                              <p className="mt-1.5 break-all text-xs text-slate-500">
                                Order: {req.razorpay_order_id}
                              </p>
                            )}
                          </div>

                          <p className="mt-3 text-xs leading-5 text-muted">
                            Verify this payment in the Razorpay dashboard before
                            approving. Approving activates the employer with the
                            plan credit.
                          </p>

                          <div className="mt-4 flex gap-2">
                            <button
                              disabled={busy}
                              onClick={() => handleApprovePayment(req)}
                              className="btn min-h-11 flex-1 bg-emerald-600 px-4 py-2 text-xs text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
                            >
                              <Check className="h-4 w-4" aria-hidden="true" />
                              {busy ? "Working..." : "Approve"}
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => handleRejectPayment(req)}
                              className="btn min-h-11 flex-1 bg-rose-600 px-4 py-2 text-xs text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500"
                            >
                              <X className="h-4 w-4" aria-hidden="true" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <h2 className="mb-4 text-xl font-bold text-ink">Pending Employers</h2>

            {pendingEmployers.length === 0 ? (
              <p className="rounded-2xl border border-line bg-white px-5 py-6 text-sm text-muted shadow-soft">
                No pending employers.
              </p>
            ) : (
              <>
                <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                  <p>
                    <strong>Manual activation bypasses payment.</strong> Only use
                    this for older accounts. New employers should pay through
                    Razorpay, which activates them automatically.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {pendingEmployers.map((emp) => {
                    const busy = actionLoadingId === emp.id;

                    return (
                      <div
                        key={emp.id}
                        className="card flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <Building2 className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div>
                            <h4 className="font-bold text-ink">
                              {emp.company_name || "No Company Name"}
                            </h4>
                            <p className="mt-1 text-xs leading-5 text-muted">
                              {emp.profiles?.name} • {emp.profiles?.email} •{" "}
                              {new Date(emp.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            disabled={busy}
                            onClick={() => handleApproveEmployer(emp)}
                            className="btn min-h-10 bg-emerald-600 px-4 py-2 text-xs text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500"
                          >
                            <Check className="h-4 w-4" aria-hidden="true" />
                            {busy ? "Working..." : "Activate (5 credits)"}
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => handleRejectEmployer(emp)}
                            className="btn min-h-10 bg-rose-600 px-4 py-2 text-xs text-white shadow-md shadow-rose-600/20 hover:bg-rose-500"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                            Block
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
