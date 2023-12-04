import { Reddio } from '@reddio.com/js';

const isVercel = process.env.IS_VERCEL !== '1';

let reddio: Reddio;
const initReddio = () => {
  if (typeof window !== 'undefined' && !reddio) {
    reddio = new Reddio({
      env: isVercel ? 'main' : process.env.API_ENV === 'mini' ? 'mini' : 'test',
    });
  }
};

export { initReddio, reddio, isVercel };
