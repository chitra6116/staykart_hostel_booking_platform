package com.staykart.amenity.service;

import com.staykart.amenity.dto.AmenityDto;
import com.staykart.amenity.repository.AmenityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AmenityService {

    private final AmenityRepository amenityRepository;

    public AmenityService(AmenityRepository amenityRepository) {
        this.amenityRepository = amenityRepository;
    }

    @Transactional(readOnly = true)
    public List<AmenityDto> getAllAmenities() {
        return amenityRepository.findAllByOrderByNameAsc().stream()
                .map(AmenityDto::from)
                .toList();
    }
}
