-- Flyway Migration V2: Indian Seed Data for StayKart

-- 1. Users (1 Admin, 5 Guests)
INSERT INTO users (id, full_name, email, phone, password_hash, role, enabled, failed_login_attempts) VALUES
(1, 'StayKart Administrator', 'admin@staykart.in', '+919800000000', '$2a$10$bYSHmcpVeP2B8pns2AU8cOY7kXBAMDsY3RA527jRUc8bgxng9R5ei', 'ADMIN', TRUE, 0),
(2, 'Aarav Sharma', 'aarav.sharma@example.in', '+919876543210', '$2a$10$U3uJ5sms9yRrtXctey3RVOebHHziBfQTKgd9ciaLyE40BX2KXrpAm', 'GUEST', TRUE, 0),
(3, 'Priya Patel', 'priya.patel@example.in', '+919823456789', '$2a$10$U3uJ5sms9yRrtXctey3RVOebHHziBfQTKgd9ciaLyE40BX2KXrpAm', 'GUEST', TRUE, 0),
(4, 'Rohan Verma', 'rohan.verma@example.in', '+919712345678', '$2a$10$U3uJ5sms9yRrtXctey3RVOebHHziBfQTKgd9ciaLyE40BX2KXrpAm', 'GUEST', TRUE, 0),
(5, 'Ananya Iyer', 'ananya.iyer@example.in', '+919654321098', '$2a$10$U3uJ5sms9yRrtXctey3RVOebHHziBfQTKgd9ciaLyE40BX2KXrpAm', 'GUEST', TRUE, 0),
(6, 'Vikram Singh', 'vikram.singh@example.in', '+919988776655', '$2a$10$U3uJ5sms9yRrtXctey3RVOebHHziBfQTKgd9ciaLyE40BX2KXrpAm', 'GUEST', TRUE, 0);

SELECT setval('users_id_seq', 6);

-- 2. GST Slabs (Configurable Table)
-- 0% up to 1000, 5% from 1001 to 7500, 18% above 7500
INSERT INTO gst_slabs (id, min_tariff, max_tariff, gst_percentage, is_active) VALUES
(1, 0.00, 1000.00, 0.00, TRUE),
(2, 1000.01, 7500.00, 5.00, TRUE),
(3, 7500.01, NULL, 18.00, TRUE);

SELECT setval('gst_slabs_id_seq', 3);

-- 3. Room Types
INSERT INTO room_types (id, name, description, max_guests, base_price_inr) VALUES
(1, 'Standard Room', 'Compact, cozy accommodation ideal for solo travellers or couples. Equipped with queen bed, work desk, and ensuite bath.', 2, 1499.00),
(2, 'Deluxe Room', 'Spacious room with king bed, plush seating area, high-speed WiFi, and picturesque window views.', 3, 3499.00),
(3, 'Premium Room', 'Elevated luxury featuring private balcony, upgraded bath amenities, complimentary minibar, and premium bedding.', 3, 5999.00),
(4, 'Heritage Suite', 'Grand royal suite with separate living parlor, traditional Indian decor, carved wooden furnishings, and clawfoot bathtub.', 4, 11999.00),
(5, 'Family Room', 'Interconnected spacious room designed for families, featuring two queen beds, kids play nook, and dining area.', 5, 7499.00);

SELECT setval('room_types_id_seq', 5);

-- 4. Properties (8 Indian Destinations)
INSERT INTO properties (id, name, slug, description, address_line, city, state, pincode, check_in_time, check_out_time, house_rules, is_active) VALUES
(1, 'The Jaipur Heritage Haveli', 'haveli-heritage-jaipur', 'A restored 18th-century Rajasthani haveli in the Pink City featuring hand-painted jharokhas, tranquil courtyards, and rooftop dining with views of the Nahargarh Fort.', '14 Amber Road, Near Jal Mahal', 'Jaipur', 'Rajasthan', '302002', '14:00', '11:00', 'Valid photo ID required at check-in. Quiet hours after 10 PM. Non-smoking property indoors.', TRUE),
(2, 'Goa Palms Beach Resort', 'goa-palms-resort', 'Lush beachfront paradise nestled among swaying coconut palms on Candolim Beach, offering infinity pool, beach shack dining, and sunset sea views.', 'Plot 88, Candolim Beach Road', 'Goa', 'Goa', '403516', '14:00', '11:00', 'Swimming costume mandatory in pool. Outside food not permitted in pool area. Pets allowed with prior notice.', TRUE),
(3, 'Lake Palace View Stay', 'lake-palace-view-udaipur', 'Boutique heritage retreat perched on the banks of Lake Pichola. Enjoy serene water ripples, traditional Mewari hospitality, and sunset terraces.', '52 Lal Ghat, Behind Jagdish Temple', 'Udaipur', 'Rajasthan', '313001', '13:00', '10:30', 'Strictly vegetarian kitchen on premises. Heritage artifacts in courtyard must not be handled.', TRUE),
(4, 'Pine Crest Mountain Lodge', 'pine-crest-manali', 'Rustic Himalayan wooden chalet enveloped by deodar pines and snow-capped peaks in Old Manali, equipped with stone fireplaces and apple orchard gardens.', 'Log Huts Area, Old Manali', 'Manali', 'Himachal Pradesh', '175131', '12:00', '10:00', 'Heaters provided on request. Mountain footwear recommended. Bonfire permissible until 11 PM.', TRUE),
(5, 'Marine Drive Boutique Hotel', 'marine-drive-stay-mumbai', 'Chic art-deco sanctuary positioned along the Queen’s Necklace with panoramic Arabian Sea vistas, close to Nariman Point and Churchgate.', '78 Marine Drive, Churchgate', 'Mumbai', 'Maharashtra', '400020', '14:00', '12:00', 'Visitors permitted only in lobby area. Valet parking available on first-come basis.', TRUE),
(6, 'Lutyens Grand Suites', 'lutyens-grand-delhi', 'Stately colonial-style boutique hotel situated in Central Delhi, featuring sprawling lawns, high ceilings, verandahs, and fine dining.', '22 Barakhamba Road, Connaught Place', 'Delhi', 'Delhi', '110001', '14:00', '11:00', 'Commercial photography requires prior written approval. Silent zone maintained in courtyards.', TRUE),
(7, 'Tech Park Premium Suites', 'tech-park-suites-bengaluru', 'Contemporary executive hotel in the heart of Bengaluru’s IT corridor with ergonomic workspaces, 24/7 fitness centre, and express business services.', '102 Outer Ring Road, Bellandur', 'Bengaluru', 'Karnataka', '560103', '14:00', '12:00', 'High-speed business LAN ports available in all rooms. Late checkout subject to availability.', TRUE),
(8, 'Misty Hills Tea Estate Resort', 'misty-hills-resort-munnar', 'Eco-friendly hillside resort perched amidst emerald green rolling tea gardens in Munnar, with mist-kissed balconies, plantation walks, and birdwatching trails.', 'Post Box 12, Pothamedu Estate', 'Munnar', 'Kerala', '685612', '13:00', '11:00', 'Plastic-free property. Tea tasting sessions conducted daily at 4:30 PM. Trekking guides available.', TRUE);

