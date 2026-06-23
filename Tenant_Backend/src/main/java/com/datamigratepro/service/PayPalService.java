package com.datamigratepro.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@Service
public class PayPalService {

    private static final Logger log = LoggerFactory.getLogger(PayPalService.class);

    @Value("${payment.paypal.client-id}")
    private String clientId;

    @Value("${payment.paypal.client-secret}")
    private String clientSecret;

    @Value("${payment.paypal.mode}")
    private String mode;

    private final RestTemplate restTemplate = new RestTemplate();

    private boolean isMockMode() {
        return clientId == null || clientId.isBlank() || clientId.startsWith("mock_");
    }

    private String getBaseUrl() {
        return "live".equalsIgnoreCase(mode) ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
    }

    private String getAccessToken() {
        String url = getBaseUrl() + "/v1/oauth2/token";
        
        HttpHeaders headers = new HttpHeaders();
        String auth = clientId + ":" + clientSecret;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        HttpEntity<String> entity = new HttpEntity<>("grant_type=client_credentials", headers);
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
        } catch (Exception e) {
            log.error("Failed to fetch PayPal access token", e);
        }
        return null;
    }

    public Map<String, Object> createOrder(
            String productId, 
            String productName, 
            String pricingTierName, 
            double amount, 
            String customerEmail, 
            String siteId,
            String returnUrl,
            String cancelUrl) {
        
        Map<String, Object> response = new HashMap<>();

        if (isMockMode()) {
            log.info("[PAYPAL SIMULATION] Creating order for {} - {} (${})", productName, pricingTierName, amount);
            String mockOrderId = "mock_paypal_order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            
            // Build redirect URL
            String redirectUrl = returnUrl + (returnUrl.contains("?") ? "&" : "?") + "token=" + mockOrderId;
            
            response.put("id", mockOrderId);
            response.put("url", redirectUrl);
            response.put("status", "CREATED");
            response.put("mode", "simulation");
            return response;
        }

        String token = getAccessToken();
        if (token == null) {
            throw new RuntimeException("Could not authenticate with PayPal");
        }

        String url = getBaseUrl() + "/v2/checkout/orders";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Body Construction
        Map<String, Object> orderRequest = new HashMap<>();
        orderRequest.put("intent", "CAPTURE");
        
        Map<String, Object> purchaseUnit = new HashMap<>();
        purchaseUnit.put("description", productName + " - " + pricingTierName + " Plan");
        
        Map<String, Object> amountMap = new HashMap<>();
        amountMap.put("currency_code", "USD");
        amountMap.put("value", String.format(Locale.US, "%.2f", amount));
        purchaseUnit.put("amount", amountMap);
        
        orderRequest.put("purchase_units", Collections.singletonList(purchaseUnit));

        // Add application_context for redirect flow
        Map<String, String> appContext = new HashMap<>();
        appContext.put("return_url", returnUrl);
        appContext.put("cancel_url", cancelUrl);
        orderRequest.put("application_context", appContext);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(orderRequest, headers);

        try {
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);
            if (resp.getStatusCode() == HttpStatus.CREATED && resp.getBody() != null) {
                String approveUrl = "";
                List<Map<String, Object>> links = (List<Map<String, Object>>) resp.getBody().get("links");
                if (links != null) {
                    for (Map<String, Object> link : links) {
                        if ("approve".equalsIgnoreCase((String) link.get("rel"))) {
                            approveUrl = (String) link.get("href");
                            break;
                        }
                    }
                }
                response.put("id", resp.getBody().get("id"));
                response.put("url", approveUrl);
                response.put("status", resp.getBody().get("status"));
                response.put("mode", "live");
                return response;
            }
        } catch (Exception e) {
            log.error("PayPal Order creation failed", e);
            throw new RuntimeException("Failed to initiate PayPal order", e);
        }
        throw new RuntimeException("PayPal order initialization response empty");
    }

    public Map<String, String> captureOrder(String orderId) {
        Map<String, String> details = new HashMap<>();

        if (isMockMode() || orderId.startsWith("mock_paypal_order_")) {
            log.info("[PAYPAL SIMULATION] Capturing mock PayPal order: {}", orderId);
            details.put("status", "paid");
            details.put("orderId", orderId);
            return details;
        }

        String token = getAccessToken();
        if (token == null) {
            throw new RuntimeException("Could not authenticate with PayPal");
        }

        String url = getBaseUrl() + "/v2/checkout/orders/" + orderId + "/capture";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>("{}", headers);

        try {
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);
            if (resp.getStatusCode() == HttpStatus.CREATED || resp.getStatusCode() == HttpStatus.OK) {
                Map body = resp.getBody();
                if (body != null && "COMPLETED".equalsIgnoreCase((String) body.get("status"))) {
                    details.put("status", "paid");
                    details.put("orderId", orderId);
                    
                    // Attempt to extract email
                    try {
                        Map payer = (Map) body.get("payer");
                        if (payer != null) {
                            details.put("customerEmail", (String) payer.get("email_address"));
                        }
                    } catch (Exception ignored) {}
                } else {
                    details.put("status", "unpaid");
                }
                return details;
            }
        } catch (Exception e) {
            log.error("PayPal Order capture failed for order: " + orderId, e);
            throw new RuntimeException("PayPal order capture failed", e);
        }
        
        details.put("status", "failed");
        return details;
    }
}
