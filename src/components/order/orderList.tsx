import {
  Button,
  Row,
  Col,
  message,
  Image,
  Space,
  Dialog,
  Radio,
} from 'tdesign-react';
import { ShopIcon } from 'tdesign-icons-react';
import Text from '../typography';
import styles from './index.less';
import { useQuery } from '@tanstack/react-query';
import { reddio } from '@/utils/config';
import { ERC20Address, ERC721Address, USRDAddress } from '@/utils/common';
import { useCallback, useEffect, useState } from 'react';
import type { OrderListResponse, BalanceResponse } from '@reddio.com/js';
import axios from 'axios';
import { useSnapshot } from 'valtio';
import { store } from '@/utils/store';
import SellDialog from '../dialog/sellNFT';
import { generateKey } from '@/utils/util';
import SellERC20 from '@/components/dialog/sellERC20';

interface IMetadataResponse {
  data: {
    attributes: {
      tokenid: string;
      url: string;
    };
  }[];
}

const getMetadata = (id: string) => {
  return axios.get<IMetadataResponse>(
    `https://track-dev.reddio.com/api/meta-data?filters[tokenid][$eq]=${id}`,
  );
};

const OrderList = () => {
  const snap = useSnapshot(store);
  const [orderList, setOrderList] = useState<OrderListResponse[]>([]);
  const [ethBalance, setEthBalance] = useState(0);
  const [rddBalance, setRddBalance] = useState('');
  const [nftBalance, setNftBalance] = useState<{
    ERC721: BalanceResponse[];
    ERC721M: BalanceResponse[];
  }>({ ERC721: [], ERC721M: [] });
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [showSellERC20Dialog, setShowERC20Dialog] = useState(false);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [wantBuy, setWantBuy] = useState<OrderListResponse | null>(null);
  const [wantBuyERC20, setWantBuyERC20] = useState<[string, string] | null>(
    null,
  );
  const [metaData, setMetaData] = useState<any>({});
  const [menu, setMenu] = useState<any>('NFT');

  const orderListQuery = useQuery(
    ['orderList'],
    () => {
      return reddio.apis.orderList({
        contractAddress: ERC721Address,
      });
    },
    {
      onSuccess: async ({ data }) => {
        const { list } = data.data;
        setOrderList(list);
        const ids = list.map((item) => item.token_id);
        Promise.all(ids.map((id) => getMetadata(id.toString()))).then((res) => {
          const map = {};
          res.forEach((item) => {
            const length = item.data.data.length;
            if (length > 0) {
              // @ts-ignore
              map[item.data.data[length - 1].attributes.tokenid] =
                item.data.data[length - 1].attributes.url;
            }
          });
          setMetaData(map);
        });
      },
    },
  );

  const { data, refetch } = useQuery(['erc20OrderListQuery'], () =>
    reddio.apis.getDepth({
      baseContract: ERC20Address,
      quoteContract: USRDAddress,
    }),
  );

  useQuery(
    ['getBalances', snap.starkKey],
    () => {
      if (!snap.starkKey) return Promise.reject();
      return reddio.apis.getBalancesV3({
        starkKey: snap.starkKey,
      });
    },
    {
      onSuccess: ({ data }) => {
        if (data.error) return;

        const transfer = () => {
          reddio.apis.transfer({
            starkKey:
              '0x503756893a0a80b4e650b7bbb6fe3485b04c3a68e2bf31161e55ae43a23d100',
            privateKey:
              '14453a2ee2d834e23779278899e8a992f2be51f52690f2e859f08cd6671f7eb',
            amount: '100',
            receiver: store.starkKey,
            type: 'ERC20',
            contractAddress: ERC20Address,
          });
          setRddBalance((v) => v + 100000000);
        };

        if (data.data.length) {
          const tokenBalance = data.data.filter(
            (item) =>
              item.contract_address === ERC20Address || item.type === 'ETH',
          );
          const ethBalance = tokenBalance?.find((item) => item.type === 'ETH');
          const rddBalance = tokenBalance?.find(
            (item) => item.contract_address === ERC20Address,
          );
          const erc721MBalance = data.data.filter(
            (item) => item.contract_address === ERC721Address,
          );
          rddBalance && setRddBalance(rddBalance.balance_available.toString());
          ethBalance && setEthBalance(ethBalance.balance_available);
          setNftBalance({
            ERC721: [],
            ERC721M: erc721MBalance
              .map((item) => item.available_tokens)
              .flat() as any,
          });
          const needAirdrop =
            (!rddBalance && store.starkKey) ||
            (rddBalance &&
              rddBalance.balance_available < 500000000 &&
              store.starkKey);
          if (needAirdrop) {
            transfer();
          }
        } else {
          transfer();
        }
      },
    },
  );

  const handleBuyClick = useCallback(
    (item: OrderListResponse | null, depth: [string, string] | null) => {
      setWantBuy(item);
      setWantBuyERC20(depth);
      setShowBuyDialog(true);
    },
    [],
  );

  const buy = useCallback(
    async (order: OrderListResponse) => {
      const keypair = await generateKey();
      const orderParams: any = {
        keypair,
        amount: order.amount,
        tokenAddress: order.symbol.quote_token_contract_addr,
        tokenId: order.token_id,
        orderType: 'buy',
        tokenType: order.token_type,
        price: order.display_price,
        marketplaceUuid: '11ed793a-cc11-4e44-9738-97165c4e14a7',
      };
      orderParams.baseTokenAddress = order.symbol.base_token_contract_addr;
      orderParams.baseTokenType = 'ERC20';
      const params = await reddio.utils.getOrderParams(orderParams);
      await reddio.apis.order(params);
      orderListQuery.refetch();
      message.success('Buy Success');
      setShowBuyDialog(false);
      setWantBuy(null);
    },
    [ethBalance, snap.starkKey, rddBalance],
  );

  const buyUSRD = useCallback(
    async (order: [string, string]) => {
      // if (Number(rddBalance) < Number(order[0]) * Number(order[1])) {
      //   message.error('Layer2 balance insufficient!');
      //   return;
      // }
      const keypair = await generateKey();
      const orderParams: any = {
        keypair,
        amount: order[1],
        tokenAddress: USRDAddress,
        orderType: 'buy',
        tokenType: 'ERC20',
        price: order[0],
        baseTokenAddress: ERC20Address,
        baseTokenType: 'ERC20',
      };
      const params = await reddio.utils.getOrderParams(orderParams);
      await reddio.apis.order(params);
      refetch();
      message.success('Buy Success');
      setShowBuyDialog(false);
      setWantBuyERC20(null);
    },
    [ethBalance, snap.starkKey, rddBalance],
  );

  return (
    <>
      <div className={styles.orderListWrapper}>
        <div>
          <Text type="bold">Order List</Text>
          <Button
            theme="primary"
            variant="text"
            disabled={!snap.starkKey}
            onClick={() =>
              menu === 'NFT'
                ? setShowSellDialog(true)
                : setShowERC20Dialog(true)
            }
          >
            Sell {menu}
          </Button>
        </div>
        <div style={{ margin: '20px auto' }}>
          <Radio.Group
            variant="default-filled"
            size="large"
            value={menu}
            onChange={(v) => setMenu(v)}
          >
            <Radio.Button value="NFT">NFT</Radio.Button>
            <Radio.Button value="ERC20">ERC20</Radio.Button>
          </Radio.Group>
        </div>
        <Row gutter={[20, 24]}>
          {menu === 'NFT'
            ? orderList.map((item, index) => {
                return (
                  <Col flex="190px" className={styles.item} key={index}>
                    <div>
                      <div style={{ width: 190, height: 190 }}>
                        {metaData[item.token_id] ? (
                          <Image
                            src={metaData[item.token_id]}
                            alt=""
                            style={{
                              width: '100%',
                              height: '100%',
                              background: 'none',
                            }}
                          />
                        ) : null}
                      </div>
                      <Button
                        icon={<ShopIcon />}
                        shape="round"
                        disabled={!snap.starkKey}
                        onClick={() => handleBuyClick(item, null)}
                      >
                        Buy
                      </Button>
                    </div>
                    <Text>
                      {item.display_price} {item.symbol.base_token_name}
                    </Text>
                    <Space />
                    <Text>Token Id: {item.token_id}</Text>
                  </Col>
                );
              })
            : data?.data.data.asks?.map((item, index) => {
                return (
                  <Col
                    flex="190px"
                    className={styles.item}
                    key={index}
                    style={{ gap: 4 }}
                  >
                    <Text>{item[1]} USDR</Text>
                    <Space />
                    <Text>Price: {item[0]} RED20</Text>
                    <Space />
                    <Text>
                      Total: {Number(item[0]) * Number(item[1])} RED20
                    </Text>
                    <Space />
                    <Button
                      icon={<ShopIcon />}
                      shape="round"
                      disabled={!snap.starkKey}
                      onClick={() => handleBuyClick(null, item)}
                    >
                      Buy
                    </Button>
                  </Col>
                );
              })}
        </Row>
      </div>
      {showSellDialog ? (
        <SellDialog
          balance={nftBalance}
          onClose={() => setShowSellDialog(false)}
        />
      ) : null}
      {showSellERC20Dialog ? (
        <SellERC20
          balance={nftBalance}
          onClose={() => setShowERC20Dialog(false)}
        />
      ) : null}
      <Dialog
        header="Buy ERC20"
        visible={showBuyDialog}
        confirmOnEnter
        cancelBtn="Cancel"
        confirmBtn="Confirm"
        onClose={() => setShowBuyDialog(false)}
        onConfirm={() => (wantBuy ? buy(wantBuy!) : buyUSRD(wantBuyERC20!))}
        onCancel={() => setShowBuyDialog(false)}
      >
        <p>
          {wantBuy
            ? `Do you want to buy the NFT for ${wantBuy?.display_price}
          ${wantBuy?.symbol.base_token_name}?`
            : `Do you want to buy the ${wantBuyERC20?.[1]} USDR for ${
                Number(wantBuyERC20?.[0]) * Number(wantBuyERC20?.[1])
              }
          RED20?`}
        </p>
      </Dialog>
    </>
  );
};

export default OrderList;
