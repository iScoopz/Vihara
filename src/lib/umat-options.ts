import { UmatBagian } from '@/types/database';

// Stored as-is in profiles.cetya for umat who are not under any Cetya or Dharmasala.
export const NO_CETYA = 'Tidak ada Cetya';
export const NO_DHARMASALA = 'Tidak ada Dharmasala';
export const UNAFFILIATED_CETYA_OPTIONS = [NO_CETYA, NO_DHARMASALA];

export const BAGIAN_OPTIONS: UmatBagian[] = [
  'Pria',
  'Wanita',
  'Inspirasi',
  'Pro-M 40s',
  'Pro-M Progresif',
  'GM',
  'Bintang'
];
