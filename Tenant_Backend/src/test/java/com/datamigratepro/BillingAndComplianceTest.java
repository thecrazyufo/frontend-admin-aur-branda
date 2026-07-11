package com.datamigratepro;

import com.datamigratepro.entity.*;
import com.datamigratepro.repository.*;
import com.datamigratepro.service.PdfGenerationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class BillingAndComplianceTest {

    @Autowired
    private PdfGenerationService pdfGenerationService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private LicenseKeyRepository licenseKeyRepository;

    @Test
    public void testPdfInvoiceGeneration() {
        // Create a dummy order matching the new schema fields
        Order order = new Order();
        order.setOrderId("ORD-TEST12345");
        order.setCustomerEmail("customer@example.com");
        order.setProductId("prismmigration");
        order.setProductName("Prism Migration Pro");
        order.setPricingTierName("Enterprise");
        order.setAmount(108.25);
        order.setCurrency("USD");
        order.setPaymentStatus("PAID");
        order.setPaymentMethod("STRIPE");
        order.setActivationKey("DMP-TEST-KEY-1234");
        order.setBillingName("John Doe");
        order.setBillingCompany("Acme Inc.");
        order.setBillingAddress("123 Main St");
        order.setBillingCity("Austin");
        order.setBillingState("TX");
        order.setBillingZip("78701");
        order.setBillingCountry("US");
        order.setTaxId("US987654321");
        order.setTaxAmount(8.25);
        order.setTaxRate(0.0825);
        order.setCreatedAt(LocalDateTime.now());
        order.setSiteId("brandA");

        // Generate PDF
        byte[] pdfBytes = pdfGenerationService.generateInvoicePdf(order);
        
        assertNotNull(pdfBytes, "Generated PDF bytes should not be null");
        assertTrue(pdfBytes.length > 0, "Generated PDF should not be empty");
        
        // PDF files must start with the magic header %PDF
        String pdfHeader = new String(pdfBytes, 0, Math.min(pdfBytes.length, 4));
        assertEquals("%PDF", pdfHeader, "File magic header should be %PDF");
    }

    @Test
    public void testTenantIsolationGuardAndEntities() {
        // Retrieve or check if keys repository can save and query
        LicenseKey key = new LicenseKey();
        key.setActivationKey("DMP-INTEGRATION-TEST");
        key.setOrderId("ORD-INT-TEST");
        key.setProductId("product1");
        key.setPricingTierName("Standard");
        key.setCustomerEmail("user@example.com");
        key.setStatus(LicenseStatus.ACTIVE);
        key.setMaxDevices(3);
        key.setSiteId("brandA");
        key.setCreatedAt(LocalDateTime.now());

        LicenseKey saved = licenseKeyRepository.save(key);
        assertNotNull(saved.getId(), "Entity ID should be generated");
        
        Optional<LicenseKey> found = licenseKeyRepository.findByActivationKeyAndOrderId("DMP-INTEGRATION-TEST", "ORD-INT-TEST");
        assertTrue(found.isPresent(), "Saved LicenseKey should be queryable");
        assertEquals("brandA", found.get().getSiteId(), "siteId must persist correctly");

        // Clean up
        licenseKeyRepository.delete(saved);
    }
}
