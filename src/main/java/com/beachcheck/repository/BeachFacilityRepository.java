package com.beachcheck.repository;

import com.beachcheck.domain.BeachFacility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BeachFacilityRepository extends JpaRepository<BeachFacility, UUID> {

    List<BeachFacility> findByBeachId(UUID beachId);
}
