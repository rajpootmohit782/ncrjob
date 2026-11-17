import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminMenu from "../../components/AdminMenu";

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
        .select(`
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
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("employers")
        .select(`
          id,
          user_id,
          company_name,
          status,
          is_verified,
          job_limit,
          created_at,
          profiles (name, email)
        `)
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
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px" }}>
      <h1>Employers</h1>
      <AdminMenu />

      {message && (
        <p
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            backgroundColor: messageType === "success" ? "#dcfce7" : "#fee2e2",
            color: messageType === "success" ? "#166534" : "#991b1b",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          {message}
        </p>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", padding: "14px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px" }}>
            <strong>Automatic activation is on.</strong> When Razorpay confirms a
            payment signature, the employer account is activated without a manual
            step. Review this list only for payments that need attention.
          </div>

          <h2 style={{ color: "#0f172a", marginBottom: "16px" }}>
            Payment Requests
          </h2>

          {paymentRequests.length === 0 ? (
            <p style={{ color: "#64748b", marginBottom: "30px" }}>
              No payment requests pending.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "30px" }}>
              {paymentRequests.map((req) => {
                const busy = actionLoadingId === req.id;
                const reference =
                  req.razorpay_payment_id ||
                  req.upi_reference ||
                  "Not provided";

                return (
                  <div key={req.id} style={{ border: "1px solid #e2e8f0", padding: "20px", borderRadius: "12px", backgroundColor: "#fff" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div>
                        <h3 style={{ margin: "0 0 12px", color: "#0f172a" }}>
                          {req.employers?.company_name || "New Company"}
                        </h3>
                        <p style={{ margin: "4px 0", color: "#475569", fontSize: "14px" }}><strong>Contact:</strong> {req.profiles?.name || "—"}</p>
                        <p style={{ margin: "4px 0", color: "#475569", fontSize: "14px" }}><strong>Email:</strong> {req.profiles?.email || "—"}</p>
                        <p style={{ margin: "4px 0", color: "#475569", fontSize: "14px" }}><strong>Plan:</strong> {req.plan_name} (₹{req.amount})</p>
                        <p style={{ margin: "4px 0", color: "#475569", fontSize: "14px" }}><strong>Job Limit:</strong> {req.job_limit} Jobs</p>
                        <p style={{ margin: "4px 0", color: "#475569", fontSize: "14px" }}><strong>Date:</strong> {new Date(req.created_at).toLocaleString()}</p>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div style={{ backgroundColor: "#f0fdf4", padding: "14px", borderRadius: "8px", marginBottom: "14px", border: "1px solid #bbf7d0" }}>
                          <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#166534", fontWeight: "bold" }}>
                            {req.razorpay_payment_id ? "Razorpay Payment ID:" : "UTR / Transaction Number:"}
                          </p>
                          <p style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a", letterSpacing: "0.5px", wordBreak: "break-all" }}>
                            {reference}
                          </p>
                          {req.razorpay_order_id && (
                            <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#475569", wordBreak: "break-all" }}>
                              Order: {req.razorpay_order_id}
                            </p>
                          )}
                        </div>
                        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
                          Verify this payment in the Razorpay dashboard before
                          approving. Approving activates the employer with the
                          plan credit.
                        </p>

                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            disabled={busy}
                            onClick={() => handleApprovePayment(req)}
                            style={{ flex: 1, padding: "12px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", cursor: busy ? "not-allowed" : "pointer", fontWeight: "bold" }}
                          >
                            {busy ? "Working..." : "✓ Approve"}
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => handleRejectPayment(req)}
                            style={{ flex: 1, padding: "12px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", cursor: busy ? "not-allowed" : "pointer", fontWeight: "bold" }}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <h2 style={{ color: "#0f172a", marginBottom: "16px" }}>
            Pending Employers
          </h2>

          {pendingEmployers.length === 0 ? (
            <p style={{ color: "#64748b" }}>No pending employers.</p>
          ) : (
            <>
              <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px" }}>
                <strong>Manual activation bypasses payment.</strong> Only use this
                for older accounts. New employers should pay through Razorpay,
                which activates them automatically.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pendingEmployers.map((emp) => {
                  const busy = actionLoadingId === emp.id;

                  return (
                    <div key={emp.id} style={{ border: "1px solid #e2e8f0", padding: "16px", borderRadius: "10px", backgroundColor: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <h4 style={{ margin: "0 0 6px", color: "#0f172a" }}>{emp.company_name || "No Company Name"}</h4>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                          {emp.profiles?.name} • {emp.profiles?.email} • {new Date(emp.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          disabled={busy}
                          onClick={() => handleApproveEmployer(emp)}
                          style={{ padding: "8px 16px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", cursor: busy ? "not-allowed" : "pointer", fontWeight: "bold" }}
                        >
                          {busy ? "Working..." : "Activate (5 credits)"}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => handleRejectEmployer(emp)}
                          style={{ padding: "8px 16px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", cursor: busy ? "not-allowed" : "pointer" }}
                        >
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
  );
}
