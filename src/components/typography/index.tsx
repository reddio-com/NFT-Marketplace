import { PropsWithChildren } from 'react';
import styles from './index.less';

interface ITextProps extends PropsWithChildren {
  type?: 'normal' | 'bold';
  color?: string;
}

const Text = (props: ITextProps) => {
  const { color, type, children } = props;
  const className = type === 'bold' ? styles.bold : styles.text;
  const style = color ? { color } : {};
  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
};

export default Text;
