import { useCallback, useEffect, useState } from 'react';
import { history } from 'umi';
import { Button, MessagePlugin } from 'tdesign-react';
import { FileCopyIcon } from 'tdesign-icons-react';
import Text from '../typography';
import styles from './index.less';
import { getEthAddress } from '@/utils/util';
import { ethers } from 'ethers';
import { useSnapshot } from 'valtio';
import { addStarkKey, store } from '@/utils/store';
import Record from '@/components/dialog/record';
import Withdrawal from '@/components/dialog/withdrawal';
import { initReddio, isVercel, reddio } from '@/utils/config';

const AccountHeader = () => {
  const snap = useSnapshot(store);
  const [address, setAddress] = useState('');
  const [showRecord, setShowRecord] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);

  const getAddress = useCallback(async () => {
    setAddress(await getEthAddress());
  }, []);

  const connect = useCallback(async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('wallet_switchEthereumChain', [
      { chainId: ethers.utils.hexValue(isVercel ? 1 : 5) },
    ]);
    await provider.send('eth_requestAccounts', []);
    await getAddress();
    const init = async () => {
      initReddio();
      const { publicKey, privateKey } =
        await reddio.keypair.generateFromEthSignature();
      console.log(publicKey, privateKey);
      addStarkKey(publicKey);
    };
    init();
  }, []);

  const handlePushClick = useCallback((path: string) => {
    if (history.location.pathname.includes(path)) return;
    history.push(path);
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(address);
    MessagePlugin.success('Copy Address Success!');
  }, [address]);

  useEffect(() => {
    getAddress();
  }, []);

  return (
    <div className={styles.accountHeaderWrapper}>
      {showRecord ? (
        <Record address={address} onClose={() => setShowRecord(false)} />
      ) : null}
      {showWithdrawal ? (
        <Withdrawal onClose={() => setShowWithdrawal(false)} />
      ) : null}
      <div className={styles.leftWrapper}>
        <img
          width={48}
          height={48}
          src={require('@/assets/user.png')}
          alt="user"
        />
        {address ? (
          <>
            <Text>
              {address.slice(0, 4)}...{address.slice(-4)}
            </Text>
            <Button shape="circle" variant="text" onClick={handleCopy}>
              <FileCopyIcon style={{ color: 'rgba(0, 0, 0, 0.9)' }} />
            </Button>
          </>
        ) : (
          <Button shape="round" onClick={connect}>
            Connect
          </Button>
        )}
      </div>
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
            Withdrawal Area
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
