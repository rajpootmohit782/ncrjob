import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import AdminMenu from "../../components/AdminMenu";
import { formatDate } from "../../lib/format";
import {
  AlertIcon,
  BuildingIcon,
  CheckIcon,
  ClockIcon,
  CreditCardIcon,
  ExternalIcon,
  ShieldIcon,
} from "../../components/Icons";

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
          profiles ( name, email ),
          employers ( company_name, user_id )
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
          profiles ( name, email )
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
    <div className="page dash">
      <div className="container">
        <div className="dash-head">
          <div className="dash-title">
            <span className="avatar-lg">
              <BuildingIcon />
            </span>
            <div>
              <span className="eyebrow">Admin console</span>
              <h1>Employers</h1>
              <p>Verify payments and activate company accounts.</p>
            </div>
          </div>

          <div className="dash-actions">
            <span className="badge badge-brand">
              {loading
                ? "Loading…"
                : `${paymentRequests.length} payment${
                    paymentRequests.length === 1 ? "" : "s"
                  } · ${pendingEmployers.length} pending`}
            </span>
            <Link className="btn btn-secondary btn-sm" to="/admin/jobs">
              <ExternalIcon size={14} /> Manage jobs
            </Link>
          </div>
        </div>

        <AdminMenu />

        {message && (
          <div
            className={`alert ${
              messageType === "success" ? "alert-success" : "alert-error"
            }`}
            role="status"
          >
            {messageType === "success" ? <CheckIcon /> : <AlertIcon />}
            <span>{message}</span>
          </div>
        )}

        <section className="section-sm">
          <div className="section-head">
            <div>
              <h2>Payment requests</h2>
              <p className="section-sub">
                Razorpay payments usually activate accounts automatically. This
                list is for payments that need a manual review.
              </p>
            </div>
            <span className="badge badge-warn">
              {paymentRequests.length} pending
            </span>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: "10rem" }} />
          ) : paymentRequests.length === 0 ? (
            <div className="card card-pad">
              <p className="small muted">
                No payment requests pending. Verified Razorpay payments activate
                employer accounts automatically.
              </p>
            </div>
          ) : (
            <div className="stack">
              {paymentRequests.map((request) => {
                const busy = actionLoadingId === request.id;
                const reference =
                  request.razorpay_payment_id ||
                  request.upi_reference ||
                  "Not provided";

                return (
                  <article className="card card-pad" key={request.id}>
                    <div className="section-head">
                      <div>
                        <span className="eyebrow">Manual review</span>
                        <h3>
                          {request.employers?.company_name || "New company"}
                        </h3>
                      </div>
                      <span className="badge badge-warn">Pending</span>
                    </div>

                    <div className="detail-grid mt-2">
                      <dl className="kv-list">
                        <div className="kv">
                          <dt>Contact</dt>
                          <dd>{request.profiles?.name || "—"}</dd>
                        </div>
                        <div className="kv">
                          <dt>Email</dt>
                          <dd>{request.profiles?.email || "—"}</dd>
                        </div>
                        <div className="kv">
                          <dt>Plan</dt>
                          <dd>
                            {request.plan_name} · ₹{request.amount}
                          </dd>
                        </div>
                        <div className="kv">
                          <dt>Job limit</dt>
                          <dd>{request.job_limit} jobs</dd>
                        </div>
                        <div className="kv">
                          <dt>Requested</dt>
                          <dd>{formatDate(request.created_at)}</dd>
                        </div>
                      </dl>

                      <div>
                        <div className="payment-box">
                          <span className="small muted">
                            {request.razorpay_payment_id
                              ? "Razorpay payment ID"
                              : "UTR / transaction number"}
                          </span>
                          <span className="mono">{reference}</span>
                          {request.razorpay_order_id && (
                            <span className="cell-sub">
                              Order: {request.razorpay_order_id}
                            </span>
                          )}
                        </div>

                        <p className="field-help mt-1">
                          Verify this payment in the Razorpay dashboard before
                          approving. Approving activates the employer with the
                          plan credit.
                        </p>

                        <div className="form-actions mt-2">
                          <button
                            className="btn btn-primary"
                            disabled={busy}
                            onClick={() => handleApprovePayment(request)}
                          >
                            <CreditCardIcon size={15} />
                            {busy ? "Working…" : "Approve payment"}
                          </button>
                          <button
                            className="btn btn-ghost"
                            disabled={busy}
                            onClick={() => handleRejectPayment(request)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2>Pending employers</h2>
              <p className="section-sub">
                Accounts created before online payments that were never activated.
              </p>
            </div>
            <span className="badge badge-muted">
              {pendingEmployers.length} pending
            </span>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: "8rem" }} />
          ) : pendingEmployers.length === 0 ? (
            <div className="card card-pad">
              <p className="small muted">
                No legacy employer accounts are waiting for manual activation.
              </p>
            </div>
          ) : (
            <>
              <div className="notice notice-warn">
                <AlertIcon />
                <div>
                  <strong>Manual activation bypasses payment.</strong> Only use
                  this for older accounts. New employers should pay through
                  Razorpay, which activates them automatically.
                </div>
              </div>

              <div className="table-wrap mt-2">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Email</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pendingEmployers.map((employer) => {
                      const busy = actionLoadingId === employer.id;

                      return (
                        <tr key={employer.id}>
                          <td>
                            <div className="cell-title">
                              {employer.company_name || "No company name"}
                            </div>
                            <div className="cell-sub">
                              {employer.is_verified
                                ? "Verified"
                                : "Not verified"}
                            </div>
                          </td>
                          <td>{employer.profiles?.name || "—"}</td>
                          <td>{employer.profiles?.email || "—"}</td>
                          <td className="muted">
                            {formatDate(employer.created_at)}
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn btn-success btn-sm"
                                disabled={busy}
                                onClick={() => handleApproveEmployer(employer)}
                              >
                                {busy ? "Working…" : "Activate (5 credits)"}
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={busy}
                                onClick={() => handleRejectEmployer(employer)}
                              >
                                Block
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <div className="notice notice-info mt-2">
          <ShieldIcon />
          <div>
            <strong>Automatic activation is on.</strong> When Razorpay confirms a
            signature, the employer account is activated and credits are added
            without any manual step.
          </div>
        </div>

        <div className="row mt-2">
          <ClockIcon size={14} />
          <span className="small muted">
            All times are shown in your local timezone.
          </span>
        </div>
      </div>
    </div>
  );
}
