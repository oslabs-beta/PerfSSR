const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env) => {
  return {
    entry: {
      index: path.resolve(__dirname, "./src/index.js"),
      backend: "./backend/index.js",
      contentScript: "./extension/contentScript.ts",
      background: "./extension/background.ts",
      devtools: "./extension/devtools.ts",
    },
    output: {
      path: path.join(__dirname, "./dist/bundles"),
      publicPath: "/",
      filename: "[name].bundle.js",
    },

    mode: env.NODE_ENV,

    plugins: [
      new HTMLWebpackPlugin({
        template: "./src/index.html",
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "./extension"),
            to: path.resolve(__dirname, "./dist"),
          },
        ],
      }),
    ],

    module: {
      rules: [
        {
          test: /.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        },
        {
          test: /.(css|scss)$/,
          exclude: /node_modules/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      // Enable importing JS / JSX files without specifying their extension
      extensions: ['.jsx', '.js', '.tsx', '.ts'],
    },
  };
};
