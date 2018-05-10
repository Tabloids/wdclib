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

    console.log('Done runing build processes');

    // Copying files over
    let buildNumber = new VersionNumber(getBuildNumber());

    // Build up the names for the regular and minified versions of the file
    let newFullFileName = WDC_LIB_PREFIX + buildNumber.toString() + '.js';
    let newMinFileName = WDC_LIB_PREFIX + buildNumber.toString() + '.min.js';

    // Build up the names for the latest versions of the file
    let latestBuildName = buildNumber.major + '.' + buildNumber.minor + '.latest';
    let newLatestFullFileName = WDC_LIB_PREFIX + latestBuildName + '.js';
    let newLatestMinFileName = WDC_LIB_PREFIX + latestBuildName + '.min.js';

    let copyPairs = [
        { src: 'bundle.js', dest: newFullFileName },
        { src: 'bundle.min.js', dest: newMinFileName },
        { src: 'bundle.js', dest: newLatestFullFileName },
        { src: 'bundle.min.js', dest: newLatestMinFileName }
    ];

    console.log('\n\nMake version -> Copy files to destination');
    // Go through and copy all the files
    for (let pair of copyPairs) {
        let srcPath = path.join(__dirname, '.', 'dist', pair.src);
        let dstPath = path.join(__dirname, '.', 'versions', pair.dest);

        console.log("Copying '" + srcPath + "' to '" + dstPath + "'");
        fs.copySync(srcPath, dstPath);
    }

    console.log('\n\nMake version done -> ♥ \n\n');

} catch (e) {
    debugger;
    console.error('Error encountered');
    console.error(e.toString());
}
