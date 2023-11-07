import { getAccount, readContract, fetchBalance } from '@wagmi/core';
import erc721Abi from '@/abi/Erc721.abi.json';
import { ERC721Address } from '@/utils/common';
import { isVercel, reddio } from '@/utils/config';
import { ParticleNetwork } from '@particle-network/auth';

const getEthAddress = async () => {
  return getAccount().address as string;
};

const getContractBalance = async (contractAddress: string) => {
  const balance = await fetchBalance({
    // @ts-ignore
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

const particle = new ParticleNetwork({
  appId: '6538d319-cb27-4725-9ecb-fe3abdd4b960',
  clientKey: 'cZKXZfzg4Kt6GQyWwZOVNmjCVfGvStdXioXRljZW',
  projectId: 'f682496e-89c8-48e4-978f-eb8d057e467f',
});

const generateKey = async () => {
  return reddio.keypair.generateFromEthSignature();
};

export {
  getEthAddress,
  getContractBalance,
  getTokenURI,
  generateKey,
  particle,
};
