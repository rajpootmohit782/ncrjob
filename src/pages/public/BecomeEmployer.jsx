import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { payForPlan } from "../../lib/razorpay";

const FALLBACK_PLANS = [
  { id: "basic", name: "Basic Plan", price: 9, jobs: 5, validity: "30 Days" },
  { id: "pro", name: "Pro Plan", price: 29, jobs: 35, validity: "90 Days" },
];

export default function BecomeEmployer() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const detailsRef = useRef(null);
  const hasScrolledRef = useRef(false);

  // Company Details
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");

  // Login Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    let active = true;

    supabase
      .from("plans")
      .select("id, name, price_inr, job_limit, duration_days")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (active && data?.length) {
          setPlans(
            data.map((plan) => ({
              id: plan.id,
              name: plan.name,
              price: plan.price_inr,
              jobs: plan.job_limit,
              validity: `${plan.duration_days} Days`,
            })),
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selectedPlan && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedPlan]);

  const plan = plans.find((item) => item.id === selectedPlan) || null;

  function showMessage(text, type) {
    setMessage(text);
    setMessageType(type);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!selectedPlan) {
      showMessage("Please select a plan.", "error");
      return;
    }

    if (!companyName.trim() || !contactPerson.trim() || !phone.trim()) {
      showMessage("Please fill in your company details.", "error");
      return;
    }

    if (!email.trim() || !password) {
      showMessage("Email and password are required.", "error");
      return;
    }

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters.", "error");
      return;
    }

    if (phone.replace(/\D/g, "").length < 10) {
      showMessage("Please enter a valid phone number.", "error");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let userId = session?.user?.id;

      if (
        userId &&
        session?.user?.email &&
        session.user.email.toLowerCase() !== email.trim().toLowerCase()
      ) {
        throw new Error(
          `You are already logged in as ${session.user.email}. Please log out before registering a different company.`,
        );
      }

      // STEP 1: create the login (skipped when retrying after a cancelled payment)
      if (!userId) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: contactPerson.trim(),
              role: "employer",
            },
          },
        });

        if (authError) {
          throw new Error(authError.message);
        }

        if (!authData?.session) {
          throw new Error(
            "This email is already registered. Please log in, then choose a plan from your dashboard.",
          );
        }

        userId = authData.user.id;
      }

      // STEP 2: create / update the company record (stays "pending" until paid)
      const { error: employerError } = await supabase
        .from("employers")
        .upsert(
          {
            user_id: userId,
            company_name: companyName.trim(),
            contact_person: contactPerson.trim(),
            phone: phone.trim(),
          },
          { onConflict: "user_id" },
        );

      if (employerError) {
        throw new Error("Failed to save company: " + employerError.message);
      }

      // STEP 3: Razorpay Checkout (order -> modal -> signature verification)
      showMessage("Opening Razorpay Checkout...", "info");

      const result = await payForPlan({
        planId: selectedPlan,
        prefill: {
          name: contactPerson.trim(),
          email: email.trim(),
          contact: phone.trim(),
        },
      });

      const jobLimit = result?.employer?.job_limit ?? plan?.jobs;
      const expiresAt = result?.employer?.subscription_expires_at
        ? new Date(result.employer.subscription_expires_at).toLocaleDateString(
            "en-IN",
            { day: "numeric", month: "short", year: "numeric" },
          )
        : null;

      showMessage(
        `Payment successful. Your account is active with ${jobLimit} job posts${
          expiresAt ? `, valid till ${expiresAt}` : ""
        }. Taking you to your dashboard...`,
        "success",
      );

      window.setTimeout(() => navigate("/employer-dashboard"), 2500);
    } catch (error) {
      if (error.code === "cancelled") {
        showMessage(
          "Payment cancelled. Your details are saved — click Pay again whenever you are ready.",
          "error",
        );
      } else if (error.code === "failed") {
        showMessage(`${error.message} Please try again.`, "error");
      } else {
        showMessage(error.message, "error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Link to="/" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>← Back to Home</Link>

        <div style={{ textAlign: "center", margin: "20px 0 40px" }}>
          <div style={{ display: "inline-block", backgroundColor: "#fef3c7", color: "#92400e", padding: "4px 12px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold", marginBottom: "12px" }}>
            🎉 Launch Offer - Limited Time!
          </div>
          <h1 style={{ fontSize: "32px", color: "#0f172a", margin: "0 0 8px" }}>Register as Employer & Post Jobs</h1>
          <p style={{ color: "#64748b", fontSize: "16px" }}>Create your account, choose a plan, and start hiring.</p>
        </div>

        {/* STEP 1: Select Plan */}
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ color: "#0f172a", marginBottom: "16px" }}>Step 1: Select Your Plan</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {plans.map((item) => (
              <div
                key={item.id}
                onClick={() => !loading && setSelectedPlan(item.id)}
                style={{
                  backgroundColor: "#fff",
                  padding: "24px",
                  borderRadius: "12px",
                  border: selectedPlan === item.id ? "3px solid #2563eb" : "1px solid #e2e8f0",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow: selectedPlan === item.id ? "0 8px 20px rgba(37, 99, 235, 0.15)" : "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, color: "#0f172a", fontSize: "18px" }}>{item.name}</h3>
                  {selectedPlan === item.id && <span style={{ color: "#2563eb", fontSize: "22px" }}>✓</span>}
                </div>
                <p style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px" }}>₹{item.price}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#475569", lineHeight: "2", fontSize: "14px" }}>
                  <li>✅ Post up to <strong>{item.jobs} Jobs</strong></li>
                  <li>✅ Valid for <strong>{item.validity}</strong></li>
                  <li>✅ Direct WhatsApp Applications</li>
                  <li>✅ No per-hire commission</li>
                </ul>
              </div>
            ))}
          </div>
        </div>

        {plan && (
          <>
            {/* STEP 2: Payment Summary */}
            <div style={{ backgroundColor: "#eff6ff", padding: "20px", borderRadius: "12px", marginBottom: "24px", textAlign: "center", border: "1px solid #bfdbfe" }}>
              <p style={{ margin: "0 0 8px", fontWeight: "bold", color: "#1e3a8a", fontSize: "16px" }}>
                Step 2: Pay ₹{plan.price} securely via Razorpay
              </p>
              <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}>
                UPI, card, net banking and wallets are supported. Your account is
                activated automatically once the payment is verified.
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#64748b" }}>
                🔒 Secured by Razorpay. We never see or store your card details.
              </p>
            </div>

            {/* STEP 3: Registration Form */}
            <div ref={detailsRef} style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h2 style={{ marginTop: 0, color: "#0f172a", marginBottom: "20px" }}>Step 3: Fill Your Details</h2>

              <form onSubmit={handleSubmit}>
                {/* Company Details */}
                <h3 style={{ color: "#475569", fontSize: "15px", marginBottom: "12px" }}>Company Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "20px" }}>
                  <input type="text" placeholder="Company Name *" value={companyName} onChange={e => setCompanyName(e.target.value)} required disabled={loading} style={{ padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px" }} />
                  <input type="text" placeholder="Contact Person *" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required disabled={loading} style={{ padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px" }} />
                  <input type="tel" placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} required disabled={loading} style={{ padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px" }} />
                </div>

                {/* Login Credentials */}
                <h3 style={{ color: "#475569", fontSize: "15px", marginBottom: "12px" }}>Login Credentials</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "20px" }}>
                  <input type="email" placeholder="Email (for login) *" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} style={{ padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px" }} />
                  <input type="password" placeholder="Password (min 6 chars) *" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} disabled={loading} style={{ padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px" }} />
                </div>

                {/* Payment Summary */}
                <h3 style={{ color: "#475569", fontSize: "15px", marginBottom: "12px" }}>Payment</h3>
                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "10px", marginBottom: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: "bold", color: "#0f172a" }}>
                        {plan.name} — {plan.jobs} job posts
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                        Valid for {plan.validity} from activation.
                      </p>
                    </div>
                    <strong style={{ fontSize: "24px", color: "#0f172a" }}>₹{plan.price}</strong>
                  </div>
                </div>

                {/* Message */}
                {message && (
                  <p style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    backgroundColor: messageType === "success" ? "#dcfce7" : messageType === "info" ? "#dbeafe" : "#fee2e2",
                    color: messageType === "success" ? "#166534" : messageType === "info" ? "#1e40af" : "#991b1b",
                    fontWeight: "600",
                    fontSize: "14px"
                  }}>
                    {message}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: loading ? "#94a3b8" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)"
                  }}
                >
                  {loading ? "Opening Razorpay..." : `Pay ₹${plan.price} & Activate`}
                </button>

                <p style={{ textAlign: "center", marginTop: "14px", fontSize: "13px", color: "#64748b" }}>
                  Already registered? <Link to="/employer-login" style={{ color: "#2563eb" }}>Login here</Link>
                </p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
