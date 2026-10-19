package com.staykart.booking.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.staykart.booking.entity.Booking;
import com.staykart.payment.entity.Payment;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Component
public class InvoicePdfGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final Locale INDIA_LOCALE = new Locale("en", "IN");

    private static final Color TEAL = new Color(13, 92, 117);
    private static final Color SAFFRON = new Color(224, 109, 20);
    private static final Color CHARCOAL = new Color(33, 37, 41);
    private static final Color LIGHT_GRAY = new Color(245, 247, 250);
    private static final Color BORDER_GRAY = new Color(222, 226, 230);

    public byte[] generateInvoice(Booking booking, Payment payment) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontBrand = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, TEAL);
            Font fontTagline = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, SAFFRON);
            Font fontHeading = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, TEAL);
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, CHARCOAL);
            Font fontRegular = FontFactory.getFont(FontFactory.HELVETICA, 9, CHARCOAL);
            Font fontFooter = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);

            // 1. Header Banner
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            PdfPCell leftHeader = new PdfPCell();
            leftHeader.setBorder(Rectangle.NO_BORDER);
            leftHeader.addElement(new Paragraph("StayKart", fontBrand));
            leftHeader.addElement(new Paragraph("Book Smart. Stay Easy.", fontTagline));
            headerTable.addCell(leftHeader);

            PdfPCell rightHeader = new PdfPCell();
            rightHeader.setBorder(Rectangle.NO_BORDER);
            rightHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph invTitle = new Paragraph("TAX INVOICE", fontHeading);
            invTitle.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(invTitle);

            Paragraph invCode = new Paragraph("Invoice #: INV-" + booking.getBookingCode(), fontRegular);
            invCode.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(invCode);

            Paragraph invDate = new Paragraph("Date: " + booking.getCreatedAt().format(DATE_FORMATTER), fontRegular);
            invDate.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(invDate);

            headerTable.addCell(rightHeader);
            document.add(headerTable);

            document.add(new Paragraph(" "));

            // 2. Guest and Stay Info
            PdfPTable detailsTable = new PdfPTable(2);
            detailsTable.setWidthPercentage(100);
            detailsTable.setWidths(new float[]{50, 50});

            // Guest card
            PdfPCell guestCell = new PdfPCell();
            guestCell.setBackgroundColor(LIGHT_GRAY);
            guestCell.setBorderColor(BORDER_GRAY);
            guestCell.setPadding(10);
            guestCell.addElement(new Paragraph("GUEST INFORMATION", fontHeading));
            guestCell.addElement(new Paragraph("Name: " + booking.getGuestName(), fontRegular));
            guestCell.addElement(new Paragraph("Mobile: " + booking.getGuestPhone(), fontRegular));
            guestCell.addElement(new Paragraph("Email: " + booking.getGuestEmail(), fontRegular));
            guestCell.addElement(new Paragraph("ID Proof: " + booking.getGuestIdType() + " (Ending in " + booking.getGuestIdLast4() + ")", fontRegular));
            detailsTable.addCell(guestCell);

            // Property card
            PdfPCell hotelCell = new PdfPCell();
            hotelCell.setBackgroundColor(LIGHT_GRAY);
            hotelCell.setBorderColor(BORDER_GRAY);
            hotelCell.setPadding(10);
            hotelCell.addElement(new Paragraph("HOTEL & STAY DETAILS", fontHeading));
            hotelCell.addElement(new Paragraph("Hotel: " + booking.getRoom().getProperty().getName(), fontRegular));
            hotelCell.addElement(new Paragraph("Address: " + booking.getRoom().getProperty().getAddressLine() + ", " + booking.getRoom().getProperty().getCity(), fontRegular));
            hotelCell.addElement(new Paragraph("Room: " + booking.getRoom().getRoomNumber() + " (" + booking.getRoom().getRoomType().getName() + ")", fontRegular));
            hotelCell.addElement(new Paragraph("Check-in: " + booking.getCheckIn().format(DATE_FORMATTER) + " (" + booking.getRoom().getProperty().getCheckInTime() + ")", fontRegular));
            hotelCell.addElement(new Paragraph("Check-out: " + booking.getCheckOut().format(DATE_FORMATTER) + " (" + booking.getRoom().getProperty().getCheckOutTime() + ")", fontRegular));
            detailsTable.addCell(hotelCell);

            document.add(detailsTable);
            document.add(new Paragraph(" "));

            // 3. Billing Table
            PdfPTable billTable = new PdfPTable(2);
            billTable.setWidthPercentage(100);
            billTable.setWidths(new float[]{70, 30});

            addBillHeaderCell(billTable, "Description", fontBold);
            addBillHeaderCell(billTable, "Amount (INR)", fontBold);

            addBillRow(billTable, "Gross Room Tariff", formatInr(booking.getTotalBaseInr()), fontRegular);

            if (booking.getTotalDiscountInr().compareTo(BigDecimal.ZERO) > 0) {
                addBillRow(billTable, "Special / Long-Stay Discount", "- " + formatInr(booking.getTotalDiscountInr()), fontRegular);
            }

            addBillRow(billTable, "Net Taxable Amount", formatInr(booking.getTaxableAmountInr()), fontBold);
            addBillRow(billTable, "Central GST (CGST - 50% split)", formatInr(booking.getCgstInr()), fontRegular);
            addBillRow(billTable, "State GST (SGST - 50% split)", formatInr(booking.getSgstInr()), fontRegular);

            // Total Cell
            PdfPCell totalDescCell = new PdfPCell(new Phrase("Total Paid (INR)", fontHeading));
            totalDescCell.setBackgroundColor(LIGHT_GRAY);
            totalDescCell.setPadding(8);
            totalDescCell.setBorderColor(BORDER_GRAY);
            billTable.addCell(totalDescCell);

            PdfPCell totalValCell = new PdfPCell(new Phrase(formatInr(booking.getTotalAmountInr()), fontHeading));
            totalValCell.setBackgroundColor(LIGHT_GRAY);
            totalValCell.setPadding(8);
            totalValCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalValCell.setBorderColor(BORDER_GRAY);
            billTable.addCell(totalValCell);

            document.add(billTable);

            // 4. Payment Info & Cancellation info
            document.add(new Paragraph(" "));
            Paragraph paymentPara = new Paragraph();
            if (payment != null) {
                paymentPara.add(new Phrase("Payment Mode: " + payment.getPaymentMode() + " | Transaction Ref: " + payment.getTransactionId() + "\n", fontRegular));
            } else {
                paymentPara.add(new Phrase("Booking Status: " + booking.getStatus() + "\n", fontRegular));
            }

            if (booking.getRefundAmountInr().compareTo(BigDecimal.ZERO) > 0) {
                paymentPara.add(new Phrase("Refund Processed: " + formatInr(booking.getRefundAmountInr()) + " (" + booking.getRefundReason() + ")\n", fontBold));
            }
            document.add(paymentPara);

            // 5. Footer Notes
            document.add(new Paragraph(" "));
            Paragraph footer = new Paragraph(
                "This is a system-generated electronic GST invoice for booking " + booking.getBookingCode() + " and does not require a physical signature.\n" +
                "StayKart Hospitality Pvt. Ltd. | CIN: U55101DL2026PTC123456 | support@staykart.in | Toll-Free: 1800-202-6000",
                fontFooter
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate PDF invoice", e);
        }
    }

    private void addBillHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(LIGHT_GRAY);
        cell.setPadding(6);
        cell.setBorderColor(BORDER_GRAY);
        table.addCell(cell);
    }

    private void addBillRow(PdfPTable table, String desc, String val, Font font) {
        PdfPCell c1 = new PdfPCell(new Phrase(desc, font));
        c1.setPadding(6);
        c1.setBorderColor(BORDER_GRAY);
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Phrase(val, font));
        c2.setPadding(6);
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        c2.setBorderColor(BORDER_GRAY);
        table.addCell(c2);
    }

    private String formatInr(BigDecimal amount) {
        if (amount == null) return "₹0.00";
        NumberFormat nf = NumberFormat.getCurrencyInstance(INDIA_LOCALE);
        return nf.format(amount).replace("INR", "₹").trim();
    }
}
