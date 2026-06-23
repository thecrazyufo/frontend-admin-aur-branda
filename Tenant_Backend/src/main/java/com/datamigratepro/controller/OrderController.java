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
        double amount = selectedTier != null ? selectedTier.getPrice() : 49.00;

        // Generate Order ID
        String orderId = "ORD-" + (100000 + new Random().nextInt(900000));

        Order order = processSuccessfulOrder(siteId, product.getId(), tierName, email, paymentMethod, orderId, amount);
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
        double amount = selectedTier != null ? selectedTier.getPrice() : 49.00;

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
        try {
            String amtStr = stripeDetails.get("amount");
            if (amtStr != null) amount = Double.parseDouble(amtStr);
        } catch (Exception ignored) {}

        if (email == null || productId == null || tierName == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Session detail lookup failed. Please specify customerEmail, productId, and pricingTierName in the fallback request body."));
        }

        Order order = processSuccessfulOrder(siteId, productId, tierName, email, "STRIPE", sessionId, amount);
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
        double amount = selectedTier != null ? selectedTier.getPrice() : 49.00;

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
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            if (product.getPricing() != null) {
                for (PricingTier tier : product.getPricing()) {
                    if (tier.getName().equalsIgnoreCase(tierName)) {
                        amount = tier.getPrice();
                        break;
                    }
                }
            }
        }

        Order order = processSuccessfulOrder(siteId, productId, tierName, email, "PAYPAL", orderId, amount);
        return ResponseEntity.ok(buildOrderResponseMap(order));
    }

    private Order processSuccessfulOrder(
            String siteId, 
            String productId, 
            String pricingTierName, 
            String customerEmail, 
            String paymentMethod, 
            String externalOrderId, 
            double amount) {
        
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

        double finalAmount = selectedTier != null ? selectedTier.getPrice() : amount;
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
        order.setAmount(finalAmount);
        order.setCurrency("USD");
        order.setPaymentStatus("PAID");
        order.setPaymentMethod(paymentMethod.toUpperCase());
        order.setActivationKey(activationKey);
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

        // Simple invoice details
        Map<String, Object> invoice = new HashMap<>();
        invoice.put("invoiceNumber", "INV-" + order.getOrderId().substring(0, Math.min(order.getOrderId().length(), 8)) + "-" + (1000 + new Random().nextInt(9000)));
        invoice.put("issueDate", order.getCreatedAt().toString().substring(0, 10));
        invoice.put("billingEmail", order.getCustomerEmail());
        invoice.put("itemName", order.getProductName() + " - " + order.getPricingTierName() + " Plan");
        invoice.put("subtotal", order.getAmount());
        invoice.put("tax", 0.00);
        invoice.put("total", order.getAmount());
        response.put("invoice", invoice);

        return response;
    }
}
