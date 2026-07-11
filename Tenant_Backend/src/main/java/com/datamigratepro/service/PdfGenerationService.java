package com.datamigratepro.service;

import com.datamigratepro.entity.Order;
import com.datamigratepro.entity.SiteSetting;
import com.datamigratepro.repository.SiteSettingRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class PdfGenerationService {

    @Autowired
    private SiteSettingRepository siteSettingRepository;

    public byte[] generateInvoicePdf(Order order) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fetch site setting for brand information
            Optional<SiteSetting> settingOpt = siteSettingRepository.findBySiteId(order.getSiteId());
            String brandName = settingOpt.map(SiteSetting::getName).orElse(order.getSiteId().toUpperCase());
            String supportEmail = settingOpt.map(SiteSetting::getEmail).orElse("support@" + order.getSiteId() + ".com");
            String brandAddress = settingOpt.map(SiteSetting::getAddress).orElse("United States");

            // Fonts
            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(17, 24, 39));
            Font fontHeaderLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(107, 114, 128));
            Font fontHeaderVal = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(17, 24, 39));
            Font fontBodyBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(55, 65, 81));
            Font fontBodyNormal = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(75, 85, 99));
            Font fontTableHead = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(107, 114, 128));
            Font fontTotalLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(17, 24, 39));
            Font fontTotalVal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(99, 102, 241));
            Font fontFooter = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, new Color(156, 163, 175));

            // 1. Header Table
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            // Logo & Brand
            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.addElement(new Paragraph(brandName, fontTitle));
            logoCell.addElement(new Paragraph("Secure Transactions & Licensing", fontBodyNormal));
            headerTable.addCell(logoCell);

            // Invoice Title & Info
            PdfPCell infoCell = new PdfPCell();
            infoCell.setBorder(Rectangle.NO_BORDER);
            infoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            
            String invoiceNum = "INV-" + order.getOrderId().substring(0, Math.min(order.getOrderId().length(), 8)).toUpperCase();
            
            Paragraph invTitle = new Paragraph("INVOICE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(99, 102, 241)));
            invTitle.setAlignment(Element.ALIGN_RIGHT);
            infoCell.addElement(invTitle);
            
            Paragraph pNum = new Paragraph(invoiceNum, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(55, 65, 81)));
            pNum.setAlignment(Element.ALIGN_RIGHT);
            infoCell.addElement(pNum);

            String formattedDate = order.getCreatedAt() != null 
                    ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
                    : "";
            Paragraph pDate = new Paragraph("Date: " + formattedDate, fontHeaderVal);
            pDate.setAlignment(Element.ALIGN_RIGHT);
            infoCell.addElement(pDate);

            headerTable.addCell(infoCell);
            document.add(headerTable);

            // Horizontal Line
            document.add(new Paragraph(" "));
            
            // 2. Billing details table
            PdfPTable addressTable = new PdfPTable(2);
            addressTable.setWidthPercentage(100);
            addressTable.setWidths(new float[]{50, 50});

            // Billed From
            PdfPCell fromCell = new PdfPCell();
            fromCell.setBorder(Rectangle.NO_BORDER);
            fromCell.addElement(new Paragraph("BILLED FROM:", fontHeaderLabel));
            fromCell.addElement(new Paragraph(brandName, fontBodyBold));
            fromCell.addElement(new Paragraph(supportEmail, fontBodyNormal));
            fromCell.addElement(new Paragraph(brandAddress, fontBodyNormal));
            addressTable.addCell(fromCell);

            // Billed To
            PdfPCell toCell = new PdfPCell();
            toCell.setBorder(Rectangle.NO_BORDER);
            toCell.addElement(new Paragraph("BILLED TO:", fontHeaderLabel));
            
            String bName = order.getBillingName() != null && !order.getBillingName().isBlank()
                    ? order.getBillingName() : order.getCustomerEmail();
            toCell.addElement(new Paragraph(bName, fontBodyBold));
            
            if (order.getBillingCompany() != null && !order.getBillingCompany().isBlank()) {
                toCell.addElement(new Paragraph(order.getBillingCompany(), fontBodyNormal));
            }
            if (order.getBillingAddress() != null && !order.getBillingAddress().isBlank()) {
                toCell.addElement(new Paragraph(order.getBillingAddress(), fontBodyNormal));
            }
            String cityStateZip = "";
            if (order.getBillingCity() != null) cityStateZip += order.getBillingCity();
            if (order.getBillingState() != null) cityStateZip += (cityStateZip.isEmpty() ? "" : ", ") + order.getBillingState();
            if (order.getBillingZip() != null) cityStateZip += " " + order.getBillingZip();
            if (!cityStateZip.isBlank()) {
                toCell.addElement(new Paragraph(cityStateZip, fontBodyNormal));
            }
            if (order.getBillingCountry() != null && !order.getBillingCountry().isBlank()) {
                toCell.addElement(new Paragraph(order.getBillingCountry().toUpperCase(), fontBodyNormal));
            }
            if (order.getTaxId() != null && !order.getTaxId().isBlank()) {
                toCell.addElement(new Paragraph("Tax ID: " + order.getTaxId(), fontBodyNormal));
            }
            addressTable.addCell(toCell);
            document.add(addressTable);

            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // 3. Itemized invoice table
            PdfPTable itemTable = new PdfPTable(2);
            itemTable.setWidthPercentage(100);
            itemTable.setWidths(new float[]{75, 25});
            
            // Header Row
            PdfPCell descHeader = new PdfPCell(new Phrase("ITEM DESCRIPTION", fontTableHead));
            descHeader.setBackgroundColor(new Color(243, 244, 246));
            descHeader.setPadding(8);
            descHeader.setBorderWidthBottom(1);
            descHeader.setBorderColor(new Color(229, 231, 235));
            itemTable.addCell(descHeader);

            PdfPCell amtHeader = new PdfPCell(new Phrase("AMOUNT", fontTableHead));
            amtHeader.setBackgroundColor(new Color(243, 244, 246));
            amtHeader.setPadding(8);
            amtHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
            amtHeader.setBorderWidthBottom(1);
            amtHeader.setBorderColor(new Color(229, 231, 235));
            itemTable.addCell(amtHeader);

            // Item Row
            String description = order.getProductName() + " - " + order.getPricingTierName() + " Plan\n(Software Activation License)";
            PdfPCell itemDesc = new PdfPCell(new Phrase(description, fontBodyNormal));
            itemDesc.setPadding(10);
            itemDesc.setBorderWidthBottom(1);
            itemDesc.setBorderColor(new Color(243, 244, 246));
            itemTable.addCell(itemDesc);

            double subtotalAmount = order.getAmount() - order.getTaxAmount();
            PdfPCell itemAmt = new PdfPCell(new Phrase(String.format("$%.2f", subtotalAmount), fontBodyNormal));
            itemAmt.setPadding(10);
            itemAmt.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemAmt.setBorderWidthBottom(1);
            itemAmt.setBorderColor(new Color(243, 244, 246));
            itemTable.addCell(itemAmt);

            // Subtotal Row
            PdfPCell subLabel = new PdfPCell(new Phrase("Subtotal", fontBodyNormal));
            subLabel.setPadding(6);
            subLabel.setBorder(Rectangle.NO_BORDER);
            subLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemTable.addCell(subLabel);

            PdfPCell subVal = new PdfPCell(new Phrase(String.format("$%.2f", subtotalAmount), fontBodyNormal));
            subVal.setPadding(6);
            subVal.setBorder(Rectangle.NO_BORDER);
            subVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemTable.addCell(subVal);

            // Tax Row
            double taxRatePercent = order.getTaxRate() * 100.0;
            PdfPCell taxLabel = new PdfPCell(new Phrase(String.format("Sales Tax / VAT (%.1f%%)", taxRatePercent), fontBodyNormal));
            taxLabel.setPadding(6);
            taxLabel.setBorder(Rectangle.NO_BORDER);
            taxLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemTable.addCell(taxLabel);

            PdfPCell taxVal = new PdfPCell(new Phrase(String.format("$%.2f", order.getTaxAmount()), fontBodyNormal));
            taxVal.setPadding(6);
            taxVal.setBorder(Rectangle.NO_BORDER);
            taxVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemTable.addCell(taxVal);

            // Total Paid Row
            PdfPCell totalLabel = new PdfPCell(new Phrase("Total Paid", fontTotalLabel));
            totalLabel.setPadding(10);
            totalLabel.setBorderWidthTop(1);
            totalLabel.setBorderColor(new Color(229, 231, 235));
            totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemTable.addCell(totalLabel);

            PdfPCell totalVal = new PdfPCell(new Phrase(String.format("$%.2f", order.getAmount()), fontTotalVal));
            totalVal.setPadding(10);
            totalVal.setBorderWidthTop(1);
            totalVal.setBorderColor(new Color(229, 231, 235));
            totalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            itemTable.addCell(totalVal);

            itemTable.setSpacingAfter(15);
            document.add(itemTable);

            // 4. Verification Details
            PdfPTable verifyTable = new PdfPTable(1);
            verifyTable.setWidthPercentage(100);
            PdfPCell vCell = new PdfPCell();
            vCell.setBackgroundColor(new Color(239, 246, 255));
            vCell.setBorderColor(new Color(191, 219, 254));
            vCell.setPadding(12);
            vCell.addElement(new Paragraph("LICENSE KEY DETAILS:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, new Color(30, 64, 175))));
            
            Paragraph kP = new Paragraph(order.getActivationKey(), FontFactory.getFont(FontFactory.COURIER_BOLD, 12, new Color(30, 58, 138)));
            kP.setSpacingBefore(4);
            vCell.addElement(kP);
            
            vCell.addElement(new Paragraph("Order Status: PAID | Transaction Method: " + order.getPaymentMethod(), FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(30, 64, 175))));
            verifyTable.addCell(vCell);
            document.add(verifyTable);

            // 5. Footer Page Message
            document.add(new Paragraph(" "));
            Paragraph footerPara = new Paragraph("Thank you for your purchase! This transaction is secure and subject to the Terms of Service of the respective desktop software licensing model.", fontFooter);
            footerPara.setAlignment(Element.ALIGN_CENTER);
            document.add(footerPara);

        } catch (Exception e) {
            System.err.println("Error creating PDF invoice: " + e.getMessage());
        } finally {
            document.close();
        }

        return out.toByteArray();
    }
}
