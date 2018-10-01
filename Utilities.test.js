/* eslint-env node, mocha, jest */
import { copyFunctions } from './Utilities';

describe('UNIT - Utilities', () => {

    it('copyFunctions to copy functions from source to target', () => {
        let source = {
            a: function a () {

            }
        };

        let target = {};

        copyFunctions(source, target);

        expect(target.a).toBe(source.a);

    });
});
