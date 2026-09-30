import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import useEmployer from "../../hooks/useEmployer";

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
    return <div style={{ padding: "20px" }}>Loading company profile...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  if (!employer) {
    return (
      <div style={{ padding: "20px" }}>
        <p>No employer profile found.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px" }}>
      <Link to="/employer-dashboard">← Back to dashboard</Link>

      <h1>Company Profile</h1>

      {message && (
        <p
          style={{
            color: messageType === "success" ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "20px",
          backgroundColor: "#fff",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label>Company Name *</label>
          <br />
          <input
            type="text"
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>WhatsApp Number</label>
          <br />
          <input
            type="text"
            name="whatsapp_number"
            value={form.whatsapp_number}
            onChange={handleChange}
            placeholder="Example: 919876543210"
            style={{ width: "100%", padding: "8px" }}
          />
          <small style={{ color: "#666" }}>
            Use country code + number, digits only. Example: 919876543210
          </small>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Website</label>
          <br />
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://example.com"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Industry</label>
          <br />
          <input
            type="text"
            name="industry"
            value={form.industry}
            onChange={handleChange}
            placeholder="Example: IT / Software"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Company Size</label>
          <br />
          <input
            type="text"
            name="company_size"
            value={form.company_size}
            onChange={handleChange}
            placeholder="Example: 10-50"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Location</label>
          <br />
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Example: Mumbai"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Company Description</label>
          <br />
          <textarea
            name="description"
            rows={5}
            value={form.description}
            onChange={handleChange}
            placeholder="Write about your company..."
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "10px 18px",
            backgroundColor: "#0f172a",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Save Company Profile"}
        </button>
      </form>
    </div>
  );
}