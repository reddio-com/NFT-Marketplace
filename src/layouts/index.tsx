import { Outlet } from 'umi';
import 'tdesign-react/es/style/index.css';
import './reset.css';
import './theme.css';
import styles from './index.less';
import AccountHeader from '@/components/account/accountHeader';
import ConnectDialog from '@/components/dialog/connect';
import { useCallback, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initReddio, reddio } from '@/utils/config';
import { addStarkKey } from '@/utils/store';

const queryClient = new QueryClient();

export default function Layout() {
  const [isFirst, setFirst] = useState(
    !Boolean(window.localStorage.getItem('isFirst')),
  );

  const handleSuccess = useCallback(() => {
    setFirst(false);
    initReddio();
  }, []);

  useEffect(() => {
    const init = async () => {
      initReddio();
      const { publicKey, privateKey } = await reddio.keypair.generateFromEthSignature();
      console.log(publicKey, privateKey);
      addStarkKey(publicKey);
    };
    !isFirst && init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.layout}>
        <header>
          <img src={require('@/assets/logo.png')} alt="" height={24} />
        </header>
        <div className={styles.container}>
          {isFirst ? (
            <ConnectDialog onSuccess={handleSuccess} />
          ) : (
            <>
              <div className={styles.contentWrapper}>
                <AccountHeader />
                <Outlet />
              </div>
            </>
          )}
        </div>
      </div>
    </QueryClientProvider>
  );
}
