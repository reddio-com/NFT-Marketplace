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
import { ConnectButton } from '@rainbow-me/rainbowkit';

import Alert from '@mui/material/Alert';
import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { goerli, mainnet } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { watchAccount, watchNetwork } from '@wagmi/core';
import { isVercel } from '@/utils/config';

const { chains, provider } = configureChains(
  [isVercel ? mainnet : goerli],
  [
    alchemyProvider({
      apiKey: isVercel
        ? 'rLJsa2qBOoeS497vaqqXv9besBxlGK3L'
        : '3En6dktpG2M1HPNQdoac0PERTR-MFaTW',
    }),
  ],
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

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
];

export default function Layout() {
  const [isFirst, setFirst] = useState(
    !Boolean(window.localStorage.getItem('isFirst')),
  );

  const [openAlert, setOpenAlert] = useState(true);

  const handleSuccess = useCallback(() => {
    setFirst(false);
    initReddio(wagmiClient);
  }, []);

  useEffect(() => {
    initReddio(wagmiClient);
    const init = async () => {
      const { publicKey, privateKey } =
        await reddio.keypair.generateFromEthSignature();
      console.log(publicKey, privateKey);
      addStarkKey(publicKey);
    };
    watchAccount((account) => {
      if (account.address) {
        !isFirst && init();
      } else {
        addStarkKey('');
      }
    });
    watchNetwork((network) => {
      const chainId = isVercel ? mainnet.id : goerli.id;
      if (network.chain?.id === chainId) {
        !isFirst && init();
      }
    });
  }, []);

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <QueryClientProvider client={queryClient}>
          <div className={styles.layout}>
            <header>
              <img src={require('@/assets/logo.png')} alt="" height={24} />
              <ConnectButton accountStatus="address" />
            </header>
            <div className={styles.container}>
              {isFirst ? (
                <ConnectDialog onSuccess={handleSuccess} />
              ) : (
                <>
                  <div className={styles.contentWrapper}>
                    <AccountHeader showAlert={openAlert} />
                    {openAlert && (
                      <Alert
                        severity="info"
                        onClose={() => setOpenAlert(false)}
                      >
                        Your transaction is going to be submitted to Layer2 and
                        will be proved on L1
                      </Alert>
                    )}
                    <Outlet />
                  </div>
                </>
              )}
            </div>
            <footer className={styles.footer}>
              <div>
                {footerIconLinks.map((icon, index) => {
                  return (
                    <img
                      key={index}
                      src={icon.img}
                      className={styles.icon}
                      onClick={() => window.open(icon.href, '__blank')}
                    />
                  );
                })}
              </div>
              <div className={styles.footerInfo}>
                Copyright © {new Date().getFullYear()} Reddio. All rights
                reserved.
              </div>
            </footer>
          </div>
        </QueryClientProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
