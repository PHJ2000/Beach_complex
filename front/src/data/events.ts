// NOTE: This module provides mock data used solely for demo/preview experiences within the
// EventsView. Replace with real API integration when backend endpoints become available.

export interface Event {
  id: string;
  title: string;
  distance: string;
  schedule: string;
  recommendedTime: string;
  congestionStatus: 'free' | 'normal' | 'busy';
  date: Date;
  endDate?: Date; // For multi-day events
  color: string; // Unique color for each event
  imageUrl: string;
  description: string;
}

export const events: Event[] = [
  {
    id: '1',
    title: '부산불꽃축제',
    distance: '2.1km',
    schedule: '오늘 20-21시',
    recommendedTime: '22시 이후 권장',
    congestionStatus: 'busy',
    date: new Date(2025, 9, 24), // Oct 24, 2025
    color: '#FF6B9D',
    imageUrl: 'https://images.unsplash.com/photo-1722183346764-a39ec66367ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    description: '부산의 대표 축제, 광안리 해수욕장에서 열리는 화려한 불꽃쇼',
  },
  {
    id: '2',
    title: '서핑체험',
    distance: '1.3km',
    schedule: '상시',
    recommendedTime: '오전 6-8시 여유',
    congestionStatus: 'free',
    date: new Date(2025, 9, 8), // Oct 8, 2025
    endDate: new Date(2025, 9, 10), // Oct 10, 2025 (multi-day)
    color: '#4ECDC4',
    imageUrl: 'https://images.unsplash.com/photo-1756312091127-2d42d33427ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    description: '송정 해수욕장에서 즐기는 서핑 체험',
  },
  {
    id: '3',
    title: '부산국제영화제 개막작 상영',
    distance: '7.2km',
    schedule: '10월 18일',
    recommendedTime: '오후 6-8시 혼잡',
    congestionStatus: 'busy',
    date: new Date(2025, 9, 18), // Oct 18, 2025
    endDate: new Date(2025, 9, 19), // Oct 19, 2025
    color: '#95E1D3',
    imageUrl: 'https://images.unsplash.com/photo-1527979809431-ea3d5c0c01c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    description: '영화의전당에서 열리는 부산국제영화제 개막식',
  },
  {
    id: '4',
    title: '해운대 모래축제',
    distance: '3.5km',
    schedule: '10월 5-6일',
    recommendedTime: '오후 2-4시 보통',
    congestionStatus: 'normal',
    date: new Date(2025, 9, 5), // Oct 5, 2025
    endDate: new Date(2025, 9, 6), // Oct 6, 2025
    color: '#FFD93D',
    imageUrl: '',
    description: '해운대 해수욕장에서 펼쳐지는 모래 조각 전시',
  },
  {
    id: '5',
    title: '광안리 요트투어',
    distance: '2.8km',
    schedule: '매주 토일',
    recommendedTime: '오전 10-12시 여유',
    congestionStatus: 'free',
    date: new Date(2025, 9, 6), // Oct 6, 2025
    color: '#6BCB77',
    imageUrl: '',
    description: '광안대교 아래를 지나는 프리미엄 요트 투어',
  },
  {
    id: '6',
    title: '송도 케이블카',
    distance: '4.2km',
    schedule: '상시',
    recommendedTime: '평일 오전 권장',
    congestionStatus: 'normal',
    date: new Date(2025, 9, 12), // Oct 12, 2025
    color: '#A78BFA',
    imageUrl: '',
    description: '바다 위를 가로지르는 스카이워크 케이블카',
  },
];
