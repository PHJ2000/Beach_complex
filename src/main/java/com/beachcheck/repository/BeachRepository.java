package com.beachcheck.repository;

import com.beachcheck.domain.Beach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BeachRepository extends JpaRepository<Beach, Long> {
    @Query("""
        SELECT b FROM Beach b
        WHERE (:q IS NULL OR LOWER(b.name) LIKE LOWER(CONCAT('%', :q, '%')))
    """)
    List<Beach> search(@Param("q") String q);
}
