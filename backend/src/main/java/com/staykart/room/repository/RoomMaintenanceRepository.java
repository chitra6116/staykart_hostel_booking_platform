package com.staykart.room.repository;

import com.staykart.room.entity.RoomMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomMaintenanceRepository extends JpaRepository<RoomMaintenance, Long> {

    @Query("SELECT m FROM RoomMaintenance m WHERE m.room.id = :roomId AND m.startDate < :checkOut AND m.endDate > :checkIn")
    List<RoomMaintenance> findOverlappingMaintenance(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    List<RoomMaintenance> findByRoomIdOrderByStartDateDesc(Long roomId);
}
