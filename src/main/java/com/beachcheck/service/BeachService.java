package com.beachcheck.service;

import com.beachcheck.domain.Beach;
import com.beachcheck.dto.BeachDto;
import com.beachcheck.repository.BeachRepository;
import com.beachcheck.util.GeometryUtils;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class BeachService {

    private final BeachRepository beachRepository;

    public BeachService(BeachRepository beachRepository) {
        this.beachRepository = beachRepository;
    }

    @Cacheable("beachSummaries")
    public List<BeachDto> findAll() {
        return beachRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public BeachDto findByCode(String code) {
        Beach beach = beachRepository.findByCode(code)
                .orElseThrow(() -> new EntityNotFoundException("Beach with code " + code + " not found"));
        return toDto(beach);
    }

    private BeachDto toDto(Beach beach) {
        return new BeachDto(
                beach.getId(),
                beach.getCode(),
                beach.getName(),
                beach.getStatus(),
                GeometryUtils.extractLatitude(beach.getLocation()),
                GeometryUtils.extractLongitude(beach.getLocation()),
                beach.getUpdatedAt()
        );
    }

    // TODO: Introduce aggregation with external wave monitoring service for enriched beach summaries.
}
