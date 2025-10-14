package com.beachcheck.repository;

import com.beachcheck.domain.BeachCondition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface BeachConditionRepository extends JpaRepository<BeachCondition, UUID> {

    List<BeachCondition> findByBeachIdAndObservedAtAfter(UUID beachId, Instant observedAfter);
}
