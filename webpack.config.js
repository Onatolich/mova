const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const outputDir = path.resolve(__dirname, 'dist');

module.exports = {
  devtool: 'source-map',

  context: path.resolve(__dirname, 'src'),

  entry: {
    main: './index.js',
  },

  output: {
    path: outputDir,
    filename: 'index.js',
    library: 'mova',
    libraryTarget: 'commonjs2',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin([outputDir], { verbose: false }),
  ],
};
