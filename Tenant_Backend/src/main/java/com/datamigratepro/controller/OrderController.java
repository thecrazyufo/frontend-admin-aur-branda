package com.datamigratepro.controller;

import com.datamigratepro.config.TenantContext;
import com.datamigratepro.entity.*;
import com.datamigratepro.repository.LicenseKeyRepository;
import com.datamigratepro.repository.OrderRepository;
import com.datamigratepro.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/checkout")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private LicenseKeyRepository licenseKeyRepository;

    @Autowired
    private com.datamigratepro.service.StripeService stripeService;

    @Autowired
    private com.datamigratepro.service.PayPalService payPalService;

    @Autowired
    private com.datamigratepro.service.EmailService emailService;

    @Autowired
    private com.datamigratepro.repository.CouponRepository couponRepository;

    private double calculateDiscountedAmount(String couponCode, String siteId, double baseAmount) {
        if (couponCode == null || couponCode.isBlank()) {
            return baseAmount;
        }
        Optional<Coupon> couponOpt = couponRepository.findByCodeAndSiteId(couponCode.toUpperCase(), siteId);
        if (couponOpt.isPresent()) {
            Coupon coupon = couponOpt.get();
            if (coupon.isActive() && (coupon.getExpiresAt() == null || coupon.getExpiresAt().isAfter(LocalDateTime.now()))) {
                double discount = baseAmount * (coupon.getDiscountPercentage() / 100.0);
                return baseAmount - discount;
            }
        }
        return baseAmount;
    }

    private double calculateSalesTax(String country, String state, double subtotal) {
        if (subtotal <= 0 || country == null || country.isBlank()) return 0.0;
        
        String cleanCountry = country.trim().toUpperCase();
        String cleanState = state != null ? state.trim().toUpperCase() : "";

        if (cleanCountry.equals("US") || cleanCountry.equals("USA") || cleanCountry.equals("UNITED STATES")) {
            if (cleanState.equals("TX") || cleanState.equals("TEXAS")) return 0.0825; // 8.25% Texas
            if (cleanState.equals("NY") || cleanState.equals("NEW YORK")) return 0.08875; // 8.875% NY
            if (cleanState.equals("CA") || cleanState.equals("CALIFORNIA")) return 0.0725; // 7.25% CA
            if (cleanState.equals("WA") || cleanState.equals("WASHINGTON")) return 0.065; // 6.5% WA
            return 0.06; // Standard US remote sales tax estimate
        }
        
        // EU VAT Standard rates
        if (cleanCountry.equals("DE") || cleanCountry.equals("GERMANY")) return 0.19; // Germany
        if (cleanCountry.equals("FR") || cleanCountry.equals("FRANCE")) return 0.20; // France
        if (cleanCountry.equals("IT") || cleanCountry.equals("ITALY")) return 0.22; // Italy
        if (cleanCountry.equals("ES") || cleanCountry.equals("SPAIN")) return 0.21; // Spain
        if (cleanCountry.equals("NL") || cleanCountry.equals("NETHERLANDS")) return 0.21; // Netherlands
        
        // UK & India
        if (cleanCountry.equals("GB") || cleanCountry.equals("UK") || cleanCountry.equals("UNITED KINGDOM")) return 0.20;
        if (cleanCountry.equals("IN") || cleanCountry.equals("INDIA")) return 0.18; // 18% GST on software

        return 0.0;
    }

    @PostMapping("/complete")
    public ResponseEntity<Map<String, Object>> completeCheckout(@RequestBody Map<String, String> request) {
        String siteId = request.get("siteId");
        if (siteId == null || siteId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "siteId is required"));
        }
        TenantContext.setCurrentTenant(siteId);

        String productId = request.get("productId");
        String tierName = request.get("pricingTierName");
        String email = request.get("customerEmail");
        String paymentMethod = request.getOrDefault("paymentMethod", "STRIPE");
        String couponCode = request.get("couponCode");
        
        String billingName = request.get("billingName");
        String billingCompany = request.get("billingCompany");
        String billingAddress = request.get("billingAddress");
        String billingCity = request.get("billingCity");
        String billingState = request.get("billingState");
        String billingZip = request.get("billingZip");
        String billingCountry = request.get("billingCountry");
        String taxId = request.get("taxId");

        if (productId == null || tierName == null || email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "productId, pricingTierName, and customerEmail are required"));
        }

        // Try lookup by ID or slug
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            productOpt = productRepository.findBySlugAndSiteId(productId, siteId);
        }

        if (productOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Product not found"));
        }

        Product product = productOpt.get();

        // Find pricing tier
        PricingTier selectedTier = null;
        if (product.getPricing() != null) {
            for (PricingTier tier : product.getPricing()) {
                if (tier.getName().equalsIgnoreCase(tierName)) {
                    selectedTier = tier;
                    break;
                }
            }
        }
        double baseAmount = selectedTier != null ? selectedTier.getPrice() : 49.00;
        double subtotal = calculateDiscountedAmount(couponCode, siteId, baseAmount);
        double taxRate = calculateSalesTax(billingCountry, billingState, subtotal);
        double taxAmount = subtotal * taxRate;
        double amount = subtotal + taxAmount;

        // Generate Order ID
        String orderId = "ORD-" + (100000 + new Random().nextInt(900000));

        Order order = processSuccessfulOrder(siteId, product.getId(), tierName, email, paymentMethod, orderId, amount,
            billingName, billingCompany, billingAddress, billingCity, billingState, billingZip, billingCountry, taxId, taxAmount, taxRate);
        return ResponseEntity.ok(buildOrderResponseMap(order));
    }

    @PostMapping("/create-stripe-session")
    public ResponseEntity<Map<String, Object>> createStripeSession(@RequestBody Map<String, String> request) {
        String siteId = request.get("siteId");
        if (siteId == null || siteId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "siteId is required"));
        }
        TenantContext.setCurrentTenant(siteId);

        String productId = request.get("productId");
        String tierName = request.get("pricingTierName");
        String email = request.get("customerEmail");
        String successUrl = request.get("successUrl");
        String cancelUrl = request.get("cancelUrl");
        String couponCode = request.get("couponCode");
        
        String billingCountry = request.get("billingCountry");
        String billingState = request.get("billingState");

        if (productId == null || tierName == null || email == null || successUrl == null || cancelUrl == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "productId, pricingTierName, customerEmail, successUrl, and cancelUrl are required"));
        }

        // Try lookup by ID or slug
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            productOpt = productRepository.findBySlugAndSiteId(productId, siteId);
        }

        if (productOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Product not found"));
        }

        Product product = productOpt.get();

        // Find pricing tier
        PricingTier selectedTier = null;
        if (product.getPricing() != null) {
            for (PricingTier tier : product.getPricing()) {
                if (tier.getName().equalsIgnoreCase(tierName)) {
                    selectedTier = tier;
                    break;
                }
            }
        }
        double baseAmount = selectedTier != null ? selectedTier.getPrice() : 49.00;
        double subtotal = calculateDiscountedAmount(couponCode, siteId, baseAmount);
        double taxRate = calculateSalesTax(billingCountry, billingState, subtotal);
        double taxAmount = subtotal * taxRate;
        double amount = subtotal + taxAmount;

        Map<String, Object> session = stripeService.createCheckoutSession(
                product.getId(),
                product.getName(),
                tierName,
                amount,
                email,
                siteId,
                successUrl,
                cancelUrl
        );

        return ResponseEntity.ok(session);
    }

    @PostMapping("/confirm-stripe")
    public ResponseEntity<Map<String, Object>> confirmStripe(@RequestBody Map<String, String> request) {
        String sessionId = request.get("sessionId");
        String siteId = request.get("siteId");
        String couponCode = request.get("couponCode");
        
        String billingName = request.get("billingName");
        String billingCompany = request.get("billingCompany");
        String billingAddress = request.get("billingAddress");
        String billingCity = request.get("billingCity");
        String billingState = request.get("billingState");
        String billingZip = request.get("billingZip");
        String billingCountry = request.get("billingCountry");
        String taxId = request.get("taxId");

        if (sessionId == null || sessionId.isBlank() || siteId == null || siteId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "sessionId and siteId are required"));
        }
        TenantContext.setCurrentTenant(siteId);

        // Check if order already processed for this Stripe session to prevent duplicate processing
        Optional<Order> existingOrder = orderRepository.findByOrderId(sessionId);
        if (existingOrder.isPresent()) {
            return ResponseEntity.ok(buildOrderResponseMap(existingOrder.get()));
        }

        Map<String, String> stripeDetails = stripeService.confirmSession(sessionId);
        if (!"paid".equalsIgnoreCase(stripeDetails.get("status"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment not completed or verified."));
        }

        // For mock/simulated sessions or fallback details:
        String email = stripeDetails.getOrDefault("customerEmail", request.get("customerEmail"));
        String productId = stripeDetails.getOrDefault("productId", request.get("productId"));
        String tierName = stripeDetails.getOrDefault("pricingTierName", request.get("pricingTierName"));
        
        // Fallback amount parsing
        double amount = 49.00;
        double taxRate = calculateSalesTax(billingCountry, billingState, 1.0);
        double taxAmount = 0.0;
        try {
            String amtStr = stripeDetails.get("amount");
            if (amtStr != null) {
                amount = Double.parseDouble(amtStr);
                double subtotal = amount / (1.0 + taxRate);
                taxAmount = amount - subtotal;
            } else {
                // Fetch product details
                Optional<Product> prodOpt = productRepository.findById(productId);
                if (prodOpt.isEmpty()) {
                    prodOpt = productRepository.findBySlugAndSiteId(productId, siteId);
                }
                if (prodOpt.isPresent()) {
                    Product product = prodOpt.get();
                    if (product.getPricing() != null) {
                        for (PricingTier tier : product.getPricing()) {
                            if (tier.getName().equalsIgnoreCase(tierName)) {
                                double baseAmount = tier.getPrice();
                                double subtotal = calculateDiscountedAmount(couponCode, siteId, baseAmount);
                                taxRate = calculateSalesTax(billingCountry, billingState, subtotal);
                                taxAmount = subtotal * taxRate;
                                amount = subtotal + taxAmount;
                                break;
                            }
                        }
                    }
                }
            }
        } catch (Exception ignored) {}

        if (email == null || productId == null || tierName == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Session detail lookup failed. Please specify customerEmail, productId, and pricingTierName in the fallback request body."));
        }

        Order order = processSuccessfulOrder(siteId, productId, tierName, email, "STRIPE", sessionId, amount,
            billingName, billingCompany, billingAddress, billingCity, billingState, billingZip, billingCountry, taxId, taxAmount, taxRate);
        return ResponseEntity.ok(buildOrderResponseMap(order));
    }

    @PostMapping("/create-paypal-order")
    public ResponseEntity<Map<String, Object>> createPaypalOrder(@RequestBody Map<String, String> request) {
        String siteId = request.get("siteId");
        if (siteId == null || siteId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "siteId is required"));
        }
        TenantContext.setCurrentTenant(siteId);

        String productId = request.get("productId");
        String tierName = request.get("pricingTierName");
        String email = request.get("customerEmail");
        String couponCode = request.get("couponCode");
        
        String billingCountry = request.get("billingCountry");
        String billingState = request.get("billingState");

        if (productId == null || tierName == null || email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "productId, pricingTierName, and customerEmail are required"));
        }

        // Try lookup by ID or slug
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            productOpt = productRepository.findBySlugAndSiteId(productId, siteId);
        }

        if (productOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Product not found"));
        }

        Product product = productOpt.get();

        // Find pricing tier
        PricingTier selectedTier = null;
        if (product.getPricing() != null) {
            for (PricingTier tier : product.getPricing()) {
                if (tier.getName().equalsIgnoreCase(tierName)) {
                    selectedTier = tier;
                    break;
                }
            }
        }
        double baseAmount = selectedTier != null ? selectedTier.getPrice() : 49.00;
        double subtotal = calculateDiscountedAmount(couponCode, siteId, baseAmount);
        double taxRate = calculateSalesTax(billingCountry, billingState, subtotal);
        double taxAmount = subtotal * taxRate;
        double amount = subtotal + taxAmount;

        String returnUrl = request.get("returnUrl");
        String cancelUrl = request.get("cancelUrl");

        if (returnUrl == null || cancelUrl == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "returnUrl and cancelUrl are required"));
        }

        Map<String, Object> paypalOrder = payPalService.createOrder(
                product.getId(),
                product.getName(),
                tierName,
                amount,
                email,
                siteId,
                returnUrl,
                cancelUrl
        );

        return ResponseEntity.ok(paypalOrder);
    }

    @PostMapping("/capture-paypal-order")
    public ResponseEntity<Map<String, Object>> capturePaypalOrder(@RequestBody Map<String, String> request) {
        String orderId = request.get("paypalOrderId");
        String siteId = request.get("siteId");
        String couponCode = request.get("couponCode");
        
        String billingName = request.get("billingName");
        String billingCompany = request.get("billingCompany");
        String billingAddress = request.get("billingAddress");
        String billingCity = request.get("billingCity");
        String billingState = request.get("billingState");
        String billingZip = request.get("billingZip");
        String billingCountry = request.get("billingCountry");
        String taxId = request.get("taxId");

        if (orderId == null || orderId.isBlank() || siteId == null || siteId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "paypalOrderId and siteId are required"));
        }
        TenantContext.setCurrentTenant(siteId);

        // Check if order already processed for this PayPal order ID
        Optional<Order> existingOrder = orderRepository.findByOrderId(orderId);
        if (existingOrder.isPresent()) {
            return ResponseEntity.ok(buildOrderResponseMap(existingOrder.get()));
        }

        Map<String, String> paypalDetails = payPalService.captureOrder(orderId);
        if (!"paid".equalsIgnoreCase(paypalDetails.get("status"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "PayPal payment capture failed or is unpaid."));
        }

        String email = paypalDetails.getOrDefault("customerEmail", request.get("customerEmail"));
        String productId = request.get("productId");
        String tierName = request.get("pricingTierName");

        if (email == null || productId == null || tierName == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Order detail lookups failed. Please supply customerEmail, productId, and pricingTierName in the request body."));
        }

        // Look up product to find actual amount
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            productOpt = productRepository.findBySlugAndSiteId(productId, siteId);
        }
        double amount = 49.00;
        double taxRate = calculateSalesTax(billingCountry, billingState, amount);
        double taxAmount = 0.0;
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            if (product.getPricing() != null) {
                for (PricingTier tier : product.getPricing()) {
                    if (tier.getName().equalsIgnoreCase(tierName)) {
                        double baseAmount = tier.getPrice();
                        double subtotal = calculateDiscountedAmount(couponCode, siteId, baseAmount);
                        taxRate = calculateSalesTax(billingCountry, billingState, subtotal);
                        taxAmount = subtotal * taxRate;
                        amount = subtotal + taxAmount;
                        break;
                    }
                }
            }
        }

        Order order = processSuccessfulOrder(siteId, productId, tierName, email, "PAYPAL", orderId, amount,
            billingName, billingCompany, billingAddress, billingCity, billingState, billingZip, billingCountry, taxId, taxAmount, taxRate);
        return ResponseEntity.ok(buildOrderResponseMap(order));
    }

    private Order processSuccessfulOrder(
            String siteId, 
            String productId, 
            String pricingTierName, 
            String customerEmail, 
            String paymentMethod, 
            String externalOrderId, 
            double amount,
            String billingName,
            String billingCompany,
            String billingAddress,
            String billingCity,
            String billingState,
            String billingZip,
            String billingCountry,
            String taxId,
            double taxAmount,
            double taxRate) {
        
        TenantContext.setCurrentTenant(siteId);

        // Try lookup by ID or slug
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            productOpt = productRepository.findBySlugAndSiteId(productId, siteId);
        }

        if (productOpt.isEmpty()) {
            throw new IllegalArgumentException("Product not found: " + productId);
        }

        Product product = productOpt.get();

        // Find pricing tier
        PricingTier selectedTier = null;
        if (product.getPricing() != null) {
            for (PricingTier tier : product.getPricing()) {
                if (tier.getName().equalsIgnoreCase(pricingTierName)) {
                    selectedTier = tier;
                    break;
                }
            }
        }

        String period = selectedTier != null ? selectedTier.getPeriod() : "lifetime";

        // Generate License Key
        String rawUuid = UUID.randomUUID().toString().replace("-", "").toUpperCase();
        String activationKey = "DMP-" + rawUuid.substring(0, 4) + "-" + rawUuid.substring(4, 8) + "-" + rawUuid.substring(8, 12);

        // Resolve device count
        int maxDevices = 1;
        if (pricingTierName.toLowerCase().contains("enterprise") || pricingTierName.toLowerCase().contains("technician")) {
            maxDevices = 25;
        } else if (pricingTierName.toLowerCase().contains("business") || pricingTierName.toLowerCase().contains("family")) {
            maxDevices = 5;
        }

        // Resolve expiration
        LocalDateTime expiresAt = null;
        if ("yearly".equalsIgnoreCase(period) || "1 year".equalsIgnoreCase(period)) {
            expiresAt = LocalDateTime.now().plusYears(1);
        }

        // Save License Key
        LicenseKey license = new LicenseKey();
        license.setActivationKey(activationKey);
        license.setOrderId(externalOrderId);
        license.setProductId(product.getId());
        license.setPricingTierName(pricingTierName);
        license.setCustomerEmail(customerEmail.trim());
        license.setStatus(LicenseStatus.ACTIVE);
        license.setMaxDevices(maxDevices);
        license.setCreatedAt(LocalDateTime.now());
        license.setExpiresAt(expiresAt);
        license.setSiteId(siteId);
        licenseKeyRepository.save(license);

        // Save Order record
        Order order = new Order();
        order.setOrderId(externalOrderId);
        order.setCustomerEmail(customerEmail.trim());
        order.setProductId(product.getId());
        order.setProductName(product.getName());
        order.setPricingTierName(pricingTierName);
        order.setAmount(amount);
        order.setCurrency("USD");
        order.setPaymentStatus("PAID");
        order.setPaymentMethod(paymentMethod.toUpperCase());
        order.setActivationKey(activationKey);
        
        // Billing details
        order.setBillingName(billingName);
        order.setBillingCompany(billingCompany);
        order.setBillingAddress(billingAddress);
        order.setBillingCity(billingCity);
        order.setBillingState(billingState);
        order.setBillingZip(billingZip);
        order.setBillingCountry(billingCountry);
        order.setTaxId(taxId);
        order.setTaxAmount(taxAmount);
        order.setTaxRate(taxRate);

        order.setCreatedAt(LocalDateTime.now());
        order.setSiteId(siteId);
        orderRepository.save(order);

        // Trigger Email Notification (Sends Invoice & Activation Key)
        try {
            emailService.sendInvoiceEmail(order);
        } catch (Exception e) {
            System.err.println("Failed to send post-checkout email: " + e.getMessage());
        }

        return order;
    }

    private Map<String, Object> buildOrderResponseMap(Order order) {
        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getOrderId());
        response.put("customerEmail", order.getCustomerEmail());
        response.put("productName", order.getProductName());
        response.put("pricingTierName", order.getPricingTierName());
        response.put("amount", order.getAmount());
        response.put("currency", order.getCurrency());
        response.put("paymentStatus", order.getPaymentStatus());
        response.put("paymentMethod", order.getPaymentMethod());
        response.put("activationKey", order.getActivationKey());
        response.put("createdAt", order.getCreatedAt().toString());
        
        response.put("billingName", order.getBillingName());
        response.put("billingCompany", order.getBillingCompany());
        response.put("billingAddress", order.getBillingAddress());
        response.put("billingCity", order.getBillingCity());
        response.put("billingState", order.getBillingState());
        response.put("billingZip", order.getBillingZip());
        response.put("billingCountry", order.getBillingCountry());
        response.put("taxId", order.getTaxId());
        response.put("taxAmount", order.getTaxAmount());
        response.put("taxRate", order.getTaxRate());

        // Simple invoice details
        Map<String, Object> invoice = new HashMap<>();
        invoice.put("invoiceNumber", "INV-" + order.getOrderId().substring(0, Math.min(order.getOrderId().length(), 8)) + "-" + (1000 + new Random().nextInt(9000)));
        invoice.put("issueDate", order.getCreatedAt().toString().substring(0, 10));
        invoice.put("billingEmail", order.getCustomerEmail());
        invoice.put("itemName", order.getProductName() + " - " + order.getPricingTierName() + " Plan");
        invoice.put("subtotal", order.getAmount() - order.getTaxAmount());
        invoice.put("tax", order.getTaxAmount());
        invoice.put("total", order.getAmount());
        response.put("invoice", invoice);

        return response;
    }
}
