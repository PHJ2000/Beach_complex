package com.beachcheck.repository;

import com.beachcheck.domain.Beach;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BeachRepository extends JpaRepository<Beach, UUID> {

    Optional<Beach> findByCode(String code);
}
