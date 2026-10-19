package com.staykart.image.repository;

import com.staykart.image.entity.ImageMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<ImageMetadata, Long> {

    List<ImageMetadata> findByPropertyIdOrderBySortOrderAsc(Long propertyId);

    List<ImageMetadata> findByRoomIdOrderBySortOrderAsc(Long roomId);

    @Query("SELECT i FROM ImageMetadata i WHERE i.property.id = :propertyId AND i.cover = true")
    Optional<ImageMetadata> findCoverByPropertyId(@Param("propertyId") Long propertyId);

    @Query("SELECT i FROM ImageMetadata i WHERE i.room.id = :roomId AND i.cover = true")
    Optional<ImageMetadata> findCoverByRoomId(@Param("roomId") Long roomId);

    long countByPropertyId(Long propertyId);

    long countByRoomId(Long roomId);
}
