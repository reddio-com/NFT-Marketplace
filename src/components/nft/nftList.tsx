import { Row } from 'tdesign-react';
import styles from './index.less';
import Back from '@/components/back';
import { useEffect, useState } from 'react';
import { getErc721Balance } from '@/utils/listERC721';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reddio } from '@/utils/config';
import { useSnapshot } from 'valtio';
import { store } from '@/utils/store';
import { ERC721Address } from '@/utils/common';
import NFT from '@/components/nft/nft';

const NFTList = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const address = searchParams.get('address') || '';

  const snap = useSnapshot(store);
  const [tokenIds, setTokenIds] = useState<string[]>([]);
  const [baseUri, setBaseUri] = useState('');

  const getL1ERC721Query = useQuery(
    ['getErc721Balance'],
    () => {
      return getErc721Balance(ERC721Address);
    },
    {
      enabled: false,
      onSuccess: (data) => {
        setTokenIds(data);
      },
    },
  );

  const getL2BalancesQuery = useQuery(
    ['getBalances', snap.starkKey],
    () => {
      return reddio.apis.getBalances({
        starkKey: snap.starkKey,
        contractAddress: address,
      });
    },
    {
      enabled: false,
      onSuccess: async ({ data }) => {
        if (data.status === 'FAILED') return;
        let ids: any[] = [];
        if (searchParams.get('address') !== null) {
          ids = data.data.list
            .filter(
              (item) =>
                item.balance_available &&
                item.contract_address.toLowerCase() === address.toLowerCase(),
            )
            .map((item) => item.token_id);
          // @ts-ignore
          if (ids.length) setBaseUri(data.data.list[0].base_uri);
        } else {
          ids = data.data.list
            .filter(
              (item) =>
                item.balance_available &&
                item.contract_address === ERC721Address,
            )
            .map((item) => item.token_id);
        }
        if (!ids.length) return;
        setTokenIds(ids);
      },
    },
  );

  useEffect(() => {
    if (type === 'l2') {
      getL2BalancesQuery.refetch();
    } else {
      getL1ERC721Query.refetch();
    }
  }, [store.starkKey]);

  return (
    <div className={styles.nftListWrapper}>
      <Back>NFT</Back>
      <div style={{ padding: '0 20px' }}>
        <Row gutter={[20, 24]} className={styles.nftListContent}>
          {type === 'l2'
            ? tokenIds.map((item, index) => {
                return (
                  <NFT
                    key={index}
                    tokenId={tokenIds[index]}
                    type={type}
                    baseUri={baseUri}
                  />
                );
              })
            : tokenIds.map((item) => {
                return <NFT key={item} tokenId={item} type={type!} />;
              })}
        </Row>
      </div>
    </div>
  );
};

export default NFTList;
