import { Button, Row, Col, message, Image } from 'tdesign-react';
import { ShopIcon } from 'tdesign-icons-react';
import Text from '../typography';
import styles from './index.less';
import { useQuery } from '@tanstack/react-query';
import { reddio } from '@/utils/config';
import { ERC20Address, ERC721Address } from '@/utils/common';
import { useCallback, useState } from 'react';
import type { OrderListResponse } from '@reddio.com/js';
import axios from 'axios';
import { useSnapshot } from 'valtio';
import { store } from '@/utils/store';

const OrderList = () => {
  const snap = useSnapshot(store);
  const [orderList, setOrderList] = useState<OrderListResponse[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [ethBalance, setEthBalance] = useState(0);

  const orderListQuery = useQuery(
    ['orderList'],
    () => {
      return reddio.apis.orderList({
        contractAddress: ERC721Address,
      });
    },
    {
      onSuccess: async ({ data }) => {
        const arr = data.data.filter((item) => item.token_id !== '');
        setOrderList(arr);
        const tokenIds = arr.map((item) => item.token_id).join(',');
        const { data: urls } = await axios.get(
          `https://metadata.reddio.com/metadata?token_ids=${tokenIds}&contract_address=${ERC721Address}`,
        );
        setImages(urls.data);
      },
    },
  );

  const getBalancesQuery = useQuery(
    ['getBalances', snap.starkKey],
    () => {
      return reddio.apis.getBalances({
        starkKey: snap.starkKey,
        contractAddress: 'eth',
      });
    },
    {
      onSuccess: ({ data }) => {
        if (data.data.length) {
          setEthBalance(data.data[0].balance_available);
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
        marketplaceUuid: '11ed793a-cc11-4e44-9738-97165c4e14a7'
      });
      const { data } = await reddio.apis.order(params);
      orderListQuery.refetch();
      message.success('Buy Success');
    },
    [ethBalance],
  );

  return (
    <div className={styles.orderListWrapper}>
      <Text type="bold">Order List</Text>
      <Row gutter={[20, 24]}>
        {orderList.map((item, index) => {
          return (
            <Col flex="190px" className={styles.item} key={index}>
              <div>
                <div style={{ width: 190, height: 190 }}>
                  {images.length ? (
                    <Image
                      src={images[index].image}
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
              <Text>{item.display_price} ETH</Text>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default OrderList;
