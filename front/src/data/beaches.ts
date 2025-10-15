import type { Beach } from '../api/beaches';

export const beaches: Beach[] = [
  {
    id: 1,
    name: '해운대해수욕장',
    address: '부산 해운대구',
    distance: '2.5km',
    status: 'busy',
    tags: ['popular', 'festival'],
    mapPosition: { x: 70, y: 45 }, // 동쪽 중앙
  },
  {
    id: 2,
    name: '광안리해수욕장',
    address: '부산 수영구',
    distance: '3.2km',
    status: 'free',
    tags: ['popular'],
    mapPosition: { x: 55, y: 50 }, // 중앙
  },
  {
    id: 3,
    name: '송정해수욕장',
    address: '부산 해운대구',
    distance: '5.8km',
    status: 'busy',
    tags: ['trending'],
    mapPosition: { x: 75, y: 30 }, // 동쪽 북쪽
  },
  {
    id: 4,
    name: '다대포해수욕장',
    address: '부산 사하구',
    distance: '12.3km',
    status: 'busy',
    tags: ['festival'],
    mapPosition: { x: 20, y: 70 }, // 서쪽 남쪽
  },
  {
    id: 5,
    name: '송도해수욕장',
    address: '부산 서구',
    distance: '8.1km',
    status: 'normal',
    tags: ['trending'],
    mapPosition: { x: 35, y: 55 }, // 중앙 서쪽
  },
  {
    id: 6,
    name: '일광해수욕장',
    address: '부산 기장군',
    distance: '15.6km',
    status: 'busy',
    tags: [],
    mapPosition: { x: 80, y: 20 }, // 동쪽 최북단
  },
  {
    id: 7,
    name: '임랑해수욕장',
    address: '부산 기장군',
    distance: '18.2km',
    status: 'busy',
    tags: ['trending'],
    mapPosition: { x: 85, y: 15 }, // 동쪽 최북단 (일광보다 더)
  },
];
