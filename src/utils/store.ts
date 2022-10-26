import { proxy } from 'valtio';

export const store = proxy<{ starkKey: string; erc721MAddress: string }>({
  starkKey: '',
  erc721MAddress: window.localStorage.getItem('erc721m') || '',
});

export const addStarkKey = (starkKey: string) => {
  store.starkKey = starkKey;
};

export const addErc721MAddress = (address: string) => {
  store.erc721MAddress = address;
  window.localStorage.setItem('erc721m', address);
};
