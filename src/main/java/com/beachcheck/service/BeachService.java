package com.beachcheck.service;

import com.beachcheck.domain.Beach;
import com.beachcheck.dto.beach.BeachDto;
import com.beachcheck.repository.BeachRepository;
//import com.beachcheck.util.GeometryUtils;
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
        // return new BeachDto(
        //         beach.getId(),
        //         beach.getCode(),
        //         beach.getName(),
        //         beach.getStatus(),
        //         GeometryUtils.extractLatitude(beach.getLocation()),
        //         GeometryUtils.extractLongitude(beach.getLocation()),
        //         beach.getUpdatedAt()
        //         beach.getTag(),          // 없으면 null 로 바꿔도 됨
        //         Boolean.FALSE            // 찜 기능 붙이기 전까지 기본값
        // );
        return BeachDto.from(beach);
    }

    public List<BeachDto> search(String q, String tag) {
        String qq = (q == null || q.isBlank()) ? null : q.trim();
        String tt = (tag == null || tag.isBlank()) ? null : tag.trim();

        List<Beach> rows;
        if (qq == null) {
            rows = beachRepository.findAll();
        } else {
            rows = beachRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(qq, qq);
        }

        if (tt != null) {
            rows = rows.stream()
                    .filter(b -> b.getTag() != null && b.getTag().equalsIgnoreCase(tt))
                    .toList();
        }

        return rows.stream().map(BeachDto::from).toList();
    }


    // TODO: Introduce aggregation with external wave monitoring service for enriched beach summaries.
}
