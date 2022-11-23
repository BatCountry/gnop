const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
	entry: './src/ts/index.ts',
	devtool: 'inline-source-map',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: "gnop.bundle.js",
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
    devServer: {
		static: './dist',
	},
	module: {
		rules: [
			{
				test: /\.ts?$/,
				exclude: /node_modules/,
				use: [
					{ loader: "ts-loader" }
				]
			},
			{
				test: /\.css$/,
				exclude: /node_modules/,
				use: [
					"style-loader",
					"css-loader"
				]
			}
		]
	},
	plugins: [
    new HtmlWebpackPlugin({
			template: './src/static/index.html',
			favicon: './src/static/favicon.gif'
		})
  ],
}
