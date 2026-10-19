 0# StayKart Interview Demo Script (5-Minute Walkthrough)

This guide provides a structured, step-by-step walkthrough for demonstrating StayKart during campus placement interviews and project evaluations.

---

## 1. Introduction (0:00 – 0:45)

**What to Say:**
> "Good morning / afternoon. Today I am presenting **StayKart**, a full-stack hotel booking platform designed specifically for the Indian hospitality market.
> Most clone projects hardcode USD pricing and ignore domain complexities like Indian GST slabs, Aadhaar verification regulations, and room double-booking under concurrent traffic.
> In StayKart, I implemented the complete lifecycle: dynamic GST calculation with CGST/SGST itemization, pessimistic database locking to eliminate race conditions, an admin room occupancy calendar, and offline image serving with WebP optimization."

**Action:**
- Show the homepage at `http://localhost:5173`.
- Highlight the brand identity: deep teal and saffron palette, tagline *"Book Smart. Stay Easy."*, and authentic local photography for Indian destinations (Jaipur, Goa, Udaipur, Manali, Munnar, etc.).

---

## 2. Guest Search & Date Selection (0:45 – 1:30)

**What to Say:**
> "Let's begin as a traveler searching for a stay in Jaipur."

**Action:**
1. Select **Jaipur** from the destination dropdown.
2. Select upcoming check-in and check-out dates.
3. Click **Search**.
4. In the search results, demonstrate the **Price Range Slider** (in ₹), the room category filter (*Heritage Suite*, *Deluxe Room*), and amenities checklist.
5. Click **View & Reserve** on the *Rajputana Heritage Haveli*.

**Key Points to Mention to the Interviewer:**
- Half-open date semantics: check-in is inclusive, check-out is exclusive `[checkIn, checkOut)`.
- A guest departing on the 10th does not conflict with a guest arriving on the 10th.
- Disabled dates are automatically loaded from `/api/rooms/{id}/disabled-dates`.

---

## 3. Dynamic Indian GST Breakdown & Checkout (1:30 – 2:30)

**What to Say:**
> "Here is our live pricing breakdown. Under Government of India regulations, room GST is tied to the per-night tariff slab: 0% below ₹1,000, 5% between ₹1,001 and ₹7,500, and 18% above ₹7,500. This is loaded dynamically from our database config rather than hardcoded."

**Action:**
1. On the room detail page, toggle dates and observe the live `PriceBreakdownWidget`:
   - Highlight the per-night tariff and the automatic **50/50 split** between **CGST** and **SGST**.
   - Show how weekend dates (Friday & Saturday) automatically apply a 1.15x surcharge, and stays of 7+ nights show length-of-stay savings.
2. Click **Reserve Room Now**.
3. On the Checkout page, demonstrate:
   - Primary Guest Details: Indian mobile validation (`+91` format).
   - Indian Government ID verification: Aadhaar / Passport / Driving Licence / Voter ID. Note that only the ID type and last 4 digits are recorded to adhere to data privacy standards.
4. Click **Proceed to Payment**.
5. In the Payment Modal, choose **UPI** (enter a virtual payment address like `guest@okhdfcbank`) and click **Pay**.
6. On the Confirmation page, point out:
   - Unique reference code formatted as `SK-2026-XXXXXX`.
   - Click **Download Invoice PDF** to open the official OpenPDF-generated GST tax invoice showing the itemized CGST and SGST schedule.

---

## 4. Concurrency & Double-Booking Prevention (2:30 – 3:15)

**What to Say:**
> "One of the most critical engineering challenges in hospitality systems is preventing two guests from booking the same room for overlapping dates during simultaneous checkouts."

**Action / Code Reference:**
1. Open `BookingConcurrencyTest.java` in the backend codebase.
2. Explain the mechanism:
   - **PostgreSQL GiST Range Exclusion:** A database-level constraint `EXCLUDE USING gist (room_id WITH =, daterange(check_in, check_out, '[)') WITH &&)` physically prevents double-booking.
   - **Pessimistic Row Locking:** `RoomRepository.findByIdWithLock(roomId)` uses `@Lock(LockModeType.PESSIMISTIC_WRITE)` to lock the room entity during transaction validation.
3. Point out test results:
   - 20 concurrent threads attempt to reserve the exact same room for the exact same dates simultaneously.
   - Exactly **1 thread succeeds**, while 19 receive safe conflict exceptions.

---

## 5. Cancellation & Tiered Refund Policy (3:15 – 4:00)

**What to Say:**
> "StayKart implements a transparent cancellation policy calculated down to the hour: 100% refund before 48 hours, 50% between 24 and 48 hours, and 0% within 24 hours."

**Action:**
1. Click **My Bookings** in the navigation bar.
2. On an upcoming confirmed trip, click **Cancel**.
3. Point out the live **Refund Preview Calculation**:
   - The dialog calls `/api/bookings/{id}/refund-preview` and displays the exact percentage and refund amount before the guest commits.
4. Click **Confirm Cancellation**. The booking updates to `CANCELLED` and the inventory is released immediately for other travelers.

---

## 6. Admin Console & Operations (4:00 – 4:45)

**What to Say:**
> "Now let's switch to the operations console used by hotel managers and administrators."

**Action:**
1. Log in with `admin@staykart.in` / `[Configured in .env or ask the author]`.
2. **Operations Dashboard:**
   - Review 30-day revenue trends, daily occupancy percentages, and city-wise distribution powered by Recharts.
3. **Occupancy Grid (`/admin/calendar`):**
   - Show the room matrix: rooms as rows, dates as columns, colored bars by status (`CONFIRMED`, `CHECKED_IN`, `MAINTENANCE`).
   - Click any booking bar to inspect guest details and arrival timestamps.
4. **Photo Gallery (`/admin/photos`):**
   - Demonstrate drag-and-drop reordering with `@dnd-kit`.
   - Show the star cover photo selector and multi-file WebP upload.
5. **Pricing Rules (`/admin/pricing`):**
   - Show the Bulk Pricing tool used to apply festival multipliers (e.g. Diwali and New Year surge) across multiple hotels simultaneously.

---

## 7. Conclusion & Architecture Summary (4:45 – 5:00)

**Summary Points:**
- **Full Stack:** Spring Boot 3.3.0 (Java 17) + PostgreSQL 16 + React 18 (Vite + Tailwind CSS).
- **Security:** JWT authentication with access token in memory, refresh token rotation in HttpOnly cookie, and Bucket4j rate limiting.
- **Reliability:** 35 passing backend unit/concurrency tests, 8 frontend tests, 100% locally verified WebP assets with zero broken images.
- **Code Style:** Clean domain naming, no placeholder code, no TODOs, and Indian compliance built into every layer.
