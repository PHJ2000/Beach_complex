package com.beachcheck.domain;

import lombok.Data;

import java.io.Serializable;

@Data
public class FavoriteId implements Serializable {
    private Long userId;
    private Long beachId;
}
