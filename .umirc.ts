export default {
  npmClient: 'yarn',
  jsMinifier: 'terser',
  mfsu: false,
  hash: true,
  define: {
    'process.env.IS_VERCEL': process.env.IS_VERCEL,
    'process.env.API_ENV': process.env.API_ENV,
  },
  scripts: [
    {
      src: 'https://www.googletagmanager.com/gtag/js?id=G-CY76W1E7KD',
      async: true,
    },
  ],
  title: 'Reddio Demos',
};
