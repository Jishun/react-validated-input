module.exports = {
    entry: "./test/entry.js",
    output: {
        filename: "bundle.js",
        publicPath: "/test/"
    },
    module: {
        loaders: [
             { test: /\.js$/, loader: 'babel-loader'}
            ,{ test: /\.css$/, loader: "style-loader!css-loader" },
            ,{ test: /\.woff$/, loader: "file-loader" }
            ,{ test: /\.woff2$/, loader: "file-loader" }
            ,{ test: /\.svg$/, loader: "file-loader" }
            ,{ test: /\.ttf$/, loader: "file-loader" }
            ,{ test: /\.eot$/, loader: "file-loader" }
        ]
    }
};
