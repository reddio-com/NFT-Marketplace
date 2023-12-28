import styles from '@/components/nft/index.less';
import { Col, Image } from 'tdesign-react';
import Text from '@/components/typography';
import { getTokenURI } from '@/utils/util';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface INFTPros {
  tokenId?: string;
  type: string;
  baseUri?: string;
}

const getMetadata = (id: string) => {
  return axios.get<any>(
    `https://track-dev.reddio.com/api/meta-data?filters[tokenid][$eq]=${id}`,
  );
};

const NFT = ({ tokenId, type, baseUri }: INFTPros) => {
  const [imageUrl, setImageUrl] = useState('');
  useEffect(() => {
    const init = async () => {
      const uri = await getTokenURI(Number(tokenId!));
      const { data } = await axios.get(uri);
      setImageUrl(data.image);
    };
    type === 'l1' && init();
    if (baseUri) {
      const getCustomData = async () => {
        const base = baseUri.endsWith('/') ? baseUri : baseUri + '/';
        if (baseUri.includes('reddiousermetadata')) {
          try {
            const { data } = await axios.get(
              `${baseUri}${tokenId}/metadata.json`,
            );
            setImageUrl(data.image || data.media);
          } catch (e) {
            getMetadata(tokenId!).then((res: any) => {
              const length = res.data.data.length;
              if (length > 0) {
                setImageUrl(res.data.data[length - 1].attributes.url);
              }
            });
          }
          return;
        }
        const { data } = await axios.get(
          `/api/token?baseUrl=${encodeURIComponent(baseUri)}&tokenId=${Number(
            tokenId!,
          )}`,
        );
        setImageUrl(data.image);
      };
      getCustomData();
    }
  }, []);

  return (
    <Col flex="190px" className={styles.nft}>
      <div>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            style={{ width: '100%', height: '100%', background: 'none' }}
          />
        ) : null}
      </div>
      <Text>TokenId: {tokenId}</Text>
    </Col>
  );
};

export default NFT;
