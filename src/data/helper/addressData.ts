import provincesRaw from './provinces.json';
import wardsRaw from './wards.json';

export interface PickerItem {
  label: string;
  value: string;
}

interface ProvinceEntry {
  name: string;
  name_with_type: string;
  code: string;
}

interface WardEntry {
  name: string;
  name_with_type: string;
  code: string;
  parent_code: string;
}

const provincesMap = provincesRaw as Record<string, ProvinceEntry>;
const wardsMap = wardsRaw as Record<string, WardEntry>;

export const provinces: PickerItem[] = Object.values(provincesMap)
  .map(p => ({ label: p.name_with_type, value: p.code }))
  .sort((a, b) => a.label.localeCompare(b.label, 'vi'));

const wardsArray = Object.values(wardsMap);

export function getWardsByProvince(provinceCode: string): PickerItem[] {
  return wardsArray
    .filter(w => w.parent_code === provinceCode)
    .map(w => ({ label: w.name_with_type, value: w.code }))
    .sort((a, b) => a.label.localeCompare(b.label, 'vi'));
}

export function findProvinceCodeByName(name: string): string {
  const entry = Object.values(provincesMap).find(
    p => p.name === name || p.name_with_type === name,
  );
  return entry?.code || '';
}
