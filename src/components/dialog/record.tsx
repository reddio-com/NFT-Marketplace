import { Dialog, Link } from 'tdesign-react';
import Text from '@/components/typography';
import styles from './index.less';
import { useQuery } from '@tanstack/react-query';
import { reddio } from '@/utils/config';
import { useSnapshot } from 'valtio';
import { store } from '@/utils/store';
import { useState } from 'react';
import type { RecordResponse } from '@reddio.com/js';

interface IRecordProps {
  address: string;
  onClose: () => void;
}

const recordType = [
  'All',
  'Deposit',
  'Mint',
  'TransferFrom',
  'WithDraw',
  'FullWithDraw',
  'TransferAll',
  'ASKOrder',
  'BIDOrder',
  'OrderAll',
];

const recordStatus = [
  'Submitted',
  'Accepted',
  'Failed',
  'Proved',
  'ProvedError',
];

const color = ['#2C2C2C', '#4CEB1B', '#C9353F'];

const Record = ({ onClose, address }: IRecordProps) => {
  const snap = useSnapshot(store);

  const [records, setRecords] = useState<RecordResponse[]>([]);

  const recordQuery = useQuery(
    ['getRecords', snap.starkKey],
    () => {
      return reddio.apis.getRecords({
        starkKey: store.starkKey,
      });
    },
    {
      onSuccess: ({ data }) => {
        setRecords(data.data.list);
      },
    },
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
      style={{ padding: '28px 0 0', overflow: 'hidden' }}
    >
      <div className={styles.recordDialogContent}>
        <div>
          <Text type="bold">Record</Text>
          <Link
            theme="primary"
            href={`https://goerli.etherscan.io/address/${address}`}
            target="_blank"
            hover="color"
          >
            Etherscan
          </Link>
        </div>
        <div>
          {records.map((record, index) => (
            <div className={styles.recordItem} key={index}>
              <div>
                <Text>{recordType[record.record_type]}</Text>
                <Text color={color[record.status]}>
                  {recordStatus[record.status]}
                </Text>
              </div>
              <div>
                <Text>
                  {'order' in record
                    ? `TokenId: ${record.order.token_id}`
                    : `${record.display_value} ${record.asset_name}`}
                </Text>
                <Text>{new Date(record.time * 1000).toLocaleString()}</Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
};

export default Record;
