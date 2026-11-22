import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Lock,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { payForPlan } from "../../lib/razorpay";
import { FormMessage } from "../../components/ui";
import useSeo from "../../hooks/useSeo";

const FALLBACK_PLANS = [
  { id: "basic", name: "Basic Plan", price: 9, jobs: 5, validity: "30 Days" },
  { id: "pro", name: "Pro Plan", price: 29, jobs: 35, validity: "90 Days" },
];

export default function BecomeEmployer() {
  useSeo({ title: "Hire in Delhi NCR | Post Jobs on VMWjobs", description: "Reach job seekers across Noida, Greater Noida, Gurugram and Delhi. Create an employer account and post private-sector openings on VMWjobs.", path: "/become-employer" });
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
    <div className="page-shell">
      <section className="hero-gradient relative overflow-hidden pb-24 pt-12 sm:pt-16">
        <div className="hero-dots pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="hero-glow pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full blur-3xl" aria-hidden="true" />
        <div className="container-page relative z-10">
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-indigo-100 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </Link>

          <div className="mx-auto mt-8 max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-4 py-2 text-sm font-semibold text-amber-300 ring-1 ring-amber-300/20">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Launch Offer - Limited Time!
            </span>
            <h1 className="mt-5 text-3xl font-extrabold text-white sm:text-5xl">
              Register as Employer &amp; Post Jobs
            </h1>
            <p className="mt-4 text-sm leading-7 text-indigo-100/80 sm:text-base">
              Create your account, choose a plan, and start hiring.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page -mt-14 pb-16">
        <div className="mx-auto max-w-4xl">
          {/* STEP 1: Select Plan */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                1
              </span>
              <h2 className="text-xl font-bold text-ink sm:text-2xl">Step 1: Select Your Plan</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {plans.map((item) => {
                const selected = selectedPlan === item.id;
                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected}
                    onClick={() => !loading && setSelectedPlan(item.id)}
                    onKeyDown={(event) => {
                      if ((event.key === "Enter" || event.key === " ") && !loading) {
                        event.preventDefault();
                        setSelectedPlan(item.id);
                      }
                    }}
                    className={`card relative cursor-pointer p-6 transition-all duration-200 ${
                      selected
                        ? "border-2 border-brand shadow-lift ring-4 ring-indigo-500/10"
                        : "hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lift"
                    } ${loading ? "cursor-not-allowed opacity-70" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">{item.name}</p>
                        <p className="mt-3 font-display text-4xl font-extrabold text-ink">
                          ₹{item.price}
                        </p>
                      </div>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${selected ? "border-brand bg-brand text-white" : "border-line bg-white text-transparent"}`}>
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>

                    <ul className="mt-6 space-y-3 text-sm text-slate-600">
                      <li className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                        <span>Post up to <strong className="text-ink">{item.jobs} Jobs</strong></span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                        <span>Valid for <strong className="text-ink">{item.validity}</strong></span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                        <span>Direct WhatsApp Applications</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                        <span>No per-hire commission</span>
                      </li>
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {plan && (
            <>
              {/* STEP 2: Payment Summary */}
              <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-base font-bold text-indigo-950">
                      <CreditCard className="h-5 w-5 text-brand" aria-hidden="true" />
                      Step 2: Pay ₹{plan.price} securely via Razorpay
                    </p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      UPI, card, net banking and wallets are supported. Your account is
                      activated automatically once the payment is verified.
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                      Secured by Razorpay. We never see or store your card details.
                    </p>
                  </div>
                </div>
              </div>

              {/* STEP 3: Registration Form */}
              <div ref={detailsRef} className="card mt-6 scroll-mt-24 p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                    3
                  </span>
                  <h2 className="text-xl font-bold text-ink sm:text-2xl">Step 3: Fill Your Details</h2>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Company Details */}
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Company Details</h3>
                  <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <input type="text" placeholder="Company Name *" value={companyName} onChange={e => setCompanyName(e.target.value)} required disabled={loading} className="input" />
                    <input type="text" placeholder="Contact Person *" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required disabled={loading} className="input" />
                    <input type="tel" placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} required disabled={loading} className="input" />
                  </div>

                  {/* Login Credentials */}
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Login Credentials</h3>
                  <div className="mb-6 grid gap-3 sm:grid-cols-2">
                    <input type="email" placeholder="Email (for login) *" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} className="input" />
                    <input type="password" placeholder="Password (min 6 chars) *" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} disabled={loading} className="input" />
                  </div>

                  {/* Payment Summary */}
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Payment</h3>
                  <div className="mb-5 rounded-xl border border-line bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">
                          {plan.name} — {plan.jobs} job posts
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          Valid for {plan.validity} from activation.
                        </p>
                      </div>
                      <strong className="font-display text-2xl font-extrabold text-ink">₹{plan.price}</strong>
                    </div>
                  </div>

                  {/* Message */}
                  {message && (
                    <div className="mb-4">
                      <FormMessage type={messageType === "success" ? "success" : messageType === "info" ? "info" : "error"}>
                        {message}
                      </FormMessage>
                    </div>
                  )}

                  {/* Submit */}
                  <button type="submit" disabled={loading} className="btn btn-accent w-full">
                    {loading ? "Opening Razorpay..." : `Pay ₹${plan.price} & Activate`}
                  </button>

                  <p className="mt-4 text-center text-sm text-muted">
                    Already registered? <Link to="/employer-login" className="font-semibold text-brand hover:underline">Login here</Link>
                  </p>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
