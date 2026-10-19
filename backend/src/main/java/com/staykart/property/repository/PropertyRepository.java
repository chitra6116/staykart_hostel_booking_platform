package com.staykart.property.repository;

import com.staykart.property.entity.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    Optional<Property> findBySlug(String slug);

    Page<Property> findByActiveTrue(Pageable pageable);

    @Query("SELECT p FROM Property p WHERE p.active = true AND LOWER(p.city) = LOWER(:city)")
    List<Property> findByCityIgnoreCaseAndActiveTrue(@Param("city") String city);

    @Query("SELECT DISTINCT p.city FROM Property p WHERE p.active = true ORDER BY p.city ASC")
    List<String> findDistinctCities();
}
