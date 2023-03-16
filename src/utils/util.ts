import { getAccount, readContract, fetchBalance } from '@wagmi/core';
import erc721Abi from '@/abi/Erc721.abi.json';
import { ERC721Address } from '@/utils/common';

const getEthAddress = async () => {
  return getAccount().address as string;
};

const getContractBalance = async (contractAddress: string) => {
  const balance = await fetchBalance({
    address: (await getEthAddress())!,
    token: contractAddress as `0x`,
  });
  return balance.formatted;
};

const getTokenURI = async (tokenId: number) => {
  return readContract({
    address: ERC721Address as `0x${string}`,
    abi: erc721Abi,
    functionName: 'tokenURI',
    args: [tokenId],
  });
};

export { getEthAddress, getContractBalance, getTokenURI };
