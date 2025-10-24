package com.beachcheck.repository;

import com.beachcheck.domain.Favorite;
import com.beachcheck.domain.FavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {
    @Query("SELECT f.beachId FROM Favorite f WHERE f.userId = :userId")
    List<Long> findBeachIdsByUser(@Param("userId") Long userId);

    boolean existsByBeachIdAndUserId(Long beachId, Long userId);

    void deleteByBeachIdAndUserId(Long beachId, Long userId);
}
