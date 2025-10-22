package com.beachcheck.domain;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FestivalItem {
    private String title;
    private String start;
    private String end;
    private String location;
    private String thumbnail;
    private String description;
    private String link;
}
