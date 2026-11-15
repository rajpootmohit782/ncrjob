import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { payForPlan } from "../../lib/razorpay";
import {
  AlertIcon,
  CheckIcon,
  CreditCardIcon,
  InfoIcon,
  ShieldIcon,
  WhatsAppIcon,
} from "../../components/Icons";

// Used until (or if) the `plans` table cannot be loaded. The real amount is
// always validated by the create-order Edge Function from the database.
const FALLBACK_PLANS = [
  { id: "basic", name: "Basic Plan", price_inr: 9, job_limit: 5, duration_days: 30 },
  { id: "pro", name: "Pro Plan", price_inr: 29, job_limit: 35, duration_days: 90 },
];

export default function BecomeEmployer() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const detailsRef = useRef(null);
  const hasScrolledRef = useRef(false);

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");

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
          setPlans(data);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const plan = plans.find((item) => item.id === selectedPlan) || null;

  useEffect(() => {
    if (selectedPlan && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedPlan]);

  function showMessage(text, type) {
    setMessage(text);
    setMessageType(type);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (!selectedPlan) {
      showMessage("Please select a plan to continue.", "error");
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
      showMessage("Opening Razorpay Checkout…", "info");

      const result = await payForPlan({
        planId: selectedPlan,
        prefill: {
          name: contactPerson.trim(),
          email: email.trim(),
          contact: phone.trim(),
        },
      });

      const jobLimit = result?.employer?.job_limit ?? plan?.job_limit;
      const expiresAt = result?.employer?.subscription_expires_at
        ? new Date(result.employer.subscription_expires_at).toLocaleDateString(
            "en-IN",
            { day: "numeric", month: "short", year: "numeric" },
          )
        : null;

      showMessage(
        `Payment successful. Your account is active with ${jobLimit} job posts${
          expiresAt ? `, valid till ${expiresAt}` : ""
        }. Taking you to your dashboard…`,
        "success",
      );

      setTimeout(() => navigate("/employer-dashboard"), 2500);
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

  const alertClass =
    messageType === "success"
      ? "alert-success"
      : messageType === "info"
        ? "alert-info"
        : "alert-error";

  const MessageIcon =
    messageType === "success"
      ? CheckIcon
      : messageType === "info"
        ? InfoIcon
        : AlertIcon;

  return (
    <div className="page">
      <div className="container container-md">
        <div className="page-head">
          <div>
            <span className="eyebrow">For employers</span>
            <h1>Hire with confidence</h1>
            <p className="page-sub">
              Create your company account, choose a plan and publish your first
              role in minutes.
            </p>
          </div>

          <div className="steps" aria-label="Signup steps">
            <span
              className={`step-pill${
                messageType === "success" || selectedPlan ? "" : " active"
              }`}
            >
              <b>1</b> Choose a plan
            </span>
            <span
              className={`step-pill${
                selectedPlan && messageType !== "success" ? " active" : ""
              }`}
            >
              <b>2</b> Company details
            </span>
            <span
              className={`step-pill${
                messageType === "success" ? " active" : ""
              }`}
            >
              <b>3</b> Go live
            </span>
          </div>
        </div>

        <div className="stack-lg">
          <section>
            <div className="section-head">
              <div>
                <h2>Choose a plan</h2>
                <p className="section-sub">
                  Simple one-time pricing. No commission on hires.
                </p>
              </div>
              <span className="badge badge-brand">Launch pricing</span>
            </div>

            <div className="plan-grid">
              {plans.map((item, index) => {
                const selected = selectedPlan === item.id;

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`plan-card${selected ? " selected" : ""}`}
                    onClick={() => !loading && setSelectedPlan(item.id)}
                    aria-pressed={selected}
                    disabled={loading}
                  >
                    {index === plans.length - 1 && plans.length > 1 && (
                      <span className="plan-flag">Best value</span>
                    )}

                    <span className="plan-check" aria-hidden="true">
                      <CheckIcon />
                    </span>

                    <span className="plan-name">{item.name}</span>

                    <span className="plan-price">
                      ₹{item.price_inr} <small>one-time</small>
                    </span>

                    <ul className="plan-list">
                      <li>
                        <CheckIcon /> Post up to <strong>{item.job_limit} jobs</strong>
                      </li>
                      <li>
                        <CheckIcon /> Live for <strong>{item.duration_days} days</strong>
                      </li>
                      <li>
                        <CheckIcon /> Direct WhatsApp applications
                      </li>
                      <li>
                        <CheckIcon /> No per-hire commission
                      </li>
                    </ul>
                  </button>
                );
              })}
            </div>
            <p className="field-help mt-1">
              Select a plan to continue. You can review all details before
              paying.
            </p>
          </section>

          {plan && (
            <section className="card card-pad scroll-target" ref={detailsRef}>
              <div className="section-head">
                <div>
                  <h2>Your details</h2>
                  <p className="section-sub">
                    These details appear on your job listings.
                  </p>
                </div>
                <span className="badge badge-muted">{plan.name}</span>
              </div>

              <form className="form-grid" onSubmit={handleSubmit}>
                <fieldset className="fieldset">
                  <div className="fieldset-title">Company details</div>

                  <div className="field-row">
                    <label className="field">
                      <span className="field-label">Company name *</span>
                      <input
                        className="input"
                        type="text"
                        placeholder="e.g. Sunrise Logistics"
                        value={companyName}
                        onChange={(event) => setCompanyName(event.target.value)}
                        required
                        disabled={loading}
                        autoComplete="organization"
                      />
                    </label>

                    <label className="field">
                      <span className="field-label">Contact person *</span>
                      <input
                        className="input"
                        type="text"
                        placeholder="Full name"
                        value={contactPerson}
                        onChange={(event) => setContactPerson(event.target.value)}
                        required
                        disabled={loading}
                        autoComplete="name"
                      />
                    </label>
                  </div>

                  <label className="field mt-2">
                    <span className="field-label">Phone number *</span>
                    <input
                      className="input"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      required
                      disabled={loading}
                      autoComplete="tel"
                    />
                    <span className="field-help">
                      Used for payment confirmation and employer support only.
                    </span>
                  </label>
                </fieldset>

                <fieldset className="fieldset">
                  <div className="fieldset-title">Login credentials</div>

                  <div className="field-row">
                    <label className="field">
                      <span className="field-label">Email *</span>
                      <input
                        className="input"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        disabled={loading}
                        autoComplete="email"
                      />
                    </label>

                    <label className="field">
                      <span className="field-label">Password *</span>
                      <input
                        className="input"
                        type="password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        minLength={6}
                        disabled={loading}
                        autoComplete="new-password"
                      />
                    </label>
                  </div>

                  <p className="field-help mt-1">
                    You will use this email and password to sign in to your
                    employer dashboard.
                  </p>
                </fieldset>

                <fieldset className="fieldset">
                  <div className="fieldset-title">Payment</div>

                  <div className="pay-summary">
                    <div>
                      <strong>
                        {plan.name} — {plan.job_limit} job posts
                      </strong>
                      <span>Valid for {plan.duration_days} days from activation.</span>
                    </div>
                    <b>₹{plan.price_inr}</b>
                  </div>

                  <p className="field-help mt-1">
                    Pay securely by UPI, card, net banking or wallet. Your
                    account is activated automatically the moment the payment is
                    verified.
                  </p>

                  {message && (
                    <div className={`alert ${alertClass} mt-2`} role="status">
                      <MessageIcon />
                      <span>{message}</span>
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-lg btn-block mt-2"
                    type="submit"
                    disabled={loading}
                  >
                    <CreditCardIcon />
                    {loading ? "Please wait…" : `Pay ₹${plan.price_inr} & activate`}
                  </button>

                  <p className="pay-note">
                    <ShieldIcon /> Secured by Razorpay. We never see or store your
                    card details.
                  </p>
                </fieldset>
              </form>

              <div className="auth-switch">
                Already registered?{" "}
                <Link to="/employer-login">Sign in to your dashboard</Link>
              </div>
            </section>
          )}

          <div className="notice notice-info">
            <WhatsAppIcon />
            <div>
              <strong>Applications land directly with you.</strong> Candidates
              message your WhatsApp number from each listing — no inbox to manage
              and no candidate fees.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
