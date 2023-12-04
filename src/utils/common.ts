import { isVercel } from '@/utils/config';

const ERC20Address = !isVercel
  ? '0xba95D91ba3f49c3e2911A85D06725db9DD19B3C1'
  : '0xB8c77482e45F1F44dE1745F52C74426C631bDD52';
const ERC721Address = !isVercel
  ? '0x620A610D4EEb5994053B4D150Aff6d7119e1f045'
  : '0x316442f06d97fc9864ff32f84b9fcaecd71f049d';

export { ERC721Address, ERC20Address };
