import { Reddio } from '@reddio.com/js';

const isVercel = process.env.IS_VERCEL !== '1';

let reddio: Reddio;
const initReddio = (client: any) => {
  if (typeof window !== 'undefined' && !reddio) {
    reddio = new Reddio({
      env: isVercel ? 'main' : 'test',
      wagmiClient: client,
    });
  }
};

export { initReddio, reddio, isVercel };
