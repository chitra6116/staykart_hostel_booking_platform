package com.staykart.pricing.repository;

import com.staykart.pricing.entity.GstSlab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GstSlabRepository extends JpaRepository<GstSlab, Long> {

    List<GstSlab> findByActiveTrueOrderByMinTariffAsc();
}