SELECT setval('properties_id_seq', 8);

-- 5. Rooms (40 rooms: 5 per property)
INSERT INTO rooms (id, property_id, room_type_id, room_number, floor, is_active) VALUES
-- Jaipur Haveli (Property 1)
(1, 1, 1, '101', 1, TRUE),
(2, 1, 2, '102', 1, TRUE),
(3, 1, 2, '201', 2, TRUE),
(4, 1, 3, '202', 2, TRUE),
(5, 1, 4, '301', 3, TRUE),
-- Goa Palms (Property 2)
(6, 2, 1, '101', 1, TRUE),
(7, 2, 2, '102', 1, TRUE),
(8, 2, 2, '103', 1, TRUE),
(9, 2, 3, '201', 2, TRUE),
(10, 2, 5, '202', 2, TRUE),
-- Udaipur Lake View (Property 3)
(11, 3, 1, '101', 1, TRUE),
(12, 3, 2, '201', 2, TRUE),
(13, 3, 2, '202', 2, TRUE),
(14, 3, 3, '301', 3, TRUE),
(15, 3, 4, '302', 3, TRUE),
-- Manali Pine Crest (Property 4)
(16, 4, 1, '101', 1, TRUE),
(17, 4, 2, '102', 1, TRUE),
(18, 4, 2, '201', 2, TRUE),
(19, 4, 3, '202', 2, TRUE),
(20, 4, 5, '301', 3, TRUE),
-- Mumbai Marine Drive (Property 5)
(21, 5, 1, '101', 1, TRUE),
(22, 5, 2, '102', 1, TRUE),
(23, 5, 2, '201', 2, TRUE),
(24, 5, 3, '202', 2, TRUE),
(25, 5, 4, '301', 3, TRUE),
-- Delhi Lutyens (Property 6)
(26, 6, 1, '101', 1, TRUE),
(27, 6, 2, '102', 1, TRUE),
(28, 6, 2, '201', 2, TRUE),
(29, 6, 3, '202', 2, TRUE),
(30, 6, 4, '301', 3, TRUE),
-- Bengaluru Tech Park (Property 7)
(31, 7, 1, '101', 1, TRUE),
(32, 7, 2, '102', 1, TRUE),
(33, 7, 2, '201', 2, TRUE),
(34, 7, 3, '202', 2, TRUE),
(35, 7, 5, '203', 2, TRUE),
-- Munnar Misty Hills (Property 8)
(36, 8, 1, '101', 1, TRUE),
(37, 8, 2, '102', 1, TRUE),
(38, 8, 2, '201', 2, TRUE),
(39, 8, 3, '202', 2, TRUE),
(40, 8, 5, '301', 3, TRUE);

SELECT setval('rooms_id_seq', 40);

-- 6. Amenities
INSERT INTO amenities (id, name, category, icon_name) VALUES
(1, 'Free High-Speed WiFi', 'General', 'wifi'),
(2, 'Air Conditioning', 'Room', 'wind'),
(3, 'Complimentary Breakfast', 'Dining', 'coffee'),
(4, 'Swimming Pool', 'Leisure', 'waves'),
(5, 'Free Valet Parking', 'General', 'car'),
(6, 'Spa & Ayurvedic Massage', 'Leisure', 'sparkles'),
(7, 'Scenic Mountain View', 'Room', 'mountain'),
(8, 'Panoramic Lake View', 'Room', 'water'),
(9, 'EV Charging Station', 'General', 'zap'),
(10, '24/7 Room Service', 'Dining', 'clock'),
(11, 'Smart TV with OTT', 'Room', 'tv'),
(12, 'In-Room Tea/Coffee Maker', 'Room', 'cup-soda'),
(13, 'Fitness Centre', 'Leisure', 'dumbbell'),
(14, 'Daily Housekeeping', 'General', 'shield-check');

SELECT setval('amenities_id_seq', 14);

-- Property Amenities mapping
INSERT INTO property_amenities (property_id, amenity_id) VALUES
-- Jaipur Haveli
(1, 1), (1, 2), (1, 3), (1, 5), (1, 6), (1, 10), (1, 14),
-- Goa Palms
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 10), (2, 14),
-- Udaipur Lake Palace View
(3, 1), (3, 2), (3, 3), (3, 5), (3, 6), (3, 8), (3, 10), (3, 14),
-- Manali Pine Crest
(4, 1), (4, 3), (4, 5), (4, 7), (4, 9), (4, 10), (4, 14),
-- Mumbai Marine Drive
(5, 1), (5, 2), (5, 3), (5, 5), (5, 10), (5, 11), (5, 13), (5, 14),
-- Delhi Lutyens Grand
(6, 1), (6, 2), (6, 3), (6, 5), (6, 9), (6, 10), (6, 13), (6, 14),
-- Bengaluru Tech Park
(7, 1), (7, 2), (7, 3), (7, 5), (7, 9), (7, 10), (7, 11), (7, 13), (7, 14),
-- Munnar Misty Hills
(8, 1), (8, 3), (8, 5), (8, 7), (8, 10), (8, 12), (8, 14);

-- Room Amenities mapping
INSERT INTO room_amenities (room_id, amenity_id) VALUES
(1, 1), (1, 2), (1, 14),
(2, 1), (2, 2), (2, 11), (2, 12), (2, 14),
(3, 1), (3, 2), (3, 11), (3, 12), (3, 14),
(4, 1), (4, 2), (4, 11), (4, 12), (4, 14),
(5, 1), (5, 2), (5, 6), (5, 11), (5, 12), (5, 14),
(9, 1), (9, 2), (9, 11), (9, 12), (9, 14),
(14, 1), (14, 2), (14, 8), (14, 11), (14, 12), (14, 14),
(15, 1), (15, 2), (15, 8), (15, 11), (15, 12), (15, 14),
(19, 1), (19, 7), (19, 11), (19, 12), (19, 14),
(24, 1), (24, 2), (24, 11), (24, 12), (24, 14),
(29, 1), (29, 2), (29, 11), (29, 12), (29, 14),
(34, 1), (34, 2), (34, 11), (34, 12), (34, 14),
(39, 1), (39, 7), (39, 11), (39, 12), (39, 14);

