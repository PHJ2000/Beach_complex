package com.beachcheck.repository;

import com.beachcheck.domain.BeachTag;
import com.beachcheck.domain.BeachTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BeachTagRepository extends JpaRepository<BeachTag, BeachTagId> {
    @Query("SELECT bt.beachId FROM BeachTag bt WHERE bt.tag = :tag")
    List<Long> findBeachIdsByTag(@Param("tag") BeachTag.TagType tag);
}
