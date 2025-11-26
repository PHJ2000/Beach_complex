# AI 해수욕장 날씨/혼잡도 API 스펙

## 개요

메인 서비스에서 사용할 **해수욕장 날씨 정보 + 혼잡도 예측 기능**을  
AI 전용 레포에서 별도 서비스로 구현해둔 상태다.

이 문서는 해당 AI 서비스의 엔드포인트와 요청/응답 스펙을 정리한다.

- AI 레포: https://github.com/PHJ2000/beach_complex_ai
- 기술 스택: Python + FastAPI
- 엔드포인트: `GET /congestion/current?beach_id={id}`

---

## 엔드포인트 스펙

### 요청

- 메서드: `GET`
- URL: `/congestion/current`
- 쿼리 파라미터:
    - `beach_id` (string, required)
        - 해수욕장 ID (예: `haeundae`, `songdo` 등)

예시:

- `GET /congestion/current?beach_id=haeundae`

### 응답

- HTTP 200 OK 시, 아래 형태의 JSON을 반환한다.

필드 설명:

- `beach_id`: 해수욕장 ID
- `beach_name`: 해수욕장 이름
- `input`:
    - `timestamp`: KST 기준 요청 시각
    - `weather`:
        - `temp_c`: 기온(섭씨)
        - `rain_mm`: 강수량(mm)
        - `wind_mps`: 풍속(m/s)
    - `is_weekend_or_holiday`: 주말/공휴일 여부(boolean)
- `rule_based`:
    - `score_raw`: 내부 계산용 스코어(정규화 전)
    - `score_pct`: 0~100 스케일로 정규화된 혼잡도 점수
    - `level`: 혼잡도 레벨(예: `여유`, `보통`, `혼잡` 등)
- `ai`:
    - 현재는 `null` (향후 AI 모델 예측 결과 추가 예정)

예시 응답(JSON):

    {
      "beach_id": "haeundae",
      "beach_name": "해운대해수욕장",
      "input": {
        "timestamp": "2025-11-23T10:04:01.064806+09:00",
        "weather": {
          "temp_c": 5.99,
          "rain_mm": 0,
          "wind_mps": 2.77
        },
        "is_weekend_or_holiday": true
      },
      "rule_based": {
        "score_raw": 0.2,
        "score_pct": 20,
        "level": "여유"
      },
      "ai": null
    }

---

## 비고

- 지금 단계에서는 **룰 기반 혼잡도(`rule_based`)만 사용 가능**하며,
  `ai` 필드는 추후 AI 모델 연동 시 확장용 슬롯이다.
- 메인(Java) 백엔드에서는 이 스펙을 기준으로 클라이언트를 구현해서
  `/congestion/current`를 호출해 사용하게 될 예정이다.
