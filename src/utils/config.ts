import { ethers } from 'ethers';
import { Reddio } from '@reddio.com/js';

console.log(process.env.IS_VERCEL);

let reddio: Reddio;
const initReddio = () => {
  if (typeof window !== 'undefined' && !reddio) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    reddio = new Reddio({
      provider,
      env: process.env.IS_VERCEL === '1' ? 'main' : 'test',
    });
  }
};

export { initReddio, reddio };
