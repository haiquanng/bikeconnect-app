import { BicycleCondition } from '../types/bicycle';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Mới nhất' },
  { value: 'price', label: 'Giá tăng dần' },
  { value: '-price', label: 'Giá giảm dần' },
  { value: '-viewCount', label: 'Xem nhiều nhất' },
];

const CONDITION_OPTIONS: { value: BicycleCondition; label: string }[] = [
  { value: 'NEW', label: 'Mới' },
  { value: 'LIKE_NEW', label: 'Như mới' },
  { value: 'GOOD', label: 'Tốt' },
  { value: 'FAIR', label: 'Khá' },
  { value: 'POOR', label: 'Cũ' },
];

// for detail screen
const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Mới',
  LIKE_NEW: 'Như mới',
  GOOD: 'Tốt',
  FAIR: 'Khá',
  POOR: 'Cũ',
};


export { SORT_OPTIONS, CONDITION_OPTIONS, CONDITION_LABELS };