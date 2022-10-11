import { ethers } from 'ethers';
import erc20Abi from '@/abi/Erc20.abi.json';
import erc721Abi from '@/abi/Erc721.abi.json';
import { ERC721Address } from '@/utils/common';

const initProviderAndSigner = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
};

const getEthAddress = async () => {
  const { signer } = await initProviderAndSigner();
  return signer.getAddress();
};

const getContractBalance = async (contractAddress: string) => {
  const { provider, signer } = await initProviderAndSigner();
  const code = await provider.getCode(contractAddress);
  if (code) {
    const contract = new ethers.Contract(contractAddress, erc20Abi, signer);
    const balance = await contract.balanceOf(await signer.getAddress());
    return ethers.utils.formatEther(balance.toString());
  }
};

const getTokenURI = async (tokenId: number) => {
  const { signer } = await initProviderAndSigner();
  const contract = new ethers.Contract(ERC721Address, erc721Abi, signer);
  return await contract.tokenURI(tokenId);
};

export {
  getEthAddress,
  initProviderAndSigner,
  getContractBalance,
  getTokenURI,
};
