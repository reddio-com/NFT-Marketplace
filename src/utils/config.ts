import { ethers } from 'ethers';
import { Reddio } from '@reddio.com/js';

let reddio: Reddio;
const initReddio = () => {
  if (typeof window !== 'undefined' && !reddio) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    reddio = new Reddio({
      provider,
      env: 'test',
    });
  }
};

export { initReddio, reddio };
