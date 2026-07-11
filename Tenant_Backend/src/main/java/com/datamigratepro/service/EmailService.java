package com.datamigratepro.service;

import com.datamigratepro.entity.Order;
import com.datamigratepro.entity.SiteSetting;
import com.datamigratepro.entity.LicenseKey;
import com.datamigratepro.repository.SiteSettingRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private SiteSettingRepository siteSettingRepository;

    @Autowired
    private PdfGenerationService pdfGenerationService;

    public void sendInvoiceEmail(Order order) {
        String siteId = order.getSiteId();
        String toEmail = order.getCustomerEmail();
        String key = order.getActivationKey();
        String productName = order.getProductName();
        String tier = order.getPricingTierName();
        double amount = order.getAmount();
        String currency = order.getCurrency();

        // Retrieve site settings for dynamic branding
        Optional<SiteSetting> settingOpt = siteSettingRepository.findBySiteId(siteId);
        String siteName = "Software Platform";
        String supportEmail = "support@datamigratepro.com";
        String primaryColor = "#2563eb"; // Blue

        byte[] pdfBytes = null;
        try {
            pdfBytes = pdfGenerationService.generateInvoicePdf(order);
        } catch (Exception e) {
            log.error("Failed to generate invoice PDF for attachment", e);
        }

        if (settingOpt.isPresent()) {
            SiteSetting setting = settingOpt.get();
            siteName = setting.getName();
            if (setting.getEmail() != null && !setting.getEmail().isBlank()) {
                supportEmail = setting.getEmail();
            }
            if (setting.getTheme() != null && setting.getTheme().getPrimaryColor() != null) {
                primaryColor = setting.getTheme().getPrimaryColor();
            }
        }

        String subject = String.format("🔑 Your Activation Key & Invoice for %s - Order %s", productName, order.getOrderId());
        
        // Construct Billed To section if billing info is provided
        String billingSectionHtml = "";
        if (order.getBillingName() != null && !order.getBillingName().isBlank()) {
            String companyLine = (order.getBillingCompany() != null && !order.getBillingCompany().isBlank()) 
                ? String.format("<strong>%s</strong><br/>", order.getBillingCompany()) : "";
            String taxIdLine = (order.getTaxId() != null && !order.getTaxId().isBlank())
                ? String.format("<span style='font-size:11px;color:#6b7280;'>Tax/VAT ID: %s</span><br/>", order.getTaxId()) : "";
            
            billingSectionHtml = String.format(
                "<table style='width: 100%%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; font-size: 13px; color: #4b5563;'>" +
                "  <tr>" +
                "    <td style='width: 50%%; vertical-align: top; padding-right: 15px;'>" +
                "      <strong style='color: #111827; display: block; margin-bottom: 5px;'>Billed From:</strong>" +
                "      <strong>%s</strong><br/>" +
                "      %s<br/>" +
                "      United States" +
                "    </td>" +
                "    <td style='width: 50%%; vertical-align: top; text-align: right;'>" +
                "      <strong style='color: #111827; display: block; margin-bottom: 5px;'>Billed To:</strong>" +
                "      %s" +
                "      %s<br/>" +
                "      %s, %s %s<br/>" +
                "      %s<br/>" +
                "      %s" +
                "    </td>" +
                "  </tr>" +
                "</table>",
                siteName,
                supportEmail,
                companyLine,
                order.getBillingName(),
                order.getBillingAddress() != null ? order.getBillingAddress() : "",
                order.getBillingCity() != null ? order.getBillingCity() : "",
                order.getBillingZip() != null ? order.getBillingZip() : "",
                order.getBillingCountry() != null ? order.getBillingCountry() : "",
                taxIdLine
            );
        }

        // Construct HTML email template with matching brand styling
        String htmlBody = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "  <style>" +
            "    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; margin: 0; padding: 0; background-color: #f9f9f9; }" +
            "    .wrapper { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }" +
            "    .header { background-color: %s; padding: 30px; text-align: center; color: #ffffff; }" +
            "    .header h1 { margin: 0; font-size: 24px; font-weight: bold; }" +
            "    .content { padding: 30px; line-height: 1.6; }" +
            "    .key-box { background-color: #eff6ff; border: 1px dashed #bfdbfe; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0; font-family: monospace; font-size: 20px; font-weight: bold; color: #1e40af; letter-spacing: 1px; }" +
            "    .invoice-table { width: 100%%; border-collapse: collapse; margin-top: 20px; }" +
            "    .invoice-table th { text-align: left; padding: 10px; border-bottom: 2px solid #f3f4f6; color: #6b7280; font-size: 12px; text-transform: uppercase; }" +
            "    .invoice-table td { padding: 12px 10px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }" +
            "    .total-row { font-weight: bold; font-size: 16px; color: #111827; }" +
            "    .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }" +
            "    .btn { display: inline-block; padding: 12px 24px; background-color: %s; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }" +
            "  </style>" +
            "</head>" +
            "<body>" +
            "  <div class='wrapper'>" +
            "    <div class='header'>" +
            "      <h1>Thank you for your purchase!</h1>" +
            "      <p style='margin: 5px 0 0 0; opacity: 0.9;'>Order Ref: %s</p>" +
            "    </div>" +
            "    <div class='content'>" +
            "      <p>Dear Customer,</p>" +
            "      <p>Thank you for purchasing <strong>%s - %s Plan</strong>. Your payment of <strong>%s %.2f</strong> was successfully processed. Your license details and transaction invoice are provided below.</p>" +
            "      " +
            "      %s" + // Insert Billing Section
            "      " +
            "      <h3 style='color: #111827; margin-top: 25px;'>🔑 Your Activation Key</h3>" +
            "      <div class='key-box'>%s</div>" +
            "      <p style='font-size: 13px; color: #4b5563;'>To activate your software, open the settings page in your desktop application, click 'Activate License', and enter the activation key above.</p>" +
            "      " +
            "      <h3 style='color: #111827; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;'>📄 Transaction Invoice</h3>" +
            "      <table class='invoice-table'>" +
            "        <thead>" +
            "          <tr>" +
            "            <th>Item Description</th>" +
            "            <th style='text-align: right;'>Price</th>" +
            "          </tr>" +
            "        </thead>" +
            "        <tbody>" +
            "          <tr>" +
            "            <td>%s - %s Plan<br/><span style='font-size:12px;color:#9ca3af;'>Desktop Application License</span></td>" +
            "            <td style='text-align: right;'>%s %.2f</td>" +
            "          </tr>" +
            "          <tr>" +
            "            <td style='text-align: right; padding-top: 10px; color: #6b7280;'>Subtotal</td>" +
            "            <td style='text-align: right; padding-top: 10px; color: #111827;'>%s %.2f</td>" +
            "          </tr>" +
            "          <tr>" +
            "            <td style='text-align: right; color: #6b7280;'>Tax (%.1f%%)</td>" +
            "            <td style='text-align: right; color: #111827;'>%s %.2f</td>" +
            "          </tr>" +
            "          <tr class='total-row'>" +
            "            <td style='text-align: right; padding-top: 15px; border-top: 2px solid #e5e7eb;'>Total Paid</td>" +
            "            <td style='text-align: right; padding-top: 15px; border-top: 2px solid #e5e7eb; color: %s;'>%s %.2f</td>" +
            "          </tr>" +
            "        </tbody>" +
            "      </table>" +
            "      " +
            "      <div style='text-align: center; margin-top: 30px;' class='print:hidden'>" +
            "        <p>Need the installer? Download it anytime using the link below:</p>" +
            "        <a href='%s/download' class='btn' style='color:#ffffff;'>Download Software</a>" +
            "      </div>" +
            "    </div>" +
            "    <div class='footer'>" +
            "      <p>This email was sent from an automated system. Please do not reply directly.</p>" +
            "      <p>For customer support or inquiries, contact us at <a href='mailto:%s' style='color: %s;'>%s</a>.</p>" +
            "      <p>&copy; %d %s. All rights reserved.</p>" +
            "    </div>" +
            "  </div>" +
            "</body>" +
            "</html>",
            primaryColor, primaryColor, order.getOrderId(), productName, tier, currency, amount,
            billingSectionHtml, key, 
            productName, tier, currency, (amount - order.getTaxAmount()), currency, (amount - order.getTaxAmount()),
            (order.getTaxRate() * 100), currency, order.getTaxAmount(),
            primaryColor, currency, amount, 
            settingOpt.map(SiteSetting::getUrl).orElse("http://localhost:3001"),
            supportEmail, primaryColor, supportEmail, java.time.Year.now().getValue(), siteName
        );

        // Send Email
        if (mailSender == null) {
            log.warn("=== [SIMULATED EMAIL SENDER] ===");
            log.warn("To: {}", toEmail);
            log.warn("Subject: {}", subject);
            if (pdfBytes != null) {
                log.warn("Attached PDF invoice size: {} bytes", pdfBytes.length);
            }
            log.warn("SMTP configuration not completed. Email body logged below:");
            log.info("\n{}", htmlBody);
            log.warn("==================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            helper.setFrom(supportEmail, siteName);
            if (pdfBytes != null) {
                helper.addAttachment("invoice-" + order.getOrderId() + ".pdf", 
                    new org.springframework.core.io.ByteArrayResource(pdfBytes), "application/pdf");
            }
            mailSender.send(message);
            log.info("Successfully sent invoice and license key email to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {} due to mail sender error. Logging html fallback.", toEmail, e);
            log.info("\n{}", htmlBody);
        }
    }

    public void sendLicenseActivationAlertEmail(LicenseKey license, String deviceName, int remainingSlots) {
        String siteId = license.getSiteId();
        String toEmail = license.getCustomerEmail();
        if (toEmail == null || toEmail.isBlank()) {
            return;
        }
        
        Optional<SiteSetting> settingOpt = siteSettingRepository.findBySiteId(siteId);
        String siteName = "Software Platform";
        String supportEmail = "support@datamigratepro.com";
        String primaryColor = "#2563eb";

        if (settingOpt.isPresent()) {
            SiteSetting setting = settingOpt.get();
            siteName = setting.getName();
            if (setting.getEmail() != null && !setting.getEmail().isBlank()) {
                supportEmail = setting.getEmail();
            }
            if (setting.getTheme() != null && setting.getTheme().getPrimaryColor() != null) {
                primaryColor = setting.getTheme().getPrimaryColor();
            }
        }

        String subject = String.format("ℹ️ Device Activated: %d seats remaining for %s", remainingSlots, license.getPricingTierName());

        // Mask activation key for security
        String rawKey = license.getActivationKey();
        String maskedKey = rawKey != null && rawKey.length() > 10
                ? rawKey.substring(0, 8) + "-XXXX-XXXX-" + rawKey.substring(rawKey.length() - 4)
                : rawKey;

        int totalSeats = license.getActivations() != null ? license.getActivations().size() + remainingSlots : remainingSlots + 1;
        int activeSeats = license.getActivations() != null ? license.getActivations().size() : 1;

        String htmlBody = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "  <style>" +
            "    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; margin: 0; padding: 0; background-color: #f9f9f9; }" +
            "    .wrapper { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }" +
            "    .header { background-color: %s; padding: 25px; text-align: center; color: #ffffff; }" +
            "    .header h1 { margin: 0; font-size: 20px; font-weight: bold; }" +
            "    .content { padding: 30px; line-height: 1.6; }" +
            "    .status-card { background-color: #f3f4f6; border-left: 4px solid %s; border-radius: 6px; padding: 15px; margin: 20px 0; }" +
            "    .details-table { width: 100%%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }" +
            "    .details-table td { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }" +
            "    .details-table td.label { color: #6b7280; font-weight: bold; width: 40%%; }" +
            "    .details-table td.value { color: #111827; text-align: right; }" +
            "    .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }" +
            "  </style>" +
            "</head>" +
            "<body>" +
            "  <div class='wrapper'>" +
            "    <div class='header'>" +
            "      <h1>New Device Activated</h1>" +
            "      <p style='margin: 5px 0 0 0; opacity: 0.9;'>License seat binding notification</p>" +
            "    </div>" +
            "    <div class='content'>" +
            "      <p>Dear Customer,</p>" +
            "      <p>We are writing to confirm that a new device was successfully bound to your license key. If this activation was performed by you, no action is required.</p>" +
            "      " +
            "      <div class='status-card'>" +
            "        <strong style='color: #111827; display: block; font-size: 14px;'>Seat Allocation Status:</strong>" +
            "        <p style='font-size: 18px; font-weight: bold; color: %s; margin: 8px 0 0 0;'>%d of %d seats remaining</p>" +
            "      </div>" +
            "      " +
            "      <h4 style='color: #111827; margin-bottom: 8px;'>Activation Details:</h4>" +
            "      <table class='details-table'>" +
            "        <tr>" +
            "          <td class='label'>Device Name</td>" +
            "          <td class='value'>%s</td>" +
            "        </tr>" +
            "        <tr>" +
            "          <td class='label'>Activation Key</td>" +
            "          <td class='value' style='font-family: monospace;'>%s</td>" +
            "        </tr>" +
            "        <tr>" +
            "          <td class='label'>Order ID</td>" +
            "          <td class='value' style='font-family: monospace;'>%s</td>" +
            "        </tr>" +
            "        <tr>" +
            "          <td class='label'>License Plan</td>" +
            "          <td class='value'>%s</td>" +
            "        </tr>" +
            "        <tr>" +
            "          <td class='label'>Active PC Count</td>" +
            "          <td class='value'>%d devices active</td>" +
            "        </tr>" +
            "      </table>" +
            "      " +
            "      <p style='margin-top: 25px; font-size: 12px; color: #6b7280;'>If you do not recognize this device or suspect unauthorized access to your license credentials, please contact support immediately to revoke bindings.</p>" +
            "    </div>" +
            "    <div class='footer'>" +
            "      <p>This email was sent from an automated system. Please do not reply directly.</p>" +
            "      <p>Support: <a href='mailto:%s' style='color: %s;'>%s</a></p>" +
            "      <p>&copy; %d %s. All rights reserved.</p>" +
            "    </div>" +
            "  </div>" +
            "</body>" +
            "</html>",
            primaryColor, primaryColor, primaryColor, remainingSlots, totalSeats,
            deviceName, maskedKey, license.getOrderId(), license.getPricingTierName(), activeSeats,
            supportEmail, primaryColor, supportEmail, java.time.Year.now().getValue(), siteName
        );

        if (mailSender == null) {
            log.warn("=== [SIMULATED EMAIL SENDER: LICENSE ACTIVATION ALERT] ===");
            log.warn("To: {}", toEmail);
            log.warn("Subject: {}", subject);
            log.info("\n{}", htmlBody);
            log.warn("==========================================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            helper.setFrom(supportEmail, siteName);
            mailSender.send(message);
            log.info("Successfully sent activation alert email to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send activation email alert to {}", toEmail, e);
        }
    }
}