-- 7. Pricing Rules (Festivals, Peak Seasons, Surcharges)
INSERT INTO pricing_rules (id, name, rule_type, property_id, room_type_id, start_date, end_date, multiplier, min_nights, discount_percentage, is_active) VALUES
(1, 'Diwali Festival Peak', 'FESTIVAL', NULL, NULL, '2026-10-25', '2026-11-05', 1.30, NULL, NULL, TRUE),
(2, 'Holi Celebration Surge', 'FESTIVAL', NULL, NULL, '2026-03-15', '2026-03-22', 1.25, NULL, NULL, TRUE),
(3, 'Goa & Coastal Winter Peak', 'SEASONAL', 2, NULL, '2026-12-15', '2027-01-10', 1.45, NULL, NULL, TRUE),
(4, 'Manali Snowfall & New Year Peak', 'SEASONAL', 4, NULL, '2026-12-15', '2027-01-10', 1.40, NULL, NULL, TRUE),
(5, 'New Year Celebrations Nationwide', 'FESTIVAL', NULL, NULL, '2026-12-28', '2027-01-03', 1.35, NULL, NULL, TRUE),
(6, 'Summer Mountain Getaway', 'SEASONAL', 8, NULL, '2026-05-01', '2026-06-20', 1.25, NULL, NULL, TRUE),
(7, 'Weekend Surcharge (Friday & Saturday)', 'WEEKEND', NULL, NULL, NULL, NULL, 1.15, NULL, NULL, TRUE),
(8, 'Long Stay Explorer Discount (7+ Nights)', 'LENGTH_OF_STAY', NULL, NULL, NULL, NULL, NULL, 7, 10.00, TRUE);

SELECT setval('pricing_rules_id_seq', 8);

