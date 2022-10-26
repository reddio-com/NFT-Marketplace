import { history } from 'umi';
import Text from '@/components/typography';
import { Button } from 'tdesign-react';
import { ArrowLeftIcon } from 'tdesign-icons-react';
import styles from './index.less';

const Back = ({ children, buttonText, handleClick }: any) => {
  return (
    <div className={styles.backWrapper}>
      <div>
        <Button
          shape="circle"
          variant="text"
          icon={<ArrowLeftIcon />}
          onClick={() => history.back()}
        />
        <Text type="bold">{children}</Text>
      </div>
      {buttonText ? <Button onClick={handleClick}>{buttonText}</Button> : null}
    </div>
  );
};

export default Back;
