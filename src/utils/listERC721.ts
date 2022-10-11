import { ethers } from 'ethers';
import { initProviderAndSigner } from '@/utils/util';
import erc721Abi from '../abi/Erc721.abi.json';

const getErc721Balance = async (contractAddress: string): Promise<any[]> => {
  try {
    const { provider, signer } = await initProviderAndSigner();
    const code = await provider.getCode(contractAddress);
    if (code) {
      const contract = new ethers.Contract(contractAddress, erc721Abi, signer);
      const address = await signer.getAddress();
      const sentLogs = await contract.queryFilter(
        contract.filters.Transfer(address, null),
      );
      const receivedLogs = await contract.queryFilter(
        contract.filters.Transfer(null, address),
      );

      const logs: any = sentLogs
        .concat(receivedLogs)
        .sort(
          (a, b) =>
            a.blockNumber - b.blockNumber ||
            a.transactionIndex - b.transactionIndex,
        );

      const owned = new Set();

      const addressEqual = (a: string, b: string) => {
        return a.toLowerCase() === b.toLowerCase();
      };

      for (const {
        args: { from, to, tokenId },
      } of logs) {
        if (addressEqual(to, address)) {
          owned.add(tokenId.toString());
        } else if (addressEqual(from, address)) {
          owned.delete(tokenId.toString());
        }
      }
      return Array.from(owned);
    }
    return [];
  } catch (e) {
    console.log(e);
    return [];
  }
};

export { getErc721Balance };
