package com.beachcheck.domain;

import lombok.Data;

import java.io.Serializable;

@Data
public class BeachTagId implements Serializable {
    private Long beachId;
    private BeachTag.TagType tag;
}
