/* eslint-env node, mocha, jest */
import { ENUMS_DICTIONARY, applyEnums } from './Enums';

describe('UNIT - Enums', () => {

    it('applyEnums to copy properties from ENUMS_DICTIONARY target', () => {

        let target = {
            joinEnum: {
                inner: 'to be overwritten',
                left: 'to be overwritten'
            }
        };

        applyEnums(target);

        expect(target).toEqual(ENUMS_DICTIONARY);

    });
});
