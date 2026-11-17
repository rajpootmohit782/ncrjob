import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import useEmployer from "../../hooks/useEmployer";
import { FormMessage, LoadingState } from "../../components/ui";

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

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function cleanWhatsAppNumber(value) {
    return value.replace(/[^0-9]/g, "");
  }

  async function handleSubmit(e) {
    e.preventDefault();

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
      setMessage("WhatsApp number should include country code and number.");
      setMessageType("error");
      return;
    }

    setSaving(true);

    const { error } = await supabase
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

    if (error) {
      console.error(error);
      setMessage("Unable to update company profile.");
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
      <div className="page-shell">
        <div className="container-page py-12">
          <LoadingState label="Loading company profile..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="page-shell">
        <div className="container-page py-12">
          <div className="card p-8 text-sm text-muted">No employer profile found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container-page max-w-4xl py-8 sm:py-12">
        <Link to="/employer-dashboard" className="link-arrow mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to dashboard
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Company Profile</h1>
        </div>

        {message && (
          <div className="mb-4">
            <FormMessage type={messageType === "success" ? "success" : "error"}>
              {message}
            </FormMessage>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="company_name">Company Name *</label>
              <input
                id="company_name"
                type="text"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="whatsapp_number">WhatsApp Number</label>
              <input
                id="whatsapp_number"
                type="text"
                name="whatsapp_number"
                value={form.whatsapp_number}
                onChange={handleChange}
                placeholder="Example: 919876543210"
                className="input"
              />
              <small className="mt-1.5 block text-xs text-muted">
                Use country code + number, digits only. Example: 919876543210
              </small>
            </div>

            <div>
              <label className="label" htmlFor="website">Website</label>
              <input
                id="website"
                type="text"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="industry">Industry</label>
              <input
                id="industry"
                type="text"
                name="industry"
                value={form.industry}
                onChange={handleChange}
                placeholder="Example: IT / Software"
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="company_size">Company Size</label>
              <input
                id="company_size"
                type="text"
                name="company_size"
                value={form.company_size}
                onChange={handleChange}
                placeholder="Example: 10-50"
                className="input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Example: Mumbai"
                className="input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="description">Company Description</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                placeholder="Write about your company..."
                className="input min-h-32 resize-y"
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary mt-6 w-full sm:w-auto">
            {saving ? "Saving..." : "Save Company Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
