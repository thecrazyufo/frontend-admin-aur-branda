package com.datamigratepro.service;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@Service
public class StripeService {

    private static final Logger log = LoggerFactory.getLogger(StripeService.class);

    @Value("${payment.stripe.secret-key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        if (!isMockMode()) {
            Stripe.apiKey = secretKey;
        }
    }

    private boolean isMockMode() {
        return secretKey == null || secretKey.isBlank() || secretKey.startsWith("sk_test_mock");
    }

    public Map<String, Object> createCheckoutSession(
            String productId, 
            String productName, 
            String pricingTierName, 
            double amount, 
            String customerEmail, 
            String siteId, 
            String successUrl, 
            String cancelUrl) {
        
        Map<String, Object> response = new HashMap<>();

        if (isMockMode()) {
            log.info("[STRIPE SIMULATION] Creating checkout session for {} - {} (${})", productName, pricingTierName, amount);
            String mockSessionId = "mock_session_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            
            // Build redirect URL
            String redirectUrl = successUrl
                    .replace("{CHECKOUT_SESSION_ID}", mockSessionId)
                    .replace("session_id={CHECKOUT_SESSION_ID}", "session_id=" + mockSessionId);
            
            // Append missing params if needed
            if (!redirectUrl.contains("session_id=")) {
                redirectUrl += (redirectUrl.contains("?") ? "&" : "?") + "session_id=" + mockSessionId;
            }

            response.put("id", mockSessionId);
            response.put("url", redirectUrl);
            response.put("mode", "simulation");
            return response;
        }

        try {
            // Map amount to cents (Stripe expects integer cents)
            long unitAmountCents = Math.round(amount * 100);

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setCustomerEmail(customerEmail)
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(cancelUrl)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("usd")
                                                    .setUnitAmount(unitAmountCents)
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName(productName + " - " + pricingTierName + " Plan")
                                                                    .setDescription("Desktop application license key")
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .build()
                    )
                    .putMetadata("productId", productId)
                    .putMetadata("productName", productName)
                    .putMetadata("pricingTierName", pricingTierName)
                    .putMetadata("customerEmail", customerEmail.trim())
                    .putMetadata("siteId", siteId)
                    .putMetadata("amount", String.valueOf(amount))
                    .build();

            Session session = Session.create(params);
            
            response.put("id", session.getId());
            response.put("url", session.getUrl());
            response.put("mode", "live");
            return response;
        } catch (Exception e) {
            log.error("Stripe Session creation failed", e);
            throw new RuntimeException("Failed to initiate Stripe payment", e);
        }
    }

    public Map<String, String> confirmSession(String sessionId) {
        Map<String, String> details = new HashMap<>();

        if (isMockMode() || sessionId.startsWith("mock_session_")) {
            log.info("[STRIPE SIMULATION] Confirming mock session: {}", sessionId);
            details.put("status", "paid");
            details.put("sessionId", sessionId);
            return details;
        }

        try {
            Session session = Session.retrieve(sessionId);
            if ("paid".equalsIgnoreCase(session.getPaymentStatus())) {
                details.put("status", "paid");
                details.put("sessionId", session.getId());
                details.put("customerEmail", session.getMetadata().get("customerEmail"));
                details.put("productId", session.getMetadata().get("productId"));
                details.put("productName", session.getMetadata().get("productName"));
                details.put("pricingTierName", session.getMetadata().get("pricingTierName"));
                details.put("amount", session.getMetadata().get("amount"));
                details.put("currency", "USD");
            } else {
                details.put("status", "unpaid");
            }
            return details;
        } catch (Exception e) {
            log.error("Failed to retrieve Stripe session", e);
            throw new RuntimeException("Payment confirmation failed", e);
        }
    }
}
