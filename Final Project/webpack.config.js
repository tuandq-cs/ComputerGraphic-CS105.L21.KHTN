const path = require("path");

module.exports = {
    mode: 'development',
    entry: path.resolve(__dirname,'app','src','Main.js'),
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        clean: true,
    },
    module: {
        rules: [
          {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
          },
        ],
    },
    devServer: {
        contentBase: [
            path.join(__dirname, "public"),
            path.resolve(__dirname, "dist"),
        ],
        port: 3000,
    },
};