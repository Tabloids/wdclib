
// import webpack from 'webpack';
import { resolve } from 'path';
import { getBuildNumber } from './DevUtils/BuildNumber';

const BUILD_NUMBER = getBuildNumber({ showLog: true });

// const [MAYOR, MINOR, PATCH, ...rest] = BUILD_NUMBER.split('.');

console.log(`Building Version: ${BUILD_NUMBER}`);

export default {
    devtool: 'cheap-module-inline-source-map',
    entry: './index',
    output: {
        path: resolve('dist'),
        filename: 'bundle.js'
    }
};
