import { Button, Row, Col, message, Image, Space, Dialog } from 'tdesign-react';
import { ShopIcon } from 'tdesign-icons-react';
import Text from '../typography';
import styles from './index.less';
import { useQuery } from '@tanstack/react-query';
import { reddio } from '@/utils/config';
import { ERC721Address } from '@/utils/common';
import { useCallback, useEffect, useState } from 'react';
import type { OrderListResponse, BalanceResponse } from '@reddio.com/js';
import axios from 'axios';
import { useSnapshot } from 'valtio';
import { store } from '@/utils/store';
import SellDialog from '../dialog/sell';
import { generateKey } from '@/utils/util';

const ERC20ContractAddress =
  '0xEEB4180D15FD03Ff39e08e7d9228063746ba0220'.toLowerCase();

const OrderList = () => {
  const snap = useSnapshot(store);
  const [orderList, setOrderList] = useState<OrderListResponse[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [ethBalance, setEthBalance] = useState(0);
  const [rddBalance, setRddBalance] = useState('');
  const [nftBalance, setNftBalance] = useState<{
    ERC721: BalanceResponse[];
    ERC721M: BalanceResponse[];
  }>({ ERC721: [], ERC721M: [] });
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [wantBuy, setWantBuy] = useState<OrderListResponse | null>(null);

  const orderListQuery = useQuery(
    ['orderList'],
    () => {
      return reddio.apis.orderList({
        contractAddress: ERC721Address,
      });
    },
    {
      onSuccess: async ({ data }) => {
        const arr = data.data.list
          .filter((item) => item.token_id !== '')
          .filter(
            (item) =>
              item.symbol.base_token_name === 'ETH' ||
              item.symbol.base_token_contract_addr === ERC20ContractAddress,
          );
        setOrderList(arr);
        const tokenIds = arr.map((item) => item.token_id).join(',');
        const { data: urls } = await axios.get(
          `https://metadata.reddio.com/metadata?token_ids=${tokenIds}&contract_address=${ERC721Address}`,
        );
        setImages(urls.data);
      },
    },
  );

  useQuery(
    ['getBalances', snap.starkKey],
    () => {
      if (!snap.starkKey) return Promise.reject();
      return reddio.apis.getBalances({
        starkKey: snap.starkKey,
        limit: 10000,
      });
    },
    {
      onSuccess: ({ data }) => {
        if (data.error) return;
        if (data.data.list.length) {
          const tokenBalance = data.data.list.filter(
            (item) =>
              item.type === 'ETH' ||
              item.contract_address === ERC20ContractAddress,
          );
          const ethBalance = tokenBalance?.find((item) => item.type === 'ETH');
          const rddBalance = tokenBalance?.find(
            (item) => item.contract_address === ERC20ContractAddress,
          );
          const erc721Balance = data.data.list.filter(
            (item) =>
              item.contract_address === ERC721Address.toLowerCase() &&
              item.balance_available,
          );
          const erc721MBalance = data.data.list.filter(
            (item) =>
              item.contract_address === snap.erc721MAddress.toLowerCase() &&
              item.balance_available,
          );
          rddBalance && setRddBalance(rddBalance.display_value);
          ethBalance && setEthBalance(ethBalance.balance_available);
          setNftBalance({
            ERC721: erc721Balance,
            ERC721M: erc721MBalance,
          });
        }
      },
    },
  );

  useEffect(() => {
    if ((!rddBalance || Number(rddBalance) < 50) && store.starkKey) {
      reddio.apis.transfer({
        starkKey:
          '0x503756893a0a80b4e650b7bbb6fe3485b04c3a68e2bf31161e55ae43a23d100',
        privateKey:
          '14453a2ee2d834e23779278899e8a992f2be51f52690f2e859f08cd6671f7eb',
        amount: '100',
        receiver: store.starkKey,
        type: 'ERC20',
        contractAddress: ERC20ContractAddress,
      });
    }
  }, [rddBalance, store.starkKey]);

  const handleBuyClick = useCallback((item: OrderListResponse) => {
    setWantBuy(item);
    setShowBuyDialog(true);
  }, []);

  const buy = useCallback(
    async (order: OrderListResponse) => {
      if (order.stark_key === snap.starkKey) {
        message.error('You can not buy your own NFT!');
        return;
      }
      if (
        ethBalance < Number(order.price) &&
        order.symbol.base_token_name !== 'Reddio20'
      ) {
        message.error('Layer2 balance insufficient!');
        return;
      } else if (
        rddBalance < order.price &&
        order.symbol.base_token_name === 'Reddio20'
      ) {
        message.error('Layer2 balance insufficient!');
        return;
      }
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
      if (order.symbol.base_token_name === 'Reddio20') {
        orderParams.baseTokenAddress = order.symbol.base_token_contract_addr;
        orderParams.baseTokenType = 'ERC20';
      }
      const params = await reddio.utils.getOrderParams(orderParams);
      await reddio.apis.order(params);
      orderListQuery.refetch();
      message.success('Buy Success');
      setShowBuyDialog(false);
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
            onClick={() => setShowSellDialog(true)}
          >
            Sell NFT
          </Button>
        </div>
        <Row gutter={[20, 24]}>
          {orderList.map((item, index) => {
            return (
              <Col flex="190px" className={styles.item} key={index}>
                <div>
                  <div style={{ width: 190, height: 190 }}>
                    {images.length ? (
                      <Image
                        src={images[index]?.image}
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
                    onClick={() => handleBuyClick(item)}
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
          })}
        </Row>
      </div>
      {showSellDialog ? (
        <SellDialog
          balance={nftBalance}
          onClose={() => setShowSellDialog(false)}
        />
      ) : null}
      <Dialog
        header="Buy NFT"
        visible={showBuyDialog}
        confirmOnEnter
        cancelBtn="Cancel"
        confirmBtn="Confirm"
        onClose={() => setShowBuyDialog(false)}
        onConfirm={() => buy(wantBuy!)}
        onCancel={() => setShowBuyDialog(false)}
      >
        <p>
          Do you want to buy the NFT for <b>{wantBuy?.display_price}</b>{' '}
          {wantBuy?.symbol.base_token_name}?
        </p>
      </Dialog>
    </>
  );
};

export default OrderList;
