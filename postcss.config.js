const cssNano =
  process.env.HUGO_ENV === 'production'
    ? [
        require('cssnano')({
          preset: 'default',
        }),
      ]
    : [];

module.exports = {
  plugins: [require('autoprefixer'), ...cssNano],
};
