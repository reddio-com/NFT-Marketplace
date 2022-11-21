import { Button, Row, Col, message, Image, Space } from 'tdesign-react';
import { ShopIcon } from 'tdesign-icons-react';
import Text from '../typography';
import styles from './index.less';
import { useQuery } from '@tanstack/react-query';
import { reddio } from '@/utils/config';
import { ERC721Address } from '@/utils/common';
import { useCallback, useState } from 'react';
import type { OrderListResponse, BalanceResponse } from '@reddio.com/js';
import axios from 'axios';
import { useSnapshot } from 'valtio';
import { store } from '@/utils/store';
import SellDialog from '../dialog/sell';

const OrderList = () => {
  const snap = useSnapshot(store);
  const [orderList, setOrderList] = useState<OrderListResponse[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [ethBalance, setEthBalance] = useState(0);
  const [nftBalance, setNftBalance] = useState<{
    ERC721: BalanceResponse[];
    ERC721M: BalanceResponse[];
  }>({ ERC721: [], ERC721M: [] });
  const [showSellDialog, setShowSellDialog] = useState(false);

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
          .filter((item) => item.symbol.base_token_name === 'ETH');
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
      return reddio.apis.getBalances({
        starkKey: snap.starkKey,
      });
    },
    {
      onSuccess: ({ data }) => {
        if (data.error) return;
        if (data.data.list.length) {
          const ethBalance = data.data.list.find((item) => item.type === 'ETH');
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
          ethBalance && setEthBalance(ethBalance.balance_available);
          setNftBalance({
            ERC721: erc721Balance,
            ERC721M: erc721MBalance,
          });
        }
      },
    },
  );

  const buy = useCallback(
    async (order: OrderListResponse) => {
      if (ethBalance < Number(order.price)) {
        message.error('Insufficient balance');
        return;
      }
      const keypair = await reddio.keypair.generateFromEthSignature();
      const params = await reddio.utils.getOrderParams({
        keypair,
        amount: order.amount,
        tokenAddress: order.symbol.quote_token_contract_addr,
        tokenId: order.token_id,
        orderType: 'buy',
        tokenType: order.token_type,
        price: order.display_price,
        marketplaceUuid: '11ed793a-cc11-4e44-9738-97165c4e14a7',
      });
      await reddio.apis.order(params);
      orderListQuery.refetch();
      message.success('Buy Success');
    },
    [ethBalance],
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
                    onClick={() => buy(item)}
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
    </>
  );
};

export default OrderList;
