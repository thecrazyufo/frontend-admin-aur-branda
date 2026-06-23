package com.datamigratepro.service;

import com.datamigratepro.entity.Order;
import com.datamigratepro.entity.SiteSetting;
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
            "          <tr class='total-row'>" +
            "            <td style='text-align: right; padding-top: 20px;'>Total Paid</td>" +
            "            <td style='text-align: right; padding-top: 20px; color: %s;'>%s %.2f</td>" +
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
            primaryColor, primaryColor, order.getOrderId(), productName, tier, currency, amount, key, 
            productName, tier, currency, amount, primaryColor, currency, amount, 
            settingOpt.map(SiteSetting::getUrl).orElse("http://localhost:3001"),
            supportEmail, primaryColor, supportEmail, java.time.Year.now().getValue(), siteName
        );

        // Send Email
        if (mailSender == null) {
            log.warn("=== [SIMULATED EMAIL SENDER] ===");
            log.warn("To: {}", toEmail);
            log.warn("Subject: {}", subject);
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
            mailSender.send(message);
            log.info("Successfully sent invoice and license key email to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {} due to mail sender error. Logging html fallback.", toEmail, e);
            log.info("\n{}", htmlBody);
        }
    }
}
