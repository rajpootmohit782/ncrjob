import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminMenu from "../../components/AdminMenu";

export default function AdminEmployers() {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const { data: subData } = await supabase
      .from("employer_subscriptions")
      .select(`
        id,
        plan_name,
        amount,
        job_limit,
        upi_reference,
        status,
        created_at,
        profiles (name, email),
        employers (company_name, user_id)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const { data: empData } = await supabase
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
      .order("created_at", { ascending: false });

    setPaymentRequests(subData || []);
    setPendingEmployers(empData || []);
    setLoading(false);
  }

  async function handleApprovePayment(request) {
    setActionLoadingId(request.id);
    
    await supabase.from("employer_subscriptions").update({ status: "approved" }).eq("id", request.id);
    
    const days = request.plan_name.includes("Pro") ? 90 : 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const userId = request.employers?.user_id || request.profiles?.id;
    
    await supabase
      .from("employers")
      .update({
        status: "active",
        is_verified: true,
        job_limit: request.job_limit,
        subscription_expires_at: expiresAt.toISOString()
      })
      .eq("user_id", userId);

    fetchData();
    setActionLoadingId(null);
    alert("Employer approved and activated!");
  }

  async function handleApproveEmployer(employer) {
    setActionLoadingId(employer.id);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await supabase
      .from("employers")
      .update({
        status: "active",
        is_verified: true,
        job_limit: 5,
        subscription_expires_at: expiresAt.toISOString()
      })
      .eq("id", employer.id);

    fetchData();
    setActionLoadingId(null);
    alert("Employer approved with 5 free jobs!");
  }

  async function handleRejectEmployer(employer) {
    if (!confirm("Reject this employer?")) return;
    setActionLoadingId(employer.id);
    
    await supabase
      .from("employers")
      .update({ status: "blocked" })
      .eq("id", employer.id);

    fetchData();
    setActionLoadingId(null);
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px" }}>
      <h1>Approve Employers & Payments</h1>
      <AdminMenu />

      {loading ? <p>Loading...</p> : (
        <>
          {/* Payment Requests */}
          <h2 style={{ color: "#0f172a", marginBottom: "16px" }}>💳 Payment Requests (Verify UTR)</h2>
          
          {paymentRequests.length === 0 ? (
            <p style={{ color: "#64748b", marginBottom: "30px" }}>No payment requests pending.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "30px" }}>
              {paymentRequests.map((req) => (
                <div key={req.id} style={{ border: "1px solid #e2e8f0", padding: "20px", borderRadius: "12px", backgroundColor: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <h3 style={{ margin: "0 0 12px", color: "#0f172a" }}>{req.employers?.company_name || "New Company"}</h3>
                      <p style={{ margin: "4px 0", color: "#475569", fontSize: "14px" }}><strong>Contact:</strong> {req.profiles?.name}</p>
                      <p style={{ margin: "4px 0", color: "#475569", fontSize: "14px" }}><strong>Email:</strong> {req.profiles?.email}</p>
                      <p style={{ margin: "4px 0", color: "#475569", fontSize: "14px" }}><strong>Plan:</strong> {req.plan_name} (₹{req.amount})</p>
                      <p style={{ margin: "4px 0", color: "#475569", fontSize: "14px" }}><strong>Job Limit:</strong> {req.job_limit} Jobs</p>
                      <p style={{ margin: "4px 0", color: "#475569", fontSize: "14px" }}><strong>Date:</strong> {new Date(req.created_at).toLocaleString()}</p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ backgroundColor: "#f0fdf4", padding: "14px", borderRadius: "8px", marginBottom: "14px", border: "1px solid #bbf7d0" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#166534", fontWeight: "bold" }}>UTR / Transaction Number:</p>
                        <p style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a", letterSpacing: "1px" }}>
                          {req.upi_reference || "Not provided"}
                        </p>
                      </div>
                      <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
                        ✅ Check your PhonePe/UPI app for ₹{req.amount} with this UTR number.
                      </p>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button 
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleApprovePayment(req)} 
                          style={{ flex: 1, padding: "12px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                        >
                          ✓ Approve
                        </button>
                        <button 
                          disabled={actionLoadingId === req.id}
                          onClick={() => {
                            if (confirm("Reject this payment?")) {
                              supabase.from("employer_subscriptions").update({ status: "rejected" }).eq("id", req.id).then(() => fetchData());
                            }
                          }} 
                          style={{ flex: 1, padding: "12px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Old Registration Pending Employers */}
          <h2 style={{ color: "#0f172a", marginBottom: "16px" }}>👥 Pending Employers (Old Registration)</h2>
          
          {pendingEmployers.length === 0 ? (
            <p style={{ color: "#64748b" }}>No pending employers from old registration.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pendingEmployers.map((emp) => (
                <div key={emp.id} style={{ border: "1px solid #e2e8f0", padding: "16px", borderRadius: "10px", backgroundColor: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h4 style={{ margin: "0 0 6px", color: "#0f172a" }}>{emp.company_name || "No Company Name"}</h4>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                      {emp.profiles?.name} • {emp.profiles?.email} • {new Date(emp.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button 
                      disabled={actionLoadingId === emp.id}
                      onClick={() => handleApproveEmployer(emp)} 
                      style={{ padding: "8px 16px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      Approve (Free 5 Jobs)
                    </button>
                    <button 
                      disabled={actionLoadingId === emp.id}
                      onClick={() => handleRejectEmployer(emp)} 
                      style={{ padding: "8px 16px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}