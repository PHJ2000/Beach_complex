package com.beachcheck.repository;

import com.beachcheck.domain.Beach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface BeachRepository extends JpaRepository<Beach, UUID> {

    Optional<Beach> findByCode(String code);
    // @Query("""
    //   SELECT b FROM Beach b
    //   WHERE (:q IS NULL OR LOWER(b.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(b.code) LIKE LOWER(CONCAT('%', :q, '%')))
    //     AND (:tag IS NULL OR LOWER(b.tag) = LOWER(:tag))
    // """)
    
    // List<Beach> search(@Param("q") String q, @Param("tag") String tag);
     List<Beach> findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(String name, String code);
}
