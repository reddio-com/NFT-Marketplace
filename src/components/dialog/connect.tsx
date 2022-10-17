import { Button } from 'tdesign-react';
import Text from '../typography';
import styles from './index.less';
import { useCallback, useState } from 'react';
import { ethers } from 'ethers';
import { initReddio, reddio, isVercel } from '@/utils/config';
import { Loading } from 'tdesign-react';
import { CheckCircleFilledIcon } from 'tdesign-icons-react';
import { initProviderAndSigner } from '@/utils/util';
import { addStarkKey } from '@/utils/store';

const steps = [
  'Switch network to goerli',
  'Connect to metamask account',
  'Get stark key',
];

interface ConnectDialogProps {
  onSuccess: () => void;
}

const ConnectDialog = ({ onSuccess }: ConnectDialogProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const changeNetwork = useCallback(async () => {
    setLoading(true);
    const { provider } = await initProviderAndSigner();
    await provider.send('wallet_switchEthereumChain', [
      { chainId: ethers.utils.hexValue(isVercel ? 1 : 5) },
    ]);
    setStepIndex(1);
    await provider.send('eth_requestAccounts', []);
    setStepIndex(2);
    initReddio();
    const { publicKey } = await reddio.keypair.generateFromEthSignature();
    addStarkKey(publicKey);
    window.localStorage.setItem('isFirst', '1');
    onSuccess();
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
