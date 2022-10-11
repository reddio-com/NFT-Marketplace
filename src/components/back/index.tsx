import { PropsWithChildren } from 'react';
import { history } from 'umi';
import Text from '@/components/typography';
import { Button } from 'tdesign-react';
import { ArrowLeftIcon } from 'tdesign-icons-react';
import styles from './index.less';

const Back = ({ children }: PropsWithChildren) => {
  return (
    <div className={styles.backWrapper}>
      <Button
        shape="circle"
        variant="text"
        icon={<ArrowLeftIcon />}
        onClick={() => history.back()}
      />
      <Text type="bold">{children}</Text>
    </div>
  );
};

export default Back;
