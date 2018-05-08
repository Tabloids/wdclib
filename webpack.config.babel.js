
import webpack from 'webpack';
import { resolve } from 'path';
import * as BuildNumber from './DevUtils/BuildNumber';

// Try to get the build number we should use
try {
    var buildNum = BuildNumber.getBuildNumber().toString();
} catch (e) {
    console.error('Could not parse build number :(');
    console.error(e.toString());
    // return; // syntax error return outside a function
}

export default {
    devtool: 'cheap-module-inline-source-map',
    entry: './index',
    output: {
        path: resolve('dist'),
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            'BUILD_NUMBER': JSON.stringify(buildNum)
        }),
        new webpack.BannerPlugin('Build Number: ' + buildNum)
    ]
};
