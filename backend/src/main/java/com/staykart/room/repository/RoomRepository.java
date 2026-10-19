package com.staykart.room.repository;

import com.staykart.room.entity.Room;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByPropertyIdAndActiveTrue(Long propertyId);

    List<Room> findByPropertyId(Long propertyId);

    Page<Room> findByActiveTrue(Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Room r WHERE r.id = :id")
    Optional<Room> findByIdWithLock(@Param("id") Long id);

    @Query("""
        SELECT r FROM Room r
        JOIN FETCH r.property p
        JOIN FETCH r.roomType rt
        WHERE r.active = true AND p.active = true
    """)
    List<Room> findAllActiveWithDetails();
}
