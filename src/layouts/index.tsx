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

const footerIconLinks = [
  {
    label: 'Linkedin',
    href: 'https://www.linkedin.com/company/reddio',
    img: require('@/assets/footerIcon/social/linkedin.png'),
  },
  {
    label: 'Github',
    href: 'https://github.com/reddio-com/NFT-Marketplace',
    img: require('@/assets/footerIcon/social/github.png'),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/reddiocom',
    img: require('@/assets/footerIcon/social/facebook.png'),
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com/reddio_com',
    img: require('@/assets/footerIcon/social/twitter.png'),
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/SjNAJ4qkK3',
    img: require('@/assets/footerIcon/social/discord.png'),
  },
]

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
        <footer className={styles.footer}>
          <div>
            {
              footerIconLinks.map((icon) => {
                return <img src={icon.img} className={styles.icon} onClick={() => window.open(icon.href, '__blank')} />
              })
            }
          </div>
          <div className={styles.footerInfo}>Copyright © {new Date().getFullYear()} Reddio. All rights reserved.</div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
