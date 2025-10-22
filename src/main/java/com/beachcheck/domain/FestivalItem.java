package com.beachcheck.domain;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FestivalItem {
    private String title;
    private String start;       // YYYY-MM-DD
    private String end;         // YYYY-MM-DD
    private String location;    // 주소만
    private String thumbnail;
    private String link;
}
