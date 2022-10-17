export default {
  npmClient: 'yarn',
  mfsu: false,
  hash: true,
  define: {
    'process.env.IS_VERCEL': process.env.IS_VERCEL,
  },
};
