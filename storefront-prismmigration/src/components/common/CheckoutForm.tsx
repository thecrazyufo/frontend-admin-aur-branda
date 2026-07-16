import { useState, useEffect } from "react";
import { CheckoutAPI } from "@/services/api";
import type { Product } from "@/types/product";
import { CheckCircle, ShieldCheck, CreditCard, Key, Printer, Copy, RefreshCw, Download } from "lucide-react";

interface CheckoutFormProps {
  product: Product;
  selectedTierName: string;
  siteId: string;
}

export default function CheckoutForm({ product, selectedTierName, siteId }: CheckoutFormProps) {
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "PAYPAL">("STRIPE");
  
  // Card Details State (Stripe Simulation)
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");
  const [cardName, setCardName] = useState("");

  // Billing compliance states
  const [billingName, setBillingName] = useState("");
  const [billingCompany, setBillingCompany] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [billingCountry, setBillingCountry] = useState("US");
  const [taxId, setTaxId] = useState("");
  const [showBusinessFields, setShowBusinessFields] = useState(false);
  const [needsOfflineSupport, setNeedsOfflineSupport] = useState(false);

  // Loading & Result States
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercentage: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const selectedTier = product.pricing?.find(
    (t) => t.name.toLowerCase() === selectedTierName.toLowerCase()
  ) || product.pricing?.[1] || { name: "Standard", price: 49.00, period: "lifetime" };

  // Detect URL redirects on mount (Stripe & PayPal returns)
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const success = query.get("success");
    const sessionId = query.get("session_id");
    const paypalSuccess = query.get("paypal_success");
    const paypalToken = query.get("token");
    const productSlug = query.get("product");
    const tierName = query.get("tier");
    const emailUrl = query.get("email");
    const cancelled = query.get("cancelled");
    const offlineUrl = query.get("needsOfflineSupport") || "";
    
    // Extracted billing details from redirect
    const bName = query.get("billingName") || "";
    const bCompany = query.get("billingCompany") || "";
    const bAddress = query.get("billingAddress") || "";
    const bCity = query.get("billingCity") || "";
    const bState = query.get("billingState") || "";
    const bZip = query.get("billingZip") || "";
    const bCountry = query.get("billingCountry") || "";
    const bTaxId = query.get("taxId") || "";

    if (cancelled === "true") {
      setError("Payment process was cancelled. You can try again below.");
      if (emailUrl) setEmail(decodeURIComponent(emailUrl));
      return;
    }

    if (success === "true" && sessionId) {
      setLoading(true);
      setError(null);
      CheckoutAPI.confirmStripe({
        sessionId: sessionId,
        siteId: siteId,
        customerEmail: emailUrl ? decodeURIComponent(emailUrl) : undefined,
        productId: product.id,
        pricingTierName: tierName ? decodeURIComponent(tierName) : selectedTier.name,
        billingName: bName ? decodeURIComponent(bName) : undefined,
        billingCompany: bCompany ? decodeURIComponent(bCompany) : undefined,
        billingAddress: bAddress ? decodeURIComponent(bAddress) : undefined,
        billingCity: bCity ? decodeURIComponent(bCity) : undefined,
        billingState: bState ? decodeURIComponent(bState) : undefined,
        billingZip: bZip ? decodeURIComponent(bZip) : undefined,
        billingCountry: bCountry ? decodeURIComponent(bCountry) : undefined,
        taxId: bTaxId ? decodeURIComponent(bTaxId) : undefined,
        needsOfflineSupport: offlineUrl === "true"
      })
        .then((res) => {
          setResult(res);
          setLoading(false);
          // Clean address bar without reloading
          window.history.replaceState({}, document.title, window.location.pathname + `?product=${productSlug || ""}&tier=${tierName || ""}`);
        })
        .catch((err) => {
          setError("Failed to verify Stripe payment. Please contact customer support.");
          setLoading(false);
        });
    } else if (paypalSuccess === "true" && paypalToken) {
      setLoading(true);
      setError(null);
      CheckoutAPI.capturePaypalOrder({
        paypalOrderId: paypalToken,
        siteId: siteId,
        customerEmail: emailUrl ? decodeURIComponent(emailUrl) : undefined,
        productId: product.id,
        pricingTierName: tierName ? decodeURIComponent(tierName) : selectedTier.name,
        billingName: bName ? decodeURIComponent(bName) : undefined,
        billingCompany: bCompany ? decodeURIComponent(bCompany) : undefined,
        billingAddress: bAddress ? decodeURIComponent(bAddress) : undefined,
        billingCity: bCity ? decodeURIComponent(bCity) : undefined,
        billingState: bState ? decodeURIComponent(bState) : undefined,
        billingZip: bZip ? decodeURIComponent(bZip) : undefined,
        billingCountry: bCountry ? decodeURIComponent(bCountry) : undefined,
        taxId: bTaxId ? decodeURIComponent(bTaxId) : undefined,
        needsOfflineSupport: offlineUrl === "true"
      })
        .then((res) => {
          setResult(res);
          setLoading(false);
          // Clean address bar without reloading
          window.history.replaceState({}, document.title, window.location.pathname + `?product=${productSlug || ""}&tier=${tierName || ""}`);
        })
        .catch((err) => {
          setError("Failed to capture PayPal payment. Please contact customer support.");
          setLoading(false);
        });
    }
  }, []);

  const handleCopyKey = () => {
    if (result?.activationKey) {
      navigator.clipboard.writeText(result.activationKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);

    const uppercaseCode = couponCode.trim().toUpperCase();

    try {
      const API_BASE = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")
        ? "http://localhost:8080/api"
        : "https://api.thecrazyufo.in/api";
      
      const res = await fetch(`${API_BASE}/coupons/validate/${uppercaseCode}?siteId=${siteId}`);
      if (res.ok) {
        const data = await res.json();
        setAppliedCoupon({
          code: data.code,
          discountPercentage: data.discountPercentage
        });
        setCouponSuccess(`Coupon ${data.code} applied! ${data.discountPercentage}% discount.`);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        // Local simulation fallback
        if (uppercaseCode === "WELCOME10") {
          setAppliedCoupon({ code: "WELCOME10", discountPercentage: 10 });
          setCouponSuccess("Coupon WELCOME10 applied! 10% discount.");
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        } else if (uppercaseCode === "SAVE20") {
          setAppliedCoupon({ code: "SAVE20", discountPercentage: 20 });
          setCouponSuccess("Coupon SAVE20 applied! 20% discount.");
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        } else if (uppercaseCode === "SUPER50") {
          setAppliedCoupon({ code: "SUPER50", discountPercentage: 50 });
          setCouponSuccess("Coupon SUPER50 applied! 50% discount.");
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        } else {
          setCouponError("Invalid or expired coupon code.");
        }
      }
    } catch (err) {
      if (uppercaseCode === "WELCOME10") {
        setAppliedCoupon({ code: "WELCOME10", discountPercentage: 10 });
        setCouponSuccess("Coupon WELCOME10 applied! 10% discount.");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else if (uppercaseCode === "SAVE20") {
        setAppliedCoupon({ code: "SAVE20", discountPercentage: 20 });
        setCouponSuccess("Coupon SAVE20 applied! 20% discount.");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else if (uppercaseCode === "SUPER50") {
        setAppliedCoupon({ code: "SUPER50", discountPercentage: 50 });
        setCouponSuccess("Coupon SUPER50 applied! 50% discount.");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        setCouponError("Invalid or expired coupon code.");
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponSuccess(null);
    setCouponError(null);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentUrl = window.location.origin + window.location.pathname;
      const successUrlParams = `?success=true&session_id={CHECKOUT_SESSION_ID}&product=${product.slug}&tier=${encodeURIComponent(selectedTier.name)}&email=${encodeURIComponent(email)}&needsOfflineSupport=${needsOfflineSupport}`;
      const cancelUrlParams = `?cancelled=true&product=${product.slug}&tier=${encodeURIComponent(selectedTier.name)}&email=${encodeURIComponent(email)}`;

      const billingParams = {
        billingName: billingName.trim() || email.split("@")[0],
        billingCompany: showBusinessFields ? billingCompany.trim() : "",
        billingAddress: billingAddress.trim(),
        billingCity: billingCity.trim(),
        billingState: billingState.trim(),
        billingZip: billingZip.trim(),
        billingCountry: billingCountry,
        taxId: showBusinessFields ? taxId.trim() : ""
      };

      // Append billing parameters to redirect success URLs to preserve them on redirection confirm endpoint
      const extraQueryParams = `&billingName=${encodeURIComponent(billingParams.billingName)}&billingCompany=${encodeURIComponent(billingParams.billingCompany)}&billingAddress=${encodeURIComponent(billingParams.billingAddress)}&billingCity=${encodeURIComponent(billingParams.billingCity)}&billingState=${encodeURIComponent(billingParams.billingState)}&billingZip=${encodeURIComponent(billingParams.billingZip)}&billingCountry=${encodeURIComponent(billingParams.billingCountry)}&taxId=${encodeURIComponent(billingParams.taxId)}&needsOfflineSupport=${needsOfflineSupport}`;

      if (paymentMethod === "STRIPE") {
        const session = await CheckoutAPI.createStripeSession({
          productId: product.id,
          pricingTierName: selectedTier.name,
          customerEmail: email,
          siteId: siteId,
          successUrl: currentUrl + successUrlParams + extraQueryParams,
          cancelUrl: currentUrl + cancelUrlParams,
          couponCode: appliedCoupon?.code,
          needsOfflineSupport: needsOfflineSupport,
          ...billingParams
        });
        // Redirect to Stripe checkout screen
        window.location.href = session.url;
      } else if (paymentMethod === "PAYPAL") {
        const order = await CheckoutAPI.createPaypalOrder({
          productId: product.id,
          pricingTierName: selectedTier.name,
          customerEmail: email,
          siteId: siteId,
          returnUrl: currentUrl + `?paypal_success=true&product=${product.slug}&tier=${encodeURIComponent(selectedTier.name)}&email=${encodeURIComponent(email)}` + extraQueryParams,
          cancelUrl: currentUrl + cancelUrlParams,
          couponCode: appliedCoupon?.code,
          needsOfflineSupport: needsOfflineSupport,
          ...billingParams
        });
        // Redirect to PayPal checkout/approve screen
        window.location.href = order.url;
      }
    } catch (err: any) {
      setError("Payment initialization failed. Please check backend connection and try again.");
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="bg-[#1E2937]/30 backdrop-blur border border-[#334155] rounded-xl shadow-2xl p-8 max-w-2xl mx-auto my-8 print:border-none print:shadow-none print:my-0">
        <div className="text-center mb-8 print:hidden">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 text-emerald-500 border border-emerald-500/25">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-3xl font-bold text-white">Purchase Successful!</h2>
          <p className="text-[#E2E8F0] mt-2 text-xs">
            Your license key and invoice details are generated below.
          </p>
        </div>

        {/* License Key Box */}
        <div className="bg-[#0B0F1A] border border-[#334155] rounded-2xl p-6 mb-8 print:bg-[#1E2937] print:border-gray-200">
          <div className="flex items-center gap-2 text-[#6366F1] font-bold mb-3 text-xs">
            <Key size={18} />
            <span>YOUR LICENSE KEY</span>
          </div>
          <div className="flex items-center justify-between gap-4 bg-[#1E2937] border border-[#334155] rounded-xl p-4 font-mono text-lg font-bold text-white">
            <span>{result.activationKey}</span>
            <button
              onClick={handleCopyKey}
              className="text-[#6366F1] hover:text-[#4F46E5] p-2 hover:bg-stone-850 rounded-lg transition-colors print:hidden cursor-pointer"
              title="Copy license key"
            >
              {copied ? <span className="text-xs text-emerald-500 font-sans">Copied!</span> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-[#94A3B8] mt-3 leading-relaxed">
            * Use this key and your Order ID <strong className="text-white">{result.orderId}</strong> to activate the desktop application under settings/license configuration.
          </p>
        </div>

        {/* Invoice Section */}
        <div className="border-t border-[#334155] pt-8" id="invoice-receipt">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-white text-base uppercase tracking-wider">INVOICE</h3>
              <p className="text-[10px] text-[#94A3B8] mt-1">Invoice #: {result.invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-[#E2E8F0]">Date: {result.invoice.issueDate}</p>
              <p className="text-xs text-[#94A3B8]">Order Ref: {result.orderId}</p>
            </div>
          </div>

          <div className="bg-[#0B0F1A] border border-[#334155] rounded-2xl p-5 mb-6 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#94A3B8]">Bill To:</span>
              <span className="font-semibold text-white">{result.customerEmail}</span>
            </div>
            {result.billingName && (
              <div className="text-right text-xs text-[#E2E8F0] space-y-0.5 border-t border-[#334155]/40 pt-2">
                <p className="font-bold text-white">{result.billingName}</p>
                {result.billingCompany && <p className="text-[11px] text-stone-400 font-semibold">{result.billingCompany}</p>}
                <p className="text-stone-400">{result.billingAddress}</p>
                <p className="text-stone-400">{result.billingCity}, {result.billingState} {result.billingZip}</p>
                <p className="text-stone-400 font-bold uppercase">{result.billingCountry}</p>
                {result.taxId && <p className="text-[10px] text-[#6366F1] font-mono mt-1">Tax/VAT ID: {result.taxId}</p>}
              </div>
            )}
            <div className="flex justify-between text-xs border-t border-[#334155]/40 pt-2">
              <span className="text-[#94A3B8]">Payment Via:</span>
              <span className="font-medium text-white">{result.paymentMethod} (Simulated)</span>
            </div>
          </div>

          {/* Itemized Charge */}
          <div className="border border-[#334155] rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0B0F1A] border-b border-[#334155] text-[10px] font-semibold text-[#94A3B8] uppercase">
                  <th className="p-4">Item Description</th>
                  <th className="p-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-xs border-b border-[#334155] text-[#E2E8F0]">
                  <td className="p-4">
                    <p className="font-semibold text-white">{result.invoice.itemName}</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">Desktop Application License</p>
                  </td>
                  <td className="p-4 text-right font-medium">${result.invoice.subtotal.toFixed(2)}</td>
                </tr>
                {result.taxAmount > 0 && (
                  <tr className="text-xs border-b border-[#334155] text-[#E2E8F0]">
                    <td className="p-4 text-[#94A3B8]">
                      Sales Tax / VAT ({(result.taxRate * 100).toFixed(1)}%)
                    </td>
                    <td className="p-4 text-right font-medium">${result.taxAmount.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="text-xs font-semibold text-white bg-[#0B0F1A]/40">
                  <td className="p-4 text-right text-[#94A3B8]">Total Paid</td>
                  <td className="p-4 text-right text-base text-[#6366F1] font-bold">${result.invoice.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end print:hidden">
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 flex items-center gap-2 text-xs font-bold border border-[#334155] text-[#E2E8F0] hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <Printer size={15} />
              Print Invoice
            </button>
            <a
              href={`/download?product=${product.slug}`}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-black py-2.5 px-6 flex items-center gap-2 text-xs font-extrabold rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(99, 102, 241,0.25)]"
            >
              <Download size={15} />
              Download Installer
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto py-12">
      {/* Left Column: Checkout Form */}
      <div className="lg:col-span-7 bg-[#1E2937]/30 backdrop-blur border border-[#334155] rounded-xl shadow-2xl p-8">
        <h2 className="text-xl font-bold text-white mb-6">Payment Information</h2>

        <form onSubmit={handleCheckoutSubmit} className="space-y-6">
          {/* Email field */}
          <div>
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
              Billing Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#0B0F1A]/80 border border-[#334155] rounded-lg text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/40 focus:outline-none transition-colors text-xs"
            />
            <p className="text-[10px] text-stone-500 mt-1.5">
              We'll send your activation instructions and transaction invoice to this address.
            </p>
          </div>

          {/* Billing Address Compliance Section */}
          <div className="bg-[#0B0F1A]/20 border border-[#334155]/60 rounded-xl p-5 space-y-4">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">📋 Billing Details</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#334155] rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Country</label>
                <select
                  value={billingCountry}
                  onChange={(e) => setBillingCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#334155] rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IN">India</option>
                  <option value="AU">Australia</option>
                  <option value="NL">Netherlands</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3 sm:col-span-2">
                <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Billing Address</label>
                <input
                  type="text"
                  required
                  placeholder="123 Main St"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#334155] rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"
                />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">City</label>
                <input
                  type="text"
                  required
                  placeholder="Austin"
                  value={billingCity}
                  onChange={(e) => setBillingCity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#334155] rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">State / Province</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TX"
                  value={billingState}
                  onChange={(e) => setBillingState(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#334155] rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">ZIP / Postal Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 78701"
                  value={billingZip}
                  onChange={(e) => setBillingZip(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#334155] rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"
                />
              </div>
            </div>

            {/* Business Toggle & Fields */}
            <div className="pt-2 border-t border-[#334155]/30">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="checkout-business-toggle"
                  checked={showBusinessFields}
                  onChange={(e) => setShowBusinessFields(e.target.checked)}
                  className="rounded border-[#334155] text-[#6366F1] focus:ring-[#6366F1] bg-[#0B0F1A]"
                />
                <label htmlFor="checkout-business-toggle" className="text-[10px] font-bold text-stone-300 uppercase tracking-wider cursor-pointer select-none">
                  Buying for a business
                </label>
              </div>

              {/* Offline Activation Option */}
              <div className="flex items-start gap-2 mt-3 pt-2 border-t border-[#334155]/20">
                <input
                  type="checkbox"
                  id="checkout-offline-toggle"
                  checked={needsOfflineSupport}
                  onChange={(e) => setNeedsOfflineSupport(e.target.checked)}
                  className="mt-0.5 rounded border-[#334155] text-[#6366F1] focus:ring-[#6366F1] bg-[#0B0F1A]"
                />
                <div>
                  <label htmlFor="checkout-offline-toggle" className="text-[10px] font-bold text-stone-300 uppercase tracking-wider cursor-pointer select-none">
                    Enable offline activation support
                  </label>
                  <p className="text-[9px] text-stone-500 mt-0.5 leading-relaxed">
                    Check this if you plan to activate and run the software in an air-gapped or enterprise environment without active internet.
                  </p>
                </div>
              </div>

              {showBusinessFields && (
                <div className="grid grid-cols-2 gap-4 mt-3 animate-discount-pop">
                  <div>
                    <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={billingCompany}
                      onChange={(e) => setBillingCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#334155] rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Tax / VAT ID (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. US123456789"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#334155] rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("STRIPE")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                  paymentMethod === "STRIPE"
                    ? "border-[#6366F1] bg-[#6366F1]/10 text-white"
                    : "border-[#334155] hover:border-stone-700 text-[#94A3B8]"
                }`}
              >
                <CreditCard size={16} />
                Credit Card (Stripe)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("PAYPAL")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                  paymentMethod === "PAYPAL"
                    ? "border-[#6366F1] bg-[#6366F1]/10 text-white"
                    : "border-[#334155] hover:border-stone-700 text-[#94A3B8]"
                }`}
              >
                <span>💳 PayPal</span>
              </button>
            </div>
          </div>

          {/* Payment Detail Simulator */}
          {paymentMethod === "STRIPE" ? (
            <div className="bg-[#0B0F1A]/40 border border-[#334155] rounded-xl p-5 space-y-4">
              <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">
                💳 Secure Stripe Sandbox
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#334155] rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/40 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#334155] rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/40 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">CVC</label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#334155] rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/40 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0B0F1A]/40 border border-[#334155] rounded-xl p-5 text-center">
              <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
                🛍️ PayPal Checkout Sandbox
              </div>
              <p className="text-xs text-[#E2E8F0] max-w-sm mx-auto leading-relaxed">
                Clicking "Pay Now" will redirect you to a secure simulated PayPal popup to verify your account credentials.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl p-4 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Checkout Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-center bg-[#6366F1] hover:bg-[#4F46E5] text-black text-xs font-bold py-3.5 px-6 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(99, 102, 241,0.25)] cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Pay Now & Generate License Key
              </>
            )}
          </button>
        </form>
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#1E2937]/30 backdrop-blur border border-[#334155] rounded-xl shadow-2xl p-6 relative overflow-hidden">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes confetti-fall {
              0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
              }
              100% {
                transform: translate(var(--tx), var(--ty)) rotate(720deg);
                opacity: 0;
              }
            }
            .animate-confetti-fall {
              animation: confetti-fall 2.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
            }
            @keyframes discount-pop {
              0% { transform: scale(0.9); opacity: 0; }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-discount-pop {
              animation: discount-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
          `}} />

          {/* CONFETTI SHOWER */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
              {Array.from({ length: 30 }).map((_, i) => {
                const left = Math.random() * 100;
                const delay = Math.random() * 0.4;
                const duration = 1.6 + Math.random() * 1.2;
                const size = 6 + Math.random() * 8;
                const color = ["#6366F1", "#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"][Math.floor(Math.random() * 6)];
                const rotation = Math.random() * 360;
                
                return (
                  <div
                    key={i}
                    className="absolute rounded-full opacity-0 animate-confetti-fall"
                    style={{
                      left: `${left}%`,
                      top: `-20px`,
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: color,
                      transform: `rotate(${rotation}deg)`,
                      animationDelay: `${delay}s`,
                      animationDuration: `${duration}s`,
                      ['--tx' as any]: `${-60 + Math.random() * 120}px`,
                      ['--ty' as any]: `${250 + Math.random() * 150}px`,
                    }}
                  />
                );
              })}
            </div>
          )}

          <h3 className="font-bold text-white text-base mb-4">Order Summary</h3>

          <div className="flex items-start gap-4 pb-6 border-b border-[#334155]">
            <div className="w-12 h-12 rounded-xl bg-[#0B0F1A] border border-[#334155] text-[#6366F1] flex items-center justify-center shadow-md shrink-0">
              <Download size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{product.name}</h4>
              <p className="text-[10px] text-stone-500 mt-0.5">{selectedTier.name} Plan</p>
            </div>
          </div>

          {(() => {
            const subtotal = selectedTier.price;
            const discountAmount = appliedCoupon ? subtotal * (appliedCoupon.discountPercentage / 100) : 0;
            const priceAfterDiscount = subtotal - discountAmount;
            
            // Client-side tax calculation
            const getTaxRate = (cCountry: string, cState: string) => {
              const cleanCountry = cCountry.trim().toUpperCase();
              const cleanState = cState.trim().toUpperCase();
              if (cleanCountry === "US" || cleanCountry === "USA" || cleanCountry === "UNITED STATES") {
                if (cleanState === "TX" || cleanState === "TEXAS") return 0.0825;
                if (cleanState === "NY" || cleanState === "NEW YORK") return 0.08875;
                if (cleanState === "CA" || cleanState === "CALIFORNIA") return 0.0725;
                if (cleanState === "WA" || cleanState === "WASHINGTON") return 0.065;
                return 0.06;
              }
              if (cleanCountry === "DE" || cleanCountry === "GERMANY") return 0.19;
              if (cleanCountry === "FR" || cleanCountry === "FRANCE") return 0.20;
              if (cleanCountry === "GB" || cleanCountry === "UK" || cleanCountry === "UNITED KINGDOM") return 0.20;
              if (cleanCountry === "IN" || cleanCountry === "INDIA") return 0.18;
              return 0.0;
            };

            const taxRate = getTaxRate(billingCountry, billingState);
            const taxAmount = priceAfterDiscount * taxRate;
            const totalPrice = priceAfterDiscount + taxAmount;

            return (
              <>
                <div className="py-6 space-y-3 text-xs border-b border-[#334155]/60">
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">License Subtotal</span>
                    <span className="font-medium text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400 font-semibold animate-discount-pop">
                      <span>Discount ({appliedCoupon.code} -{appliedCoupon.discountPercentage}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">VAT / Tax ({(taxRate * 100).toFixed(0)}%)</span>
                    <span className="font-medium text-white">${taxAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Coupon Code Input */}
                <div className="py-4 border-b border-[#334155]/60 space-y-2">
                  <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider">Promo / Coupon Code</label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. SAVE20"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-[#0B0F1A]/80 border border-[#334155] rounded text-white focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/45 focus:outline-none text-[11px] uppercase font-mono"
                        disabled={couponLoading}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-3 bg-[#6366F1] hover:bg-[#4F46E5] text-black font-extrabold text-[10px] rounded transition-all cursor-pointer disabled:opacity-50"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-[#10B981]/10 border border-[#10B981]/25 rounded p-2 text-xs animate-discount-pop">
                      <span className="font-bold text-emerald-400 text-[11px] flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                        Applied: {appliedCoupon.code} (-{appliedCoupon.discountPercentage}%)
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-stone-400 hover:text-red-400 text-[10px] font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-[10px] text-red-400 font-medium">{couponError}</p>}
                  {couponSuccess && <p className="text-[10px] text-emerald-400 font-medium">{couponSuccess}</p>}
                </div>

                <div className="pt-6 flex justify-between items-baseline">
                  <span className="font-bold text-white text-xs">Total Price</span>
                  <div className="flex items-baseline gap-2">
                    {appliedCoupon && (
                      <span className="text-xs text-stone-500 font-semibold line-through decoration-red-500 decoration-2 mr-1">
                        ${subtotal.toFixed(2)}
                      </span>
                    )}
                    <span className="font-bold text-xl text-[#6366F1] transition-all duration-300">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Security Assurances */}
        <div className="bg-[#0B0F1A]/45 border border-[#334155] rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={16} className="text-[#6366F1] mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">256-Bit SSL Encryption</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Your payment details are protected with bank-grade security protocols.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle size={16} className="text-[#6366F1] mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Instant Key Generation</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">License key is rendered immediately on screen upon successful payment.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 border-t border-[#334155]/50 pt-3">
            <div className="w-4 h-4 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center text-[8px] font-extrabold text-[#6366F1] mt-0.5">30</div>
            <div>
              <p className="text-xs font-bold text-white">30-Day Money-Back Guarantee</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Not satisfied? Contact support within 30 days for a full, hassle-free refund.</p>
            </div>
          </div>
          
          {/* Payment Partner Logos */}
          <div className="border-t border-[#334155]/50 pt-4 flex flex-col items-center gap-2">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Accepted Payments</span>
            <div className="flex items-center justify-center gap-4 text-stone-400 opacity-60 hover:opacity-95 transition-opacity duration-300">
              {/* Visa */}
              <svg className="h-4 w-auto" viewBox="0 0 48 48" fill="currentColor">
                <path d="M33.72 12.06c-2.31 0-4.08.68-5.06 2.87l-6.42 19.34h4.63l.92-2.56h5.66c.13.58.53 2.56.53 2.56h4.09l-3.57-19.34c-.81-2.15-2.47-2.87-4.78-2.87zm.7 13.13h-3.92l1.96-5.46 1.96 5.46zM15.54 12.06L11 25.13l-.47-2.39c-.84-2.85-3.32-5.89-6.19-7.39L8.71 34.27h4.69L20.47 12.06h-4.93zM2 12.06l.03.22c4.43 1.13 7.6 3.86 8.8 7.14L9 12.06H2z" />
              </svg>
              {/* Mastercard */}
              <svg className="h-5 w-auto" viewBox="0 0 36 24" fill="currentColor">
                <rect width="36" height="24" rx="3" fill="none" />
                <path d="M13.5 12c0-3.3 1.8-6.1 4.5-7.5-2.2-1.6-4.9-2.5-7.9-2.5C4.5 2 0 6.5 0 12s4.5 10 10.1 10c3 0 5.7-.9 7.9-2.5-2.7-1.4-4.5-4.2-4.5-7.5z" fill="#EB001B" />
                <path d="M36 12c0 5.5-4.5 10-10.1 10-3 0-5.7-.9-7.9-2.5 2.7-1.4 4.5-4.2 4.5-7.5s-1.8-6.1-4.5-7.5c2.2-1.6 4.9-2.5 7.9-2.5C31.5 2 36 6.5 36 12z" fill="#F79E1B" />
                <path d="M22.5 12c0-2.3-1.1-4.3-2.7-5.5-1.6 1.2-2.7 3.2-2.7 5.5s1.1 4.3 2.7 5.5c1.6-1.2 2.7-3.2 2.7-5.5z" fill="#FF5F00" />
              </svg>
              {/* Amex */}
              <span className="text-[10px] font-mono font-extrabold tracking-tighter border border-stone-500 rounded px-1.5 py-0.5 leading-none">AMEX</span>
              {/* Stripe */}
              <span className="text-[10px] font-semibold tracking-tight border border-stone-500 rounded px-1.5 py-0.5 leading-none">stripe</span>
              {/* PayPal */}
              <span className="text-[10px] font-bold italic tracking-tighter border border-stone-500 rounded px-1.5 py-0.5 leading-none">PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