-- 8. Seed Images Metadata (Serve through /media/**)
INSERT INTO images (id, property_id, room_id, file_path, thumb_path, card_path, large_path, alt_text, sort_order, is_cover) VALUES
-- Jaipur Haveli
(1, 1, NULL, 'properties/haveli-heritage-jaipur/exterior.webp', 'properties/haveli-heritage-jaipur/exterior_thumb.webp', 'properties/haveli-heritage-jaipur/exterior_card.webp', 'properties/haveli-heritage-jaipur/exterior_large.webp', 'Traditional Rajasthani stone facade and carved balconies of Jaipur Haveli', 0, TRUE),
(2, 1, NULL, 'properties/haveli-heritage-jaipur/lobby.webp', 'properties/haveli-heritage-jaipur/lobby_thumb.webp', 'properties/haveli-heritage-jaipur/lobby_card.webp', 'properties/haveli-heritage-jaipur/lobby_large.webp', 'Central open-air marble courtyard with fountain and brass lanterns', 1, FALSE),
(3, 1, NULL, 'properties/haveli-heritage-jaipur/rooftop.webp', 'properties/haveli-heritage-jaipur/rooftop_thumb.webp', 'properties/haveli-heritage-jaipur/rooftop_card.webp', 'properties/haveli-heritage-jaipur/rooftop_large.webp', 'Rooftop terrace restaurant overlooking the Pink City skyline', 2, FALSE),
(4, 1, NULL, 'properties/haveli-heritage-jaipur/garden.webp', 'properties/haveli-heritage-jaipur/garden_thumb.webp', 'properties/haveli-heritage-jaipur/garden_card.webp', 'properties/haveli-heritage-jaipur/garden_large.webp', 'Manicured Mughal-style garden with peacock motifs', 3, FALSE),

-- Goa Palms
(5, 2, NULL, 'properties/goa-palms-resort/exterior.webp', 'properties/goa-palms-resort/exterior_thumb.webp', 'properties/goa-palms-resort/exterior_card.webp', 'properties/goa-palms-resort/exterior_large.webp', 'Beachfront villas surrounded by coconut palms along Candolim shoreline', 0, TRUE),
(6, 2, NULL, 'properties/goa-palms-resort/pool.webp', 'properties/goa-palms-resort/pool_thumb.webp', 'properties/goa-palms-resort/pool_card.webp', 'properties/goa-palms-resort/pool_large.webp', 'Azure infinity pool with sun loungers overlooking the Arabian Sea', 1, FALSE),
(7, 2, NULL, 'properties/goa-palms-resort/restaurant.webp', 'properties/goa-palms-resort/restaurant_thumb.webp', 'properties/goa-palms-resort/restaurant_card.webp', 'properties/goa-palms-resort/restaurant_large.webp', 'Open-sided wooden beach shack diner serving Goan seafood', 2, FALSE),
(8, 2, NULL, 'properties/goa-palms-resort/sunset.webp', 'properties/goa-palms-resort/sunset_thumb.webp', 'properties/goa-palms-resort/sunset_card.webp', 'properties/goa-palms-resort/sunset_large.webp', 'Golden sunset over the ocean from private resort cabana', 3, FALSE),

-- Udaipur Lake Palace View
(9, 3, NULL, 'properties/lake-palace-view-udaipur/exterior.webp', 'properties/lake-palace-view-udaipur/exterior_thumb.webp', 'properties/lake-palace-view-udaipur/exterior_card.webp', 'properties/lake-palace-view-udaipur/exterior_large.webp', 'White marble boutique palace on the tranquil waters of Lake Pichola', 0, TRUE),
(10, 3, NULL, 'properties/lake-palace-view-udaipur/lobby.webp', 'properties/lake-palace-view-udaipur/lobby_thumb.webp', 'properties/lake-palace-view-udaipur/lobby_card.webp', 'properties/lake-palace-view-udaipur/lobby_large.webp', 'Grand Mewari reception hall adorned with glass mosaic thikri art', 1, FALSE),
(11, 3, NULL, 'properties/lake-palace-view-udaipur/terrace.webp', 'properties/lake-palace-view-udaipur/terrace_thumb.webp', 'properties/lake-palace-view-udaipur/terrace_card.webp', 'properties/lake-palace-view-udaipur/terrace_large.webp', 'Lakeside dining terrace with views of City Palace illuminated at night', 2, FALSE),
(12, 3, NULL, 'properties/lake-palace-view-udaipur/view.webp', 'properties/lake-palace-view-udaipur/view_thumb.webp', 'properties/lake-palace-view-udaipur/view_card.webp', 'properties/lake-palace-view-udaipur/view_large.webp', 'Panoramic vista of Jag Mandir and Lake Pichola from suite window', 3, FALSE),

-- Manali Pine Crest
(13, 4, NULL, 'properties/pine-crest-manali/exterior.webp', 'properties/pine-crest-manali/exterior_thumb.webp', 'properties/pine-crest-manali/exterior_card.webp', 'properties/pine-crest-manali/exterior_large.webp', 'Timber and river-stone chalet framed by snow-covered Himalayan peaks', 0, TRUE),
(14, 4, NULL, 'properties/pine-crest-manali/lounge.webp', 'properties/pine-crest-manali/lounge_thumb.webp', 'properties/pine-crest-manali/lounge_card.webp', 'properties/pine-crest-manali/lounge_large.webp', 'Cozy cedar-wood lounge with natural stone fireplace and warm wool rugs', 1, FALSE),
(15, 4, NULL, 'properties/pine-crest-manali/orchard.webp', 'properties/pine-crest-manali/orchard_thumb.webp', 'properties/pine-crest-manali/orchard_card.webp', 'properties/pine-crest-manali/orchard_large.webp', 'Surrounding red apple orchard in bloom with morning valley fog', 2, FALSE),
(16, 4, NULL, 'properties/pine-crest-manali/view.webp', 'properties/pine-crest-manali/view_thumb.webp', 'properties/pine-crest-manali/view_card.webp', 'properties/pine-crest-manali/view_large.webp', 'Solang valley view with deodar forest under bright morning sunshine', 3, FALSE),

-- Mumbai Marine Drive
(17, 5, NULL, 'properties/marine-drive-stay-mumbai/exterior.webp', 'properties/marine-drive-stay-mumbai/exterior_thumb.webp', 'properties/marine-drive-stay-mumbai/exterior_card.webp', 'properties/marine-drive-stay-mumbai/exterior_large.webp', 'Classic Art Deco facade fronting the curved promenade of Marine Drive', 0, TRUE),
(18, 5, NULL, 'properties/marine-drive-stay-mumbai/lobby.webp', 'properties/marine-drive-stay-mumbai/lobby_thumb.webp', 'properties/marine-drive-stay-mumbai/lobby_card.webp', 'properties/marine-drive-stay-mumbai/lobby_large.webp', 'Polished terrazzo floor lobby with contemporary Indian brass art', 1, FALSE),
(19, 5, NULL, 'properties/marine-drive-stay-mumbai/restaurant.webp', 'properties/marine-drive-stay-mumbai/restaurant_thumb.webp', 'properties/marine-drive-stay-mumbai/restaurant_card.webp', 'properties/marine-drive-stay-mumbai/restaurant_large.webp', 'Panoramic glass-walled lounge overlooking the Queen’s Necklace', 2, FALSE),
(20, 5, NULL, 'properties/marine-drive-stay-mumbai/view.webp', 'properties/marine-drive-stay-mumbai/view_thumb.webp', 'properties/marine-drive-stay-mumbai/view_card.webp', 'properties/marine-drive-stay-mumbai/view_large.webp', 'Arabian sea horizon and historic colonial skyline in South Mumbai', 3, FALSE),

-- Delhi Lutyens Grand
(21, 6, NULL, 'properties/lutyens-grand-delhi/exterior.webp', 'properties/lutyens-grand-delhi/exterior_thumb.webp', 'properties/lutyens-grand-delhi/exterior_card.webp', 'properties/lutyens-grand-delhi/exterior_large.webp', 'Grand white colonial colonnades and landscaped lawns in Central Delhi', 0, TRUE),
(22, 6, NULL, 'properties/lutyens-grand-delhi/lobby.webp', 'properties/lutyens-grand-delhi/lobby_thumb.webp', 'properties/lutyens-grand-delhi/lobby_card.webp', 'properties/lutyens-grand-delhi/lobby_large.webp', 'High-ceiling atrium with heritage chandeliers and teakwood library', 1, FALSE),
(23, 6, NULL, 'properties/lutyens-grand-delhi/dining.webp', 'properties/lutyens-grand-delhi/dining_thumb.webp', 'properties/lutyens-grand-delhi/dining_card.webp', 'properties/lutyens-grand-delhi/dining_large.webp', 'Regal banquet dining room serving authentic North Indian cuisine', 2, FALSE),
(24, 6, NULL, 'properties/lutyens-grand-delhi/courtyard.webp', 'properties/lutyens-grand-delhi/courtyard_thumb.webp', 'properties/lutyens-grand-delhi/courtyard_card.webp', 'properties/lutyens-grand-delhi/courtyard_large.webp', 'Sunlit internal courtyard with bougainvillea blooms and stone pathways', 3, FALSE),

-- Bengaluru Tech Park
(25, 7, NULL, 'properties/tech-park-suites-bengaluru/exterior.webp', 'properties/tech-park-suites-bengaluru/exterior_thumb.webp', 'properties/tech-park-suites-bengaluru/exterior_card.webp', 'properties/tech-park-suites-bengaluru/exterior_large.webp', 'Modern steel and glass architecture in Bellandur tech corridor', 0, TRUE),
(26, 7, NULL, 'properties/tech-park-suites-bengaluru/lobby.webp', 'properties/tech-park-suites-bengaluru/lobby_thumb.webp', 'properties/tech-park-suites-bengaluru/lobby_card.webp', 'properties/tech-park-suites-bengaluru/lobby_large.webp', 'Minimalist executive lobby with smart check-in kiosks and espresso bar', 1, FALSE),
(27, 7, NULL, 'properties/tech-park-suites-bengaluru/workspace.webp', 'properties/tech-park-suites-bengaluru/workspace_thumb.webp', 'properties/tech-park-suites-bengaluru/workspace_card.webp', 'properties/tech-park-suites-bengaluru/workspace_large.webp', 'Ergonomic business lounge with conference pods and high-speed fibre WiFi', 2, FALSE),
(28, 7, NULL, 'properties/tech-park-suites-bengaluru/gym.webp', 'properties/tech-park-suites-bengaluru/gym_thumb.webp', 'properties/tech-park-suites-bengaluru/gym_card.webp', 'properties/tech-park-suites-bengaluru/gym_large.webp', 'State-of-the-art 24/7 fitness centre with panoramic city views', 3, FALSE),

-- Munnar Misty Hills
(29, 8, NULL, 'properties/misty-hills-resort-munnar/exterior.webp', 'properties/misty-hills-resort-munnar/exterior_thumb.webp', 'properties/misty-hills-resort-munnar/exterior_card.webp', 'properties/misty-hills-resort-munnar/exterior_large.webp', 'Sloped timber cottages perched above terraced emerald tea hills', 0, TRUE),
(30, 8, NULL, 'properties/misty-hills-resort-munnar/lobby.webp', 'properties/misty-hills-resort-munnar/lobby_thumb.webp', 'properties/misty-hills-resort-munnar/lobby_card.webp', 'properties/misty-hills-resort-munnar/lobby_large.webp', 'Open-air wooden gazebo reception overlooking mist rolling over plantations', 1, FALSE),
(31, 8, NULL, 'properties/misty-hills-resort-munnar/teagarden.webp', 'properties/misty-hills-resort-munnar/teagarden_thumb.webp', 'properties/misty-hills-resort-munnar/teagarden_card.webp', 'properties/misty-hills-resort-munnar/teagarden_large.webp', 'Lush green tea plantation trail accessible directly from guest cottages', 2, FALSE),
(32, 8, NULL, 'properties/misty-hills-resort-munnar/view.webp', 'properties/misty-hills-resort-munnar/view_thumb.webp', 'properties/misty-hills-resort-munnar/view_card.webp', 'properties/misty-hills-resort-munnar/view_large.webp', 'Breathtaking sunrise viewpoint over Western Ghats mountain ridges', 3, FALSE),

-- Selected Room Photos
(33, NULL, 1, 'rooms/standard-room/room.webp', 'rooms/standard-room/room_thumb.webp', 'rooms/standard-room/room_card.webp', 'rooms/standard-room/room_large.webp', 'Cozy Standard room with queen bed, hardwood flooring and reading lamps', 0, TRUE),
(34, NULL, 2, 'rooms/deluxe-room/room.webp', 'rooms/deluxe-room/room_thumb.webp', 'rooms/deluxe-room/room_card.webp', 'rooms/deluxe-room/room_large.webp', 'Spacious Deluxe room with plush king bed, accent armchairs and large picture window', 0, TRUE),
(35, NULL, 3, 'rooms/premium-room/room.webp', 'rooms/premium-room/room_thumb.webp', 'rooms/premium-room/room_card.webp', 'rooms/premium-room/room_large.webp', 'Premium room featuring private sunlit balcony, luxury bedding and marble bath', 0, TRUE),
(36, NULL, 4, 'rooms/heritage-suite/room.webp', 'rooms/heritage-suite/room_thumb.webp', 'rooms/heritage-suite/room_card.webp', 'rooms/heritage-suite/room_large.webp', 'Royal Heritage Suite with handcrafted wooden four-poster bed and traditional silk upholstery', 0, TRUE),
(37, NULL, 5, 'rooms/family-room/room.webp', 'rooms/family-room/room_thumb.webp', 'rooms/family-room/room_card.webp', 'rooms/family-room/room_large.webp', 'Expansive Family Suite with twin queen beds and comfortable lounge seating', 0, TRUE);

SELECT setval('images_id_seq', 37);

-- 9. Seed Bookings (52 Bookings across past, present, and future dates)
-- Date semantics: check_in inclusive, check_out exclusive [in, out).
-- No overlapping bookings on same room for active statuses.
INSERT INTO bookings (id, booking_code, user_id, room_id, check_in, check_out, guests_count, status, total_base_inr, total_discount_inr, taxable_amount_inr, cgst_inr, sgst_inr, total_amount_inr, guest_name, guest_email, guest_phone, guest_id_type, guest_id_last4, created_at) VALUES
-- Past bookings (Checked out)
(1, 'SK-2026-000101', 2, 1, '2026-01-10', '2026-01-13', 2, 'CHECKED_OUT', 4497.00, 0.00, 4497.00, 112.43, 112.43, 4721.86, 'Aarav Sharma', 'aarav.sharma@example.in', '+919876543210', 'AADHAAR', '3849', '2026-01-05 10:15:00+05:30'),
(2, 'SK-2026-000102', 3, 2, '2026-01-15', '2026-01-18', 2, 'CHECKED_OUT', 10497.00, 0.00, 10497.00, 262.43, 262.43, 11021.86, 'Priya Patel', 'priya.patel@example.in', '+919823456789', 'PASSPORT', '8821', '2026-01-08 14:20:00+05:30'),
(3, 'SK-2026-000103', 4, 6, '2026-02-01', '2026-02-05', 2, 'CHECKED_OUT', 5996.00, 0.00, 5996.00, 149.90, 149.90, 6295.80, 'Rohan Verma', 'rohan.verma@example.in', '+919712345678', 'DRIVING_LICENCE', '4912', '2026-01-20 18:00:00+05:30'),
(4, 'SK-2026-000104', 5, 11, '2026-02-10', '2026-02-14', 2, 'CHECKED_OUT', 5996.00, 0.00, 5996.00, 149.90, 149.90, 6295.80, 'Ananya Iyer', 'ananya.iyer@example.in', '+919654321098', 'VOTER_ID', '6634', '2026-02-01 11:30:00+05:30'),
(5, 'SK-2026-000105', 6, 16, '2026-02-18', '2026-02-21', 2, 'CHECKED_OUT', 4497.00, 0.00, 4497.00, 112.43, 112.43, 4721.86, 'Vikram Singh', 'vikram.singh@example.in', '+919988776655', 'AADHAAR', '7721', '2026-02-10 16:45:00+05:30'),
(6, 'SK-2026-000106', 2, 21, '2026-03-01', '2026-03-04', 2, 'CHECKED_OUT', 4497.00, 0.00, 4497.00, 112.43, 112.43, 4721.86, 'Aarav Sharma', 'aarav.sharma@example.in', '+919876543210', 'AADHAAR', '3849', '2026-02-22 09:10:00+05:30'),
(7, 'SK-2026-000107', 3, 26, '2026-03-10', '2026-03-13', 2, 'CHECKED_OUT', 4497.00, 0.00, 4497.00, 112.43, 112.43, 4721.86, 'Priya Patel', 'priya.patel@example.in', '+919823456789', 'PASSPORT', '8821', '2026-03-01 12:00:00+05:30'),
(8, 'SK-2026-000108', 4, 31, '2026-03-15', '2026-03-18', 2, 'CHECKED_OUT', 4497.00, 0.00, 4497.00, 112.43, 112.43, 4721.86, 'Rohan Verma', 'rohan.verma@example.in', '+919712345678', 'DRIVING_LICENCE', '4912', '2026-03-08 19:30:00+05:30'),
(9, 'SK-2026-000109', 5, 36, '2026-03-25', '2026-03-28', 2, 'CHECKED_OUT', 4497.00, 0.00, 4497.00, 112.43, 112.43, 4721.86, 'Ananya Iyer', 'ananya.iyer@example.in', '+919654321098', 'VOTER_ID', '6634', '2026-03-18 10:00:00+05:30'),
(10, 'SK-2026-000110', 6, 3, '2026-04-05', '2026-04-08', 2, 'CHECKED_OUT', 10497.00, 0.00, 10497.00, 262.43, 262.43, 11021.86, 'Vikram Singh', 'vikram.singh@example.in', '+919988776655', 'AADHAAR', '7721', '2026-03-28 15:20:00+05:30'),
(11, 'SK-2026-000111', 2, 8, '2026-04-12', '2026-04-16', 3, 'CHECKED_OUT', 13996.00, 0.00, 13996.00, 349.90, 349.90, 14695.80, 'Aarav Sharma', 'aarav.sharma@example.in', '+919876543210', 'AADHAAR', '3849', '2026-04-01 11:15:00+05:30'),
(12, 'SK-2026-000112', 3, 13, '2026-04-20', '2026-04-23', 2, 'CHECKED_OUT', 10497.00, 0.00, 10497.00, 262.43, 262.43, 11021.86, 'Priya Patel', 'priya.patel@example.in', '+919823456789', 'PASSPORT', '8821', '2026-04-10 17:40:00+05:30'),
(13, 'SK-2026-000113', 4, 18, '2026-05-02', '2026-05-06', 2, 'CHECKED_OUT', 13996.00, 0.00, 13996.00, 349.90, 349.90, 14695.80, 'Rohan Verma', 'rohan.verma@example.in', '+919712345678', 'DRIVING_LICENCE', '4912', '2026-04-25 14:00:00+05:30'),
(14, 'SK-2026-000114', 5, 23, '2026-05-15', '2026-05-19', 2, 'CHECKED_OUT', 13996.00, 0.00, 13996.00, 349.90, 349.90, 14695.80, 'Ananya Iyer', 'ananya.iyer@example.in', '+919654321098', 'VOTER_ID', '6634', '2026-05-05 16:10:00+05:30'),
(15, 'SK-2026-000115', 6, 28, '2026-06-01', '2026-06-04', 2, 'CHECKED_OUT', 10497.00, 0.00, 10497.00, 262.43, 262.43, 11021.86, 'Vikram Singh', 'vikram.singh@example.in', '+919988776655', 'AADHAAR', '7721', '2026-05-20 18:25:00+05:30'),
(16, 'SK-2026-000116', 2, 33, '2026-06-10', '2026-06-14', 2, 'CHECKED_OUT', 13996.00, 0.00, 13996.00, 349.90, 349.90, 14695.80, 'Aarav Sharma', 'aarav.sharma@example.in', '+919876543210', 'AADHAAR', '3849', '2026-06-01 09:30:00+05:30'),
(17, 'SK-2026-000117', 3, 38, '2026-06-20', '2026-06-24', 2, 'CHECKED_OUT', 13996.00, 0.00, 13996.00, 349.90, 349.90, 14695.80, 'Priya Patel', 'priya.patel@example.in', '+919823456789', 'PASSPORT', '8821', '2026-06-12 13:45:00+05:30'),
(18, 'SK-2026-000118', 4, 4, '2026-07-05', '2026-07-09', 2, 'CHECKED_OUT', 23996.00, 0.00, 23996.00, 599.90, 599.90, 25195.80, 'Rohan Verma', 'rohan.verma@example.in', '+919712345678', 'DRIVING_LICENCE', '4912', '2026-06-25 15:00:00+05:30'),
(19, 'SK-2026-000119', 5, 9, '2026-07-15', '2026-07-19', 2, 'CHECKED_OUT', 23996.00, 0.00, 23996.00, 599.90, 599.90, 25195.80, 'Ananya Iyer', 'ananya.iyer@example.in', '+919654321098', 'VOTER_ID', '6634', '2026-07-05 11:20:00+05:30'),
(20, 'SK-2026-000120', 6, 14, '2026-08-01', '2026-08-05', 2, 'CHECKED_OUT', 23996.00, 0.00, 23996.00, 599.90, 599.90, 25195.80, 'Vikram Singh', 'vikram.singh@example.in', '+919988776655', 'AADHAAR', '7721', '2026-07-20 14:15:00+05:30'),
(21, 'SK-2026-000121', 2, 19, '2026-08-10', '2026-08-14', 2, 'CHECKED_OUT', 23996.00, 0.00, 23996.00, 599.90, 599.90, 25195.80, 'Aarav Sharma', 'aarav.sharma@example.in', '+919876543210', 'AADHAAR', '3849', '2026-08-01 16:30:00+05:30'),
(22, 'SK-2026-000122', 3, 24, '2026-08-20', '2026-08-24', 2, 'CHECKED_OUT', 23996.00, 0.00, 23996.00, 599.90, 599.90, 25195.80, 'Priya Patel', 'priya.patel@example.in', '+919823456789', 'PASSPORT', '8821', '2026-08-10 10:00:00+05:30'),
(23, 'SK-2026-000123', 4, 29, '2026-09-01', '2026-09-05', 2, 'CHECKED_OUT', 23996.00, 0.00, 23996.00, 599.90, 599.90, 25195.80, 'Rohan Verma', 'rohan.verma@example.in', '+919712345678', 'DRIVING_LICENCE', '4912', '2026-08-22 17:45:00+05:30'),
(24, 'SK-2026-000124', 5, 34, '2026-09-12', '2026-09-16', 2, 'CHECKED_OUT', 23996.00, 0.00, 23996.00, 599.90, 599.90, 25195.80, 'Ananya Iyer', 'ananya.iyer@example.in', '+919654321098', 'VOTER_ID', '6634', '2026-09-02 12:10:00+05:30'),
(25, 'SK-2026-000125', 6, 39, '2026-09-22', '2026-09-26', 2, 'CHECKED_OUT', 23996.00, 0.00, 23996.00, 599.90, 599.90, 25195.80, 'Vikram Singh', 'vikram.singh@example.in', '+919988776655', 'AADHAAR', '7721', '2026-09-12 15:35:00+05:30'),

-- Cancelled Bookings with Refunds
(26, 'SK-2026-000126', 2, 5, '2026-10-01', '2026-10-04', 3, 'CANCELLED', 35997.00, 0.00, 35997.00, 3239.73, 3239.73, 42476.46, 'Aarav Sharma', 'aarav.sharma@example.in', '+919876543210', 'AADHAAR', '3849', '2026-09-15 10:00:00+05:30'),
(27, 'SK-2026-000127', 3, 10, '2026-10-05', '2026-10-08', 4, 'CANCELLED', 22497.00, 0.00, 22497.00, 562.43, 562.43, 23621.86, 'Priya Patel', 'priya.patel@example.in', '+919823456789', 'PASSPORT', '8821', '2026-09-20 14:00:00+05:30'),
(28, 'SK-2026-000128', 4, 15, '2026-10-08', '2026-10-11', 2, 'CANCELLED', 35997.00, 0.00, 35997.00, 3239.73, 3239.73, 42476.46, 'Rohan Verma', 'rohan.verma@example.in', '+919712345678', 'DRIVING_LICENCE', '4912', '2026-09-25 11:30:00+05:30'),

-- Current Bookings (Checked In around mid-October 2026)
(29, 'SK-2026-000129', 2, 1, '2026-10-15', '2026-10-18', 2, 'CHECKED_IN', 4497.00, 0.00, 4497.00, 112.43, 112.43, 4721.86, 'Aarav Sharma', 'aarav.sharma@example.in', '+919876543210', 'AADHAAR', '3849', '2026-10-10 10:00:00+05:30'),
(30, 'SK-2026-000130', 3, 6, '2026-10-15', '2026-10-19', 2, 'CHECKED_IN', 5996.00, 0.00, 5996.00, 149.90, 149.90, 6295.80, 'Priya Patel', 'priya.patel@example.in', '+919823456789', 'PASSPORT', '8821', '2026-10-11 12:30:00+05:30'),
(31, 'SK-2026-000131', 4, 11, '2026-10-16', '2026-10-20', 2, 'CHECKED_IN', 5996.00, 0.00, 5996.00, 149.90, 149.90, 6295.80, 'Rohan Verma', 'rohan.verma@example.in', '+919712345678', 'DRIVING_LICENCE', '4912', '2026-10-12 16:00:00+05:30'),
(32, 'SK-2026-000132', 5, 16, '2026-10-16', '2026-10-19', 2, 'CHECKED_IN', 4497.00, 0.00, 4497.00, 112.43, 112.43, 4721.86, 'Ananya Iyer', 'ananya.iyer@example.in', '+919654321098', 'VOTER_ID', '6634', '2026-10-13 14:15:00+05:30'),
(33, 'SK-2026-000133', 6, 21, '2026-10-15', '2026-10-18', 2, 'CHECKED_IN', 4497.00, 0.00, 4497.00, 112.43, 112.43, 4721.86, 'Vikram Singh', 'vikram.singh@example.in', '+919988776655', 'AADHAAR', '7721', '2026-10-12 18:20:00+05:30'),

-- Future Bookings (Confirmed for late October, November, December 2026)
(34, 'SK-2026-000134', 2, 2, '2026-10-22', '2026-10-25', 2, 'CONFIRMED', 10497.00, 0.00, 10497.00, 262.43, 262.43, 11021.86, 'Aarav Sharma', 'aarav.sharma@example.in', '+919876543210', 'AADHAAR', '3849', '2026-10-14 09:30:00+05:30'),
(35, 'SK-2026-000135', 3, 7, '2026-10-26', '2026-10-30', 2, 'CONFIRMED', 18194.80, 0.00, 18194.80, 454.87, 454.87, 19104.54, 'Priya Patel', 'priya.patel@example.in', '+919823456789', 'PASSPORT', '8821', '2026-10-14 11:45:00+05:30'),
(36, 'SK-2026-000136', 4, 12, '2026-10-27', '2026-10-31', 2, 'CONFIRMED', 18194.80, 0.00, 18194.80, 454.87, 454.87, 19104.54, 'Rohan Verma', 'rohan.verma@example.in', '+919712345678', 'DRIVING_LICENCE', '4912', '2026-10-14 14:10:00+05:30'),
(37, 'SK-2026-000137', 5, 17, '2026-11-01', '2026-11-05', 2, 'CONFIRMED', 18194.80, 0.00, 18194.80, 454.87, 454.87, 19104.54, 'Ananya Iyer', 'ananya.iyer@example.in', '+919654321098', 'VOTER_ID', '6634', '2026-10-15 15:20:00+05:30'),
(38, 'SK-2026-000138', 6, 22, '2026-11-05', '2026-11-09', 2, 'CONFIRMED', 13996.00, 0.00, 13996.00, 349.90, 349.90, 14695.80, 'Vikram Singh', 'vikram.singh@example.in', '+919988776655', 'AADHAAR', '7721', '2026-10-15 17:00:00+05:30'),
(39, 'SK-2026-000139', 2, 27, '2026-11-10', '2026-11-14', 2, 'CONFIRMED', 13996.00, 0.00, 13996.00, 349.90, 349.90, 14695.80, 'Aarav Sharma', 'aarav.sharma@example.in', '+919876543210', 'AADHAAR', '3849', '2026-10-15 19:15:00+05:30'),
(40, 'SK-2026-000140', 3, 32, '2026-11-15', '2026-11-18', 2, 'CONFIRMED', 10497.00, 0.00, 10497.00, 262.43, 262.43, 11021.86, 'Priya Patel', 'priya.patel@example.in', '+919823456789', 'PASSPORT', '8821', '2026-10-15 20:30:00+05:30'),
(41, 'SK-2026-000141', 4, 37, '2026-11-20', '2026-11-24', 2, 'CONFIRMED', 13996.00, 0.00, 13996.00, 349.90, 349.90, 14695.80, 'Rohan Verma', 'rohan.verma@example.in', '+919712345678', 'DRIVING_LICENCE', '4912', '2026-10-16 09:00:00+05:30'),
(42, 'SK-2026-000142', 5, 3, '2026-11-25', '2026-11-29', 2, 'CONFIRMED', 13996.00, 0.00, 13996.00, 349.90, 349.90, 14695.80, 'Ananya Iyer', 'ananya.iyer@example.in', '+919654321098', 'VOTER_ID', '6634', '2026-10-16 10:15:00+05:30'),
(43, 'SK-2026-000143', 6, 8, '2026-12-01', '2026-12-05', 2, 'CONFIRMED', 13996.00, 0.00, 13996.00, 349.90, 349.90, 14695.80, 'Vikram Singh', 'vikram.singh@example.in', '+919988776655', 'AADHAAR', '7721', '2026-10-16 11:20:00+05:30'),
(44, 'SK-2026-000144', 2, 13, '2026-12-05', '2026-12-09', 2, 'CONFIRMED', 13996.00, 0.00, 13996.00, 349.90, 349.90, 14695.80, 'Aarav Sharma', 'aarav.sharma@example.in', '+919876543210', 'AADHAAR', '3849', '2026-10-16 12:40:00+05:30'),
(45, 'SK-2026-000145', 3, 18, '2026-12-10', '2026-12-14', 2, 'CONFIRMED', 13996.00, 0.00, 13996.00, 349.90, 349.90, 14695.80, 'Priya Patel', 'priya.patel@example.in', '+919823456789', 'PASSPORT', '8821', '2026-10-16 13:50:00+05:30'),
(46, 'SK-2026-000146', 4, 23, '2026-12-15', '2026-12-19', 2, 'CONFIRMED', 13996.00, 0.00, 13996.00, 349.90, 349.90, 14695.80, 'Rohan Verma', 'rohan.verma@example.in', '+919712345678', 'DRIVING_LICENCE', '4912', '2026-10-16 14:30:00+05:30'),
(47, 'SK-2026-000147', 5, 9, '2026-12-20', '2026-12-25', 2, 'CONFIRMED', 43492.75, 0.00, 43492.75, 1087.32, 1087.32, 45667.39, 'Ananya Iyer', 'ananya.iyer@example.in', '+919654321098', 'VOTER_ID', '6634', '2026-10-16 15:10:00+05:30'),
(48, 'SK-2026-000148', 6, 19, '2026-12-22', '2026-12-27', 2, 'CONFIRMED', 41993.00, 0.00, 41993.00, 1049.83, 1049.83, 44092.66, 'Vikram Singh', 'vikram.singh@example.in', '+919988776655', 'AADHAAR', '7721', '2026-10-16 15:45:00+05:30'),
(49, 'SK-2026-000149', 2, 5, '2026-12-29', '2027-01-02', 3, 'CONFIRMED', 64794.60, 0.00, 64794.60, 5831.51, 5831.51, 76457.62, 'Aarav Sharma', 'aarav.sharma@example.in', '+919876543210', 'AADHAAR', '3849', '2026-10-16 16:00:00+05:30'),
(50, 'SK-2026-000150', 3, 10, '2026-12-29', '2027-01-02', 4, 'CONFIRMED', 43494.20, 0.00, 43494.20, 1087.36, 1087.36, 45668.92, 'Priya Patel', 'priya.patel@example.in', '+919823456789', 'PASSPORT', '8821', '2026-10-16 16:30:00+05:30'),
(51, 'SK-2026-000151', 4, 15, '2026-12-30', '2027-01-03', 2, 'CONFIRMED', 64794.60, 0.00, 64794.60, 5831.51, 5831.51, 76457.62, 'Rohan Verma', 'rohan.verma@example.in', '+919712345678', 'DRIVING_LICENCE', '4912', '2026-10-16 16:50:00+05:30'),
(52, 'SK-2026-000152', 5, 20, '2026-12-30', '2027-01-03', 4, 'CONFIRMED', 41994.40, 0.00, 41994.40, 1049.86, 1049.86, 44094.12, 'Ananya Iyer', 'ananya.iyer@example.in', '+919654321098', 'VOTER_ID', '6634', '2026-10-16 17:15:00+05:30');

SELECT setval('bookings_id_seq', 52);

-- Update cancellation and refund info for cancelled bookings
UPDATE bookings SET
    refund_amount_inr = 42476.46,
    refund_status = 'COMPLETED',
    refund_reason = 'Cancelled 10 days before check-in (100% refund as per policy)',
    cancelled_at = '2026-09-20 11:00:00+05:30'
WHERE id = 26;

UPDATE bookings SET
    refund_amount_inr = 11810.93,
    refund_status = 'COMPLETED',
    refund_reason = 'Cancelled 36 hours before check-in (50% refund as per policy)',
    cancelled_at = '2026-10-03 14:00:00+05:30'
WHERE id = 27;

UPDATE bookings SET
    refund_amount_inr = 0.00,
    refund_status = 'REJECTED',
    refund_reason = 'Cancelled 18 hours before check-in (0% refund under 24h as per policy)',
    cancelled_at = '2026-10-07 16:00:00+05:30'
WHERE id = 28;

-- 10. Seed Payments
INSERT INTO payments (id, booking_id, amount_inr, payment_mode, transaction_id, status, upi_id, card_last4, bank_name) VALUES
(1, 1, 4721.86, 'UPI', 'TXN-SK-20260105-001', 'SUCCESS', 'aarav@okaxis', NULL, NULL),
(2, 2, 11021.86, 'CARD', 'TXN-SK-20260108-002', 'SUCCESS', NULL, '4242', NULL),
(3, 3, 6295.80, 'NET_BANKING', 'TXN-SK-20260120-003', 'SUCCESS', NULL, NULL, 'HDFC Bank'),
(4, 4, 6295.80, 'UPI', 'TXN-SK-20260201-004', 'SUCCESS', 'ananya@okhdfcbank', NULL, NULL),
(5, 5, 4721.86, 'CARD', 'TXN-SK-20260210-005', 'SUCCESS', NULL, '5501', NULL),
(6, 26, 42476.46, 'UPI', 'TXN-SK-20260915-026', 'REFUNDED', 'aarav@okaxis', NULL, NULL),
(7, 27, 23621.86, 'CARD', 'TXN-SK-20260920-027', 'REFUNDED', NULL, '4242', NULL),
(8, 29, 4721.86, 'UPI', 'TXN-SK-20261010-029', 'SUCCESS', 'aarav@okaxis', NULL, NULL),
(9, 30, 6295.80, 'CARD', 'TXN-SK-20261011-030', 'SUCCESS', NULL, '4242', NULL),
(10, 31, 6295.80, 'UPI', 'TXN-SK-20261012-031', 'SUCCESS', 'rohan@oksbi', NULL, NULL),
(11, 34, 11021.86, 'UPI', 'TXN-SK-20261014-034', 'SUCCESS', 'aarav@okaxis', NULL, NULL),
(12, 35, 19104.54, 'CARD', 'TXN-SK-20261014-035', 'SUCCESS', NULL, '4242', NULL),
(13, 36, 19104.54, 'NET_BANKING', 'TXN-SK-20261014-036', 'SUCCESS', NULL, NULL, 'State Bank of India'),
(14, 49, 76457.62, 'UPI', 'TXN-SK-20261016-049', 'SUCCESS', 'aarav@okaxis', NULL, NULL);

SELECT setval('payments_id_seq', 14);

-- 11. Initial Maintenance Blocks
INSERT INTO room_maintenance (id, room_id, start_date, end_date, reason) VALUES
(1, 4, '2026-11-15', '2026-11-18', 'Scheduled annual wooden floor varnishing and balcony railing polish'),
(2, 25, '2026-11-20', '2026-11-23', 'Heritage ceiling fresco inspection and air purification system maintenance');

SELECT setval('room_maintenance_id_seq', 2);
