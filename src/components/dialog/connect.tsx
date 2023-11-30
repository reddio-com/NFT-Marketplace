import { Button } from 'tdesign-react';
import Text from '../typography';
import styles from './index.less';
import { useCallback, useEffect, useState } from 'react';
import { watchAccount } from '@wagmi/core';
import { reddio } from '@/utils/config';
import { Loading } from 'tdesign-react';
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from '@rainbow-me/rainbowkit';
import { CheckCircleFilledIcon } from 'tdesign-icons-react';
import { addStarkKey } from '@/utils/store';
import { generateKey } from '@/utils/util';

const steps = ['Switch network', 'Connect to wallet', 'Get stark key'];

interface ConnectDialogProps {
  onSuccess: () => void;
}

const ConnectDialog = ({ onSuccess }: ConnectDialogProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();

  const changeNetwork = useCallback(async () => {
    openConnectModal?.();
    setStepIndex(2);
  }, []);

  useEffect(() => {
    watchAccount(async (account) => {
      if (account.address) {
        const { publicKey } = await generateKey();
        addStarkKey(publicKey);
        window.localStorage.setItem('isFirst', '1');
        onSuccess();
      }
    });
  }, []);

  return (
    <div className={styles.connectDialogWrapper}>
      <div>
        <img src={require('@/assets/shadowLogo.png')} alt="" />
        <Text color="#8B8B8B">In order to test this demo, you need</Text>
        <div>
          {steps.map((step, index) => (
            <div key={index}>
              {index + 1 <= stepIndex ? (
                <CheckCircleFilledIcon color="#48C79C" />
              ) : (
                <Text>{index + 1}、</Text>
              )}
              <Text>{step}</Text>
            </div>
          ))}
        </div>
        <Button
          block
          shape="round"
          size="large"
          onClick={changeNetwork}
          disabled={loading}
        >
          {loading ? (
            <Loading
              style={{ color: '#fff', position: 'relative', top: '-1px' }}
            />
          ) : (
            'Connect'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConnectDialog;
