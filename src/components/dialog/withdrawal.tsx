import { Button, Dialog, message } from 'tdesign-react';
import Text from '@/components/typography';
import styles from './index.less';
import { useQuery } from '@tanstack/react-query';
import { reddio } from '@/utils/config';
import { useSnapshot } from 'valtio';
import { store } from '@/utils/store';
import { useCallback, useState } from 'react';
import type { WithdrawalStatusResponse } from '@reddio.com/js';
import { getEthAddress } from '@/utils/util';

interface IWithdrawalProps {
  onClose: () => void;
}

const items = ['SepoliaETH', 'ERC20', 'ERC721'];

const Withdrawal = ({ onClose }: IWithdrawalProps) => {
  const snap = useSnapshot(store);

  const [status, setStatus] = useState<WithdrawalStatusResponse[]>([]);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const withdrawalStatusQuery = useQuery(
    ['withdrawalStatus', snap.starkKey],
    async () => {
      return reddio.apis.withdrawalStatus({
        ethaddress: await getEthAddress(),
        stage: 'withdrawarea',
      });
    },
    {
      onSuccess: ({ data }) => {
        setStatus(data.data);
      },
    },
  );

  const getText = useCallback((item: WithdrawalStatusResponse) => {
    if (item.type.includes('ERC721')) {
      return `${item.symbol} - ${item.type} - TokenId: ${item.token_id}`;
    }
    return `${item.display_value} ${item.type}`;
  }, []);

  const handleWithdrawal = useCallback(
    async (item: WithdrawalStatusResponse) => {
      setIsLoading((value) => ({ ...value, [item.asset_id]: true }));
      try {
        await reddio.apis.withdrawalFromL1({
          ethAddress: await getEthAddress(),
          type: item.type,
          tokenId: Number(item.token_id),
          assetType: item.asset_type,
          // @ts-ignore
          tokenUrl: item.token_uri,
        });
        withdrawalStatusQuery.refetch();
        message.success('Withdrawal success');
      } catch (e: any) {
        message.error(e.message);
        setIsLoading((value) => ({ ...value, [item.asset_id]: false }));
      }
    },
    [],
  );

  return (
    <Dialog
      closeBtn
      closeOnOverlayClick
      destroyOnClose={false}
      draggable={false}
      footer={false}
      header={false}
      mode="modal"
      onClose={onClose}
      placement="top"
      preventScrollThrough
      showInAttachedElement={false}
      showOverlay
      theme="default"
      visible
    >
      <div className={styles.withdrawalDialogContent}>
        <div>
          <Text type="bold">Withdraw area</Text>
        </div>
        <div>
          {status.map((item, index) => {
            return (
              <div key={index}>
                <Text color="#2C2C2C">{getText(item)}</Text>
                <Button
                  shape="round"
                  onClick={() => handleWithdrawal(item)}
                  loading={isLoading[item.asset_id]}
                >
                  Withdraw
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
};

export default Withdrawal;
