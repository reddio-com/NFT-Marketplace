import { proxy } from 'valtio';

export const store = proxy<{ starkKey: string }>({
  starkKey: '',
});

export const addStarkKey = (starkKey: string) => {
  store.starkKey = starkKey;
};
