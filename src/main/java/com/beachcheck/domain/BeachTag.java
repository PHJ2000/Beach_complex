package com.beachcheck.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "beach_tag")
@IdClass(BeachTagId.class)
@Getter
@Setter
public class BeachTag {
    public enum TagType {
        trending,
        popular,
        festival
    }

    @Id
    private Long beachId;

    @Id
    @Enumerated(EnumType.STRING)
    private TagType tag;
}
