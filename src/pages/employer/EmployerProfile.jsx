import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import useEmployer from "../../hooks/useEmployer";
import { statusTone } from "../../lib/format";
import {
  AlertIcon,
  CheckIcon,
  ChevronRightIcon,
} from "../../components/Icons";

export default function EmployerProfile() {
  const { employer, loading, error, refetch } = useEmployer();

  const [form, setForm] = useState({
    company_name: "",
    whatsapp_number: "",
    website: "",
    industry: "",
    company_size: "",
    location: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    if (employer) {
      setForm({
        company_name: employer.company_name || "",
        whatsapp_number: employer.whatsapp_number || "",
        website: employer.website || "",
        industry: employer.industry || "",
        company_size: employer.company_size || "",
        location: employer.location || "",
        description: employer.description || "",
      });
    }
  }, [employer]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function cleanWhatsAppNumber(value) {
    return value.replace(/[^0-9]/g, "");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!employer) {
      setMessage("Employer profile not found.");
      setMessageType("error");
      return;
    }

    if (!form.company_name.trim()) {
      setMessage("Company name is required.");
      setMessageType("error");
      return;
    }

    const whatsappNumber = cleanWhatsAppNumber(form.whatsapp_number);

    if (whatsappNumber && whatsappNumber.length < 10) {
      setMessage("WhatsApp number should include the country code and number.");
      setMessageType("error");
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from("employers")
      .update({
        company_name: form.company_name.trim(),
        whatsapp_number: whatsappNumber,
        website: form.website.trim(),
        industry: form.industry.trim(),
        company_size: form.company_size.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
      })
      .eq("id", employer.id);

    if (updateError) {
      console.error(updateError);
      setMessage("Unable to update the company profile. Please try again.");
      setMessageType("error");
    } else {
      setMessage("Company profile updated successfully.");
      setMessageType("success");
      await refetch();
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container container-sm">
          <div className="skeleton" style={{ height: "12rem" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container container-sm">
          <div className="empty-state">
            <span className="empty-ico">
              <AlertIcon />
            </span>
            <h1>Profile unavailable</h1>
            <p>{error}</p>
            <Link className="btn btn-secondary btn-sm mt-2" to="/employer-dashboard">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="page">
        <div className="container container-sm">
          <div className="empty-state">
            <h1>No employer profile found</h1>
            <p>Create your employer account to add company details.</p>
            <Link className="btn btn-primary btn-sm mt-2" to="/become-employer">
              Create employer account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container container-sm">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/employer-dashboard">Employer dashboard</Link>
          <ChevronRightIcon />
          <span>Company profile</span>
        </nav>

        <div className="page-head">
          <div>
            <span className="eyebrow">Employer workspace</span>
            <h1>Company profile</h1>
            <p className="page-sub">
              These details appear on your public job listings.
            </p>
          </div>

          <span className={`badge badge-${statusTone(employer.status)}`}>
            {employer.status}
          </span>
        </div>

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

        <form className="card card-pad form-grid mt-2" onSubmit={handleSubmit}>
          <fieldset className="fieldset">
            <div className="fieldset-title">Company details</div>

            <div className="field-row">
              <label className="field">
                <span className="field-label">Company name *</span>
                <input
                  className="input"
                  type="text"
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span className="field-label">WhatsApp number</span>
                <input
                  className="input"
                  type="text"
                  name="whatsapp_number"
                  value={form.whatsapp_number}
                  onChange={handleChange}
                  placeholder="919876543210"
                  inputMode="numeric"
                />
                <span className="field-help">
                  Country code + number, digits only. Candidates apply here.
                </span>
              </label>
            </div>

            <div className="field-row mt-2">
              <label className="field">
                <span className="field-label">Website</span>
                <input
                  className="input"
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </label>

              <label className="field">
                <span className="field-label">Industry</span>
                <input
                  className="input"
                  type="text"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  placeholder="e.g. IT / Software"
                />
              </label>
            </div>

            <div className="field-row mt-2">
              <label className="field">
                <span className="field-label">Company size</span>
                <input
                  className="input"
                  type="text"
                  name="company_size"
                  value={form.company_size}
                  onChange={handleChange}
                  placeholder="e.g. 10–50 employees"
                />
              </label>

              <label className="field">
                <span className="field-label">Location</span>
                <input
                  className="input"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Noida, Sector 62"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <div className="fieldset-title">About the company</div>

            <label className="field">
              <span className="field-label">Company description</span>
              <textarea
                className="textarea"
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                placeholder="Tell candidates what your company does and what it is like to work there."
              />
            </label>
          </fieldset>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
            <Link className="btn btn-ghost" to="/employer-dashboard">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
