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

  // Loading & Result States
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
        pricingTierName: tierName ? decodeURIComponent(tierName) : selectedTier.name
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
        pricingTierName: tierName ? decodeURIComponent(tierName) : selectedTier.name
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
      const successUrlParams = `?success=true&session_id={CHECKOUT_SESSION_ID}&product=${product.slug}&tier=${encodeURIComponent(selectedTier.name)}&email=${encodeURIComponent(email)}`;
      const cancelUrlParams = `?cancelled=true&product=${product.slug}&tier=${encodeURIComponent(selectedTier.name)}&email=${encodeURIComponent(email)}`;

      if (paymentMethod === "STRIPE") {
        const session = await CheckoutAPI.createStripeSession({
          productId: product.id,
          pricingTierName: selectedTier.name,
          customerEmail: email,
          siteId: siteId,
          successUrl: currentUrl + successUrlParams,
          cancelUrl: currentUrl + cancelUrlParams
        });
        // Redirect to Stripe checkout screen
        window.location.href = session.url;
      } else if (paymentMethod === "PAYPAL") {
        const order = await CheckoutAPI.createPaypalOrder({
          productId: product.id,
          pricingTierName: selectedTier.name,
          customerEmail: email,
          siteId: siteId,
          returnUrl: currentUrl + `?paypal_success=true&product=${product.slug}&tier=${encodeURIComponent(selectedTier.name)}&email=${encodeURIComponent(email)}`,
          cancelUrl: currentUrl + cancelUrlParams
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
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 max-w-2xl mx-auto my-8 print:border-none print:shadow-none print:my-0">
        <div className="text-center mb-8 print:hidden">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 text-green-600">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Purchase Successful!</h2>
          <p className="text-gray-500 mt-2">
            Your license key and invoice details are generated below.
          </p>
        </div>

        {/* License Key Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 print:bg-white print:border-gray-200">
          <div className="flex items-center gap-2 text-blue-800 font-bold mb-3">
            <Key size={18} />
            <span>YOUR LICENSE KEY</span>
          </div>
          <div className="flex items-center justify-between gap-4 bg-white border border-blue-200 rounded-xl p-4 font-mono text-lg font-bold text-blue-900">
            <span>{result.activationKey}</span>
            <button
              onClick={handleCopyKey}
              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors print:hidden"
              title="Copy license key"
            >
              {copied ? <span className="text-xs text-green-600 font-sans">Copied!</span> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-xs text-blue-700 mt-3 leading-relaxed">
            * Use this key and your Order ID <strong>{result.orderId}</strong> to activate the desktop application under settings/license configuration.
          </p>
        </div>

        {/* Invoice Section */}
        <div className="border-t border-gray-200 pt-8" id="invoice-receipt">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg uppercase tracking-wider">INVOICE</h3>
              <p className="text-sm text-gray-400 mt-1">Invoice #: {result.invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">Date: {result.invoice.issueDate}</p>
              <p className="text-sm text-gray-500">Order Ref: {result.orderId}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Bill To:</span>
              <span className="font-medium text-gray-900">{result.customerEmail}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Payment Via:</span>
              <span className="font-medium text-gray-900">{result.paymentMethod} (Simulated)</span>
            </div>
          </div>

          {/* Itemized Charge */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                  <th className="p-4">Item Description</th>
                  <th className="p-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-sm border-b border-gray-100 text-gray-700">
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{result.invoice.itemName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Desktop Application License</p>
                  </td>
                  <td className="p-4 text-right font-medium">${result.invoice.subtotal.toFixed(2)}</td>
                </tr>
                <tr className="text-sm font-semibold text-gray-900">
                  <td className="p-4 text-right text-gray-500">Total Paid</td>
                  <td className="p-4 text-right text-lg text-blue-700">${result.invoice.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end print:hidden">
            <button
              onClick={handlePrint}
              className="btn btn-outline py-2.5 px-4 flex items-center gap-2 text-sm"
            >
              <Printer size={15} />
              Print Invoice
            </button>
            <a
              href={`/download?product=${product.slug}`}
              className="btn btn-primary py-2.5 px-6 flex items-center gap-2 text-sm"
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto my-8">
      {/* Left Column: Checkout Form */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>

        <form onSubmit={handleCheckoutSubmit} className="space-y-6">
          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Billing Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-colors text-sm"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              We'll send your activation instructions and transaction invoice to this address.
            </p>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("STRIPE")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-semibold text-sm transition-all ${
                  paymentMethod === "STRIPE"
                    ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <CreditCard size={16} />
                Credit Card (Stripe)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("PAYPAL")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-semibold text-sm transition-all ${
                  paymentMethod === "PAYPAL"
                    ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <span>💳 PayPal</span>
              </button>
            </div>
          </div>

          {/* Payment Detail Simulator */}
          {paymentMethod === "STRIPE" ? (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                💳 Secure Stripe Sandbox
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">CVC</label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                🛍️ PayPal Checkout Sandbox
              </div>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                Clicking "Pay Now" will redirect you to a secure simulated PayPal popup to verify your account credentials.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Checkout Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full justify-center py-3.5 text-base flex items-center gap-2"
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
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h3>

          <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shrink-0 text-white">
              <Download size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{product.name}</h4>
              <p className="text-xs text-gray-400 mt-0.5">{selectedTier.name} Plan</p>
            </div>
          </div>

          <div className="py-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">License Subtotal</span>
              <span className="font-medium text-gray-900">${selectedTier.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">VAT / Tax</span>
              <span className="font-medium text-gray-900">$0.00</span>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-between items-baseline">
            <span className="font-bold text-gray-900">Total Price</span>
            <span className="font-bold text-2xl text-blue-700">${selectedTier.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Security Assurances */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={16} className="text-green-600 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-700">256-Bit SSL Encryption</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Your payment details are protected with bank-grade security protocols.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle size={16} className="text-green-600 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-700">Instant Key Generation</p>
              <p className="text-[11px] text-gray-400 mt-0.5">License key is rendered immediately on screen upon successful payment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
