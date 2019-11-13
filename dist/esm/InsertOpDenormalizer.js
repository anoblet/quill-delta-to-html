import { NewLine } from './value-types';
import * as str from './helpers/string';
import * as obj from './helpers/object';
var InsertOpDenormalizer = (function () {
    function InsertOpDenormalizer() {
    }
    InsertOpDenormalizer.denormalize = function (op) {
        if (!op || typeof op !== 'object') {
            return [];
        }
        if (typeof op.insert === 'object' || op.insert === NewLine) {
            return [op];
        }
        var newlinedArray = str.tokenizeWithNewLines(op.insert + '');
        if (newlinedArray.length === 1) {
            return [op];
        }
        var nlObj = obj.assign({}, op, { insert: NewLine });
        return newlinedArray.map(function (line) {
            if (line === NewLine) {
                return nlObj;
            }
            return obj.assign({}, op, {
                insert: line
            });
        });
    };
    return InsertOpDenormalizer;
}());
export { InsertOpDenormalizer };
