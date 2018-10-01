import webpack from 'webpack';
import baseConfig from './webpack.config.babel';

// Add the minifying plugin for production
let minifier = new webpack.optimize.UglifyJsPlugin();

baseConfig.plugins.push(minifier);

// Update the file name we output
baseConfig.output.filename = 'bundle.min.js';

export default baseConfig;
