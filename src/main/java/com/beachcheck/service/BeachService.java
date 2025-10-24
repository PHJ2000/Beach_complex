package com.beachcheck.service;

import com.beachcheck.domain.Beach;
import com.beachcheck.domain.BeachTag;
import com.beachcheck.domain.Favorite;
import com.beachcheck.dto.beach.BeachDto;
import com.beachcheck.repository.BeachRepository;
import com.beachcheck.repository.BeachTagRepository;
import com.beachcheck.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BeachService {
    private final BeachRepository beachRepo;
    private final BeachTagRepository tagRepo;
    private final FavoriteRepository favRepo;

    public List<BeachDto> list(String q, BeachTag.TagType tag, boolean favoritesOnly, Long userId) {
        List<Beach> base = beachRepo.search((q == null || q.isBlank()) ? null : q);
        Set<Long> tagSet = (tag == null) ? null : new HashSet<>(tagRepo.findBeachIdsByTag(tag));
        Set<Long> favSet = (userId == null) ? Set.of() : new HashSet<>(favRepo.findBeachIdsByUser(userId));

        return base.stream()
                .filter(b -> tagSet == null || tagSet.contains(b.getId()))
                .filter(b -> !favoritesOnly || favSet.contains(b.getId()))
                .map(b -> BeachDto.builder()
                        .id(b.getId())
                        .name(b.getName())
                        .district(b.getDistrict())
                        .lat(b.getLat())
                        .lon(b.getLon())
                        .status(b.getStatus())
                        .favorite(favSet.contains(b.getId()))
                        .build())
                .toList();
    }

    @Transactional
    public boolean toggleFavorite(Long beachId, Long userId) {
        if (favRepo.existsByBeachIdAndUserId(beachId, userId)) {
            favRepo.deleteByBeachIdAndUserId(beachId, userId);
            return false;
        }
        Favorite favorite = new Favorite();
        favorite.setBeachId(beachId);
        favorite.setUserId(userId);
        favRepo.save(favorite);
        return true;
    }
}
