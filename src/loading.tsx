import { Loading } from 'tdesign-react';

export default () => {
  return <Loading
    delay={0}
    fullscreen={false}
    indicator
    inheritColor={false}
    loading
    preventScrollThrough
    showOverlay
    size="medium"
  />
}