import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function BecomeEmployer() {
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Company Details
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  
  // Login Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Payment - UTR only
  const [utrNumber, setUtrNumber] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const plans = [
    { id: "basic", name: "Basic Plan", price: 9, jobs: 5, validity: "30 Days" },
    { id: "pro", name: "Pro Plan", price: 29, jobs: 35, validity: "90 Days" },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!selectedPlan) {
      setMessage("Please select a plan.");
      setMessageType("error");
      return;
    }
    if (!companyName || !contactPerson || !phone || !email || !password || !utrNumber) {
      setMessage("Please fill all required fields.");
      setMessageType("error");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }
    if (utrNumber.length < 6) {
      setMessage("Please enter a valid UTR/Transaction number.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Create Auth Account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: contactPerson,
            role: "employer",
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setMessage("This email is already registered. Please login first.");
          setMessageType("error");
          setLoading(false);
          return;
        }
        throw new Error(authError.message);
      }

      const userId = authData.user.id;

      // STEP 2: Create Employer Record
      const { error: employerError } = await supabase
        .from("employers")
        .upsert({
          user_id: userId,
          company_name: companyName,
          status: "pending",
          is_verified: false,
          job_limit: 0,
        }, { onConflict: 'user_id' });

      if (employerError) throw new Error("Failed to save company: " + employerError.message);

      // STEP 3: Create Subscription Request (UTR only, no screenshot)
      const planDetails = plans.find(p => p.id === selectedPlan);
      const { error: subError } = await supabase
        .from("employer_subscriptions")
        .insert({
          user_id: userId,
          plan_name: planDetails.name,
          amount: planDetails.price,
          job_limit: planDetails.jobs,
          payment_screenshot_url: null,
          upi_reference: utrNumber,
          status: "pending"
        });

      if (subError) throw new Error("Failed to save payment: " + subError.message);

      setMessage("✅ Registration successful! Admin will verify your UTR number within 24 hours. You can login after approval.");
      setMessageType("success");

      setTimeout(() => navigate("/login"), 4000);

    } catch (error) {
      setMessage("❌ " + error.message);
      setMessageType("error");
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
          <p style={{ color: "#64748b", fontSize: "16px" }}>Create your account, pay the fee, and start hiring.</p>
        </div>

        {/* STEP 1: Select Plan */}
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ color: "#0f172a", marginBottom: "16px" }}>Step 1: Select Your Plan</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {plans.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                style={{
                  backgroundColor: "#fff",
                  padding: "24px",
                  borderRadius: "12px",
                  border: selectedPlan === plan.id ? "3px solid #2563eb" : "1px solid #e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: selectedPlan === plan.id ? "0 8px 20px rgba(37, 99, 235, 0.15)" : "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, color: "#0f172a", fontSize: "18px" }}>{plan.name}</h3>
                  {selectedPlan === plan.id && <span style={{ color: "#2563eb", fontSize: "22px" }}>✓</span>}
                </div>
                <p style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px" }}>₹{plan.price}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#475569", lineHeight: "2", fontSize: "14px" }}>
                  <li>✅ Post up to <strong>{plan.jobs} Jobs</strong></li>
                  <li>✅ Valid for <strong>{plan.validity}</strong></li>
                  <li>✅ Direct WhatsApp Applications</li>
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 2: Payment Info */}
        {selectedPlan && (
          <>
            <div style={{ backgroundColor: "#eff6ff", padding: "20px", borderRadius: "12px", marginBottom: "24px", textAlign: "center", border: "1px solid #bfdbfe" }}>
              <p style={{ margin: "0 0 8px", fontWeight: "bold", color: "#1e3a8a", fontSize: "16px" }}>
                Step 2: Pay ₹{plans.find(p => p.id === selectedPlan).price} via UPI
              </p>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a", letterSpacing: "1px" }}>
                vmjob-portal@ybl
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#475569" }}>
                Open GPay / PhonePe / Paytm → Send money → Note down the UTR/Transaction Number
              </p>
            </div>

            {/* STEP 3: Registration Form */}
            <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h2 style={{ marginTop: 0, color: "#0f172a", marginBottom: "20px" }}>Step 3: Fill Your Details</h2>
              
              <form onSubmit={handleSubmit}>
                {/* Company Details */}
                <h3 style={{ color: "#475569", fontSize: "15px", marginBottom: "12px" }}>Company Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                  <input type="text" placeholder="Company Name *" value={companyName} onChange={e => setCompanyName(e.target.value)} required style={{ padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px" }} />
                  <input type="text" placeholder="Contact Person *" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required style={{ padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px" }} />
                  <input type="tel" placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} required style={{ padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px" }} />
                  <div></div>
                </div>

                {/* Login Credentials */}
                <h3 style={{ color: "#475569", fontSize: "15px", marginBottom: "12px" }}>Login Credentials</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                  <input type="email" placeholder="Email (for login) *" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px" }} />
                  <input type="password" placeholder="Password (min 6 chars) *" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={{ padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px" }} />
                </div>

                {/* UTR Number */}
                <h3 style={{ color: "#475569", fontSize: "15px", marginBottom: "12px" }}>Payment Verification</h3>
                <div style={{ marginBottom: "24px" }}>
                  <input 
                    type="text" 
                    placeholder="Enter UTR / Transaction Reference Number *" 
                    value={utrNumber} 
                    onChange={e => setUtrNumber(e.target.value)} 
                    required 
                    style={{ padding: "12px 14px", border: "2px solid #2563eb", borderRadius: "8px", fontSize: "15px", width: "100%", boxSizing: "border-box" }} 
                  />
                  <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#64748b" }}>
                    You will find this in your UPI app transaction history. Example: 4235XXXXXXXX1234
                  </p>
                </div>

                {/* Message */}
                {message && (
                  <p style={{ 
                    padding: "12px 16px", 
                    borderRadius: "8px", 
                    marginBottom: "16px",
                    backgroundColor: messageType === "success" ? "#dcfce7" : "#fee2e2",
                    color: messageType === "success" ? "#166534" : "#991b1b",
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
                  {loading ? "Submitting..." : `Submit Registration (₹${plans.find(p => p.id === selectedPlan)?.price})`}
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