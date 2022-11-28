import { ethers } from 'ethers';
import { Reddio } from '@reddio.com/js';

const isVercel = process.env.IS_VERCEL !== '1';

let reddio: Reddio;
const initReddio = () => {
  if (typeof window !== 'undefined' && !reddio) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    reddio = new Reddio({
      provider,
      env: isVercel ? 'main' : 'test',
    });
  }
};

export { initReddio, reddio, isVercel };
