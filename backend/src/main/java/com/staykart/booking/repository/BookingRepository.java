package com.staykart.booking.repository;

import com.staykart.booking.entity.Booking;
import com.staykart.booking.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingCode(String bookingCode);

    @Query("""
        SELECT b FROM Booking b
        JOIN FETCH b.room r
        JOIN FETCH r.property p
        JOIN FETCH r.roomType rt
        WHERE b.bookingCode = :bookingCode
    """)
    Optional<Booking> findByBookingCodeWithDetails(@Param("bookingCode") String bookingCode);

    @Query("""
        SELECT b FROM Booking b
        JOIN FETCH b.room r
        JOIN FETCH r.property p
        JOIN FETCH r.roomType rt
        WHERE b.id = :id
    """)
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);

    Optional<Booking> findByIdempotencyKey(String idempotencyKey);

    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Booking> findByUserIdAndStatusInOrderByCreatedAtDesc(Long userId, Collection<BookingStatus> statuses, Pageable pageable);

    @Query(value = """
        SELECT b FROM Booking b
        JOIN FETCH b.room r
        JOIN FETCH r.property p
        JOIN FETCH r.roomType rt
        WHERE b.user.id = :userId
        ORDER BY b.createdAt DESC
        """,
        countQuery = "SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId")
    Page<Booking> findByUserIdWithDetails(@Param("userId") Long userId, Pageable pageable);

    @Query(value = """
        SELECT b FROM Booking b
        JOIN FETCH b.room r
        JOIN FETCH r.property p
        JOIN FETCH r.roomType rt
        WHERE b.user.id = :userId AND b.status IN :statuses
        ORDER BY b.createdAt DESC
        """,
        countQuery = "SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId AND b.status IN :statuses")
    Page<Booking> findByUserIdAndStatusInWithDetails(
            @Param("userId") Long userId,
            @Param("statuses") Collection<BookingStatus> statuses,
            Pageable pageable
    );

    // term is passed as '' instead of null because Postgres cannot infer the type of a null LIKE parameter
    @Query(value = """
        SELECT b FROM Booking b
        JOIN FETCH b.room r
        JOIN FETCH r.property p
        JOIN FETCH r.roomType rt
        WHERE b.status IN :statuses
          AND (:term = ''
               OR LOWER(b.bookingCode) LIKE CONCAT('%', :term, '%')
               OR LOWER(b.guestName) LIKE CONCAT('%', :term, '%')
               OR LOWER(p.name) LIKE CONCAT('%', :term, '%'))
        ORDER BY b.createdAt DESC
        """,
        countQuery = """
        SELECT COUNT(b) FROM Booking b
        JOIN b.room r
        JOIN r.property p
        WHERE b.status IN :statuses
          AND (:term = ''
               OR LOWER(b.bookingCode) LIKE CONCAT('%', :term, '%')
               OR LOWER(b.guestName) LIKE CONCAT('%', :term, '%')
               OR LOWER(p.name) LIKE CONCAT('%', :term, '%'))
        """)
    Page<Booking> searchForAdmin(
            @Param("term") String term,
            @Param("statuses") Collection<BookingStatus> statuses,
            Pageable pageable
    );

    @Query("""
        SELECT b FROM Booking b
        WHERE b.room.id = :roomId
          AND b.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
          AND b.checkIn < :checkOut
          AND b.checkOut > :checkIn
    """)
    List<Booking> findOverlappingActiveBookings(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    @Query("""
        SELECT b FROM Booking b
        WHERE b.status = 'PENDING'
          AND b.createdAt < :cutoffTime
    """)
    List<Booking> findExpiredPendingBookings(@Param("cutoffTime") OffsetDateTime cutoffTime);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.checkIn <= :date
          AND b.checkOut >= :date
          AND b.status IN ('CONFIRMED', 'CHECKED_IN')
    """)
    List<Booking> findActiveBookingsOnDate(@Param("date") LocalDate date);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.checkIn = :date
          AND b.status = 'CONFIRMED'
    """)
    List<Booking> findArrivalsOnDate(@Param("date") LocalDate date);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.checkOut = :date
          AND b.status = 'CHECKED_IN'
    """)
    List<Booking> findDeparturesOnDate(@Param("date") LocalDate date);
}
