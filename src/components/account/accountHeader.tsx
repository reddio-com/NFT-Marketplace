import { useCallback, useEffect, useState } from 'react';
import { history } from 'umi';
import { Button } from 'tdesign-react';
import styles from './index.less';
import { getEthAddress } from '@/utils/util';
import { useSnapshot } from 'valtio';
import { store } from '@/utils/store';
import Record from '@/components/dialog/record';
import Withdrawal from '@/components/dialog/withdrawal';
import { watchAccount } from '@wagmi/core';

interface AccountHeaderProps {
  showAlert: boolean;
}

const AccountHeader = (props: AccountHeaderProps) => {
  const snap = useSnapshot(store);
  const [address, setAddress] = useState('');
  const [showRecord, setShowRecord] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);

  const { showAlert } = props;

  const handlePushClick = useCallback((path: string) => {
    if (history.location.pathname.includes(path)) return;
    history.push(path);
  }, []);

  useEffect(() => {
    watchAccount((account) => {
      setAddress(account.address as any);
    });
  }, []);

  return (
    <div
      className={styles.accountHeaderWrapper}
      style={{ marginBottom: showAlert ? '20px' : '0' }}
    >
      {showRecord ? (
        <Record address={address} onClose={() => setShowRecord(false)} />
      ) : null}
      {showWithdrawal ? (
        <Withdrawal onClose={() => setShowWithdrawal(false)} />
      ) : null}
      {address ? (
        <div>
          <Button
            theme="primary"
            variant="text"
            onClick={() => handlePushClick('/account')}
          >
            Account
          </Button>
          <Button
            theme="primary"
            variant="text"
            disabled={!snap.starkKey}
            onClick={() => setShowWithdrawal(true)}
          >
            Withdraw Area
          </Button>
          <Button
            theme="primary"
            variant="text"
            disabled={!snap.starkKey}
            onClick={() => setShowRecord(true)}
          >
            Record
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default AccountHeader;
