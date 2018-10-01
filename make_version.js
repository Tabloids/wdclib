#!/usr/bin/env node
/* globals __dirname, require */

import { VersionNumber, getBuildNumber, WDC_LIB_PREFIX } from './DevUtils/BuildNumber';
import fs from 'fs-extra';
import path from 'path';

let execSync = require('child_process').execSync;

// wrap everything in a try catch so we can log any errors we see
try {
    console.log('\n\nMake version is running -> build');
    execSync('npm run-script build');

    console.log('\n\nMake version is running -> build minify');
    execSync('npm run-script build_min');

    console.log('\n\nMake version -> Done runing build processes');

    // Prepare version number
    let versionNumber = new VersionNumber(getBuildNumber());

    // Build up the name for the regular and minified versions of the file
    let fullVersionName = `${WDC_LIB_PREFIX}${versionNumber.toString()}`;

    // Build up the names for the latest versions of the file
    let latestBuildName = `${WDC_LIB_PREFIX}${versionNumber.major}.${versionNumber.minor}.latest`;

    let copyPairs = [
        { src: 'bundle.js', dest: `${fullVersionName}.js` },
        { src: 'bundle.min.js', dest: `${fullVersionName}.min.js` },
        { src: 'bundle.js', dest: `${latestBuildName}.js` },
        { src: 'bundle.min.js', dest: `${latestBuildName}.min.js` }
    ];

    console.log('\n\nMake version -> Copy files to destination');
    // Go through and copy all the files
    for (let pair of copyPairs) {
        let srcPath = path.join(__dirname, '.', 'dist', pair.src);
        let dstPath = path.join(__dirname, '.', 'versions', pair.dest);

        console.log(`Copying ${srcPath} to ${dstPath}`);

        fs.copySync(srcPath, dstPath);
    }

    console.log('\n\nMake version done -> ♥ \n\n');

} catch (e) {
    debugger; // eslint-disable-line no-debugger
    console.error('Error encountered');
    console.error(e.toString());
}
