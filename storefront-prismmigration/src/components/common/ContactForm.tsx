import { useState } from "react";
import { SupportAPI } from "@/services/api";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "Technical Support",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) {
      setStatus({ success: false, message: "Please fill in all required fields." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await SupportAPI.submitContact({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });
      setStatus({ success: true, message: response.message || "Message sent successfully!" });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "Technical Support",
        message: "",
      });
    } catch (err: any) {
      console.error(err);
      setStatus({
        success: false,
        message: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1E2937]/30 backdrop-blur border border-[#334155] rounded-xl p-8 shadow-2xl">
      <h2 className="font-bold text-white text-lg mb-6">Send us a Message</h2>
      {status && (
        <div
          className={`p-4 mb-6 rounded-xl text-xs ${
            status.success
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          {status.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#94A3B8] mb-1.5">First Name *</label>
            <input
              id="contact-firstname"
              type="text"
              required
              className="w-full h-11 px-4 rounded-lg border border-[#334155] text-xs text-white bg-[#0F172A]/80 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-transparent transition-all"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#94A3B8] mb-1.5">Last Name</label>
            <input
              id="contact-lastname"
              type="text"
              className="w-full h-11 px-4 rounded-lg border border-[#334155] text-xs text-white bg-[#0F172A]/80 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-transparent transition-all"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#94A3B8] mb-1.5">Email Address *</label>
          <input
            id="contact-email"
            type="email"
            required
            className="w-full h-11 px-4 rounded-lg border border-[#334155] text-xs text-white bg-[#0F172A]/80 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-transparent transition-all"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#94A3B8] mb-1.5">Subject</label>
          <select
            id="contact-subject"
            className="w-full h-11 px-4 rounded-lg border border-[#334155] text-xs text-white bg-[#0F172A]/80 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-transparent transition-all"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          >
            <option className="bg-[#0F172A]">Technical Support</option>
            <option className="bg-[#0F172A]">License Activation</option>
            <option className="bg-[#0F172A]">Billing / Payment</option>
            <option className="bg-[#0F172A]">Sales Inquiry</option>
            <option className="bg-[#0F172A]">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#94A3B8] mb-1.5">Message *</label>
          <textarea
            id="contact-message"
            rows={5}
            required
            className="w-full px-4 py-3 rounded-lg border border-[#334155] text-xs text-white bg-[#0F172A]/80 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:border-transparent resize-none transition-all"
            placeholder="Describe your issue or question..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>
        <button
          id="contact-submit"
          type="submit"
          disabled={loading}
          className="w-full text-center bg-[#14B8A6] hover:bg-[#0D9488] text-black text-xs font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(20, 184, 166,0.25)] cursor-pointer disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
