import styles from '@/components/nft/index.less';
import { Col, Image } from 'tdesign-react';
import Text from '@/components/typography';
import { getTokenURI } from '@/utils/util';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface INFTPros {
  tokenId?: string;
  image?: string;
  type: string;
}

const NFT = ({ tokenId, image, type }: INFTPros) => {
  const [imageUrl, setImageUrl] = useState(image);
  useEffect(() => {
    const init = async () => {
      const uri = await getTokenURI(Number(tokenId!));
      const { data } = await axios.get(uri);
      setImageUrl(data.image);
    };
    type === 'l1' && init();
  });

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
