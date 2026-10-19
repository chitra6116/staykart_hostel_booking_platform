-- Flyway Migration V1: Initial Schema for StayKart

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('GUEST', 'ADMIN')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    lockout_until TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    check_in_time VARCHAR(10) NOT NULL DEFAULT '14:00',
    check_out_time VARCHAR(10) NOT NULL DEFAULT '11:00',
    house_rules TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Room Types table
CREATE TABLE room_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    max_guests INT NOT NULL,
    base_price_inr NUMERIC(12,2) NOT NULL
);

-- Rooms table
CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_type_id BIGINT NOT NULL REFERENCES room_types(id),
    room_number VARCHAR(20) NOT NULL,
    floor INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_property_room_number UNIQUE (property_id, room_number)
);

-- Amenities table
CREATE TABLE amenities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    icon_name VARCHAR(50) NOT NULL
);

-- Property Amenities join table
CREATE TABLE property_amenities (
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id BIGINT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, amenity_id)
);

-- Room Amenities join table
CREATE TABLE room_amenities (
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    amenity_id BIGINT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (room_id, amenity_id)
);

-- GST Slabs table (configurable tax slabs)
CREATE TABLE gst_slabs (
    id BIGSERIAL PRIMARY KEY,
    min_tariff NUMERIC(12,2) NOT NULL,
    max_tariff NUMERIC(12,2) NULL,
    gst_percentage NUMERIC(5,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Pricing Rules table
CREATE TABLE pricing_rules (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('SEASONAL', 'FESTIVAL', 'WEEKEND', 'LENGTH_OF_STAY')),
    property_id BIGINT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_type_id BIGINT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    start_date DATE NULL,
    end_date DATE NULL,
    multiplier NUMERIC(5,2) NULL,
    min_nights INT NULL,
    discount_percentage NUMERIC(5,2) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_code VARCHAR(30) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    room_id BIGINT NOT NULL REFERENCES rooms(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests_count INT NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'EXPIRED')),
    total_base_inr NUMERIC(12,2) NOT NULL,
    total_discount_inr NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    taxable_amount_inr NUMERIC(12,2) NOT NULL,
    cgst_inr NUMERIC(12,2) NOT NULL,
    sgst_inr NUMERIC(12,2) NOT NULL,
    total_amount_inr NUMERIC(12,2) NOT NULL,
    refund_amount_inr NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    refund_status VARCHAR(30) NULL,
    refund_reason TEXT NULL,
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(150) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    guest_id_type VARCHAR(50) NOT NULL CHECK (guest_id_type IN ('AADHAAR', 'PASSPORT', 'DRIVING_LICENCE', 'VOTER_ID')),
    guest_id_last4 VARCHAR(4) NOT NULL,
    special_requests TEXT NULL,
    idempotency_key VARCHAR(100) NULL UNIQUE,
    payment_deadline TIMESTAMP WITH TIME ZONE NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_checkin_checkout CHECK (check_out > check_in)
);

-- Database-level double-booking prevention using PostgreSQL EXCLUDE constraint
ALTER TABLE bookings ADD CONSTRAINT exclude_overlapping_bookings
EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
)
WHERE (status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN'));

-- Room Maintenance table
CREATE TABLE room_maintenance (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_maintenance_dates CHECK (end_date > start_date)
);

ALTER TABLE room_maintenance ADD CONSTRAINT exclude_overlapping_maintenance
EXCLUDE USING gist (
    room_id WITH =,
    daterange(start_date, end_date, '[)') WITH &&
);

-- Payments table
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount_inr NUMERIC(12,2) NOT NULL,
    payment_mode VARCHAR(30) NOT NULL CHECK (payment_mode IN ('UPI', 'CARD', 'NET_BANKING')),
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'REFUNDED')),
    upi_id VARCHAR(100) NULL,
    card_last4 VARCHAR(4) NULL,
    bank_name VARCHAR(100) NULL,
    error_message TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Images table
CREATE TABLE images (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id BIGINT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    file_path VARCHAR(255) NOT NULL,
    thumb_path VARCHAR(255) NOT NULL,
    card_path VARCHAR(255) NOT NULL,
    large_path VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_by BIGINT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_image_target CHECK (
        (property_id IS NOT NULL AND room_id IS NULL) OR
        (property_id IS NULL AND room_id IS NOT NULL)
    )
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_is_active ON properties(is_active);
CREATE INDEX idx_rooms_property_id ON rooms(property_id);
CREATE INDEX idx_rooms_room_type_id ON rooms(room_type_id);
CREATE INDEX idx_rooms_is_active ON rooms(is_active);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_room_status ON bookings(room_id, status);
CREATE INDEX idx_bookings_checkin_checkout ON bookings(check_in, check_out);
CREATE INDEX idx_images_property_id ON images(property_id);
CREATE INDEX idx_images_room_id ON images(room_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_maintenance_room_dates ON room_maintenance(room_id, start_date, end_date);
