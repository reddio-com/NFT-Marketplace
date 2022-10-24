// ${projectRoot}/plugin.ts

import { IApi } from 'umi';

export default (api: IApi) => {
  api.modifyHTML(($) => {
    $('#root').after([
      `<script>
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag('js', new Date());

gtag('config', 'G-CY76W1E7KD');
</script>`,
    ]);
    return $;
  });
};
