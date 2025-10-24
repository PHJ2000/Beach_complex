package com.beachcheck.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "favorite")
@IdClass(FavoriteId.class)
@Getter
@Setter
public class Favorite {
    @Id
    private Long userId;

    @Id
    private Long beachId;
}
