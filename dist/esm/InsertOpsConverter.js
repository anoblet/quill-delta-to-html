import { DeltaInsertOp } from './DeltaInsertOp';
import { DataType } from './value-types';
import { InsertDataCustom, InsertDataQuill } from './InsertData';
import { OpAttributeSanitizer } from './OpAttributeSanitizer';
import { InsertOpDenormalizer } from './InsertOpDenormalizer';
var InsertOpsConverter = (function () {
    function InsertOpsConverter() {
    }
    InsertOpsConverter.convert = function (deltaOps, options) {
        if (!Array.isArray(deltaOps)) {
            return [];
        }
        var denormalizedOps = [].concat.apply([], deltaOps.map(InsertOpDenormalizer.denormalize));
        var results = [];
        var insertVal, attributes;
        for (var _i = 0, denormalizedOps_1 = denormalizedOps; _i < denormalizedOps_1.length; _i++) {
            var op = denormalizedOps_1[_i];
            if (!op.insert) {
                continue;
            }
            insertVal = InsertOpsConverter.convertInsertVal(op.insert, options);
            if (!insertVal) {
                continue;
            }
            attributes = OpAttributeSanitizer.sanitize(op.attributes, options);
            results.push(new DeltaInsertOp(insertVal, attributes));
        }
        return results;
    };
    InsertOpsConverter.convertInsertVal = function (insertPropVal, sanitizeOptions) {
        if (typeof insertPropVal === 'string') {
            return new InsertDataQuill(DataType.Text, insertPropVal);
        }
        if (!insertPropVal || typeof insertPropVal !== 'object') {
            return null;
        }
        var keys = Object.keys(insertPropVal);
        if (!keys.length) {
            return null;
        }
        return DataType.Image in insertPropVal
            ? new InsertDataQuill(DataType.Image, OpAttributeSanitizer.sanitizeLinkUsingOptions(insertPropVal[DataType.Image] + '', sanitizeOptions))
            : DataType.Video in insertPropVal
                ? new InsertDataQuill(DataType.Video, OpAttributeSanitizer.sanitizeLinkUsingOptions(insertPropVal[DataType.Video] + '', sanitizeOptions))
                : DataType.Formula in insertPropVal
                    ? new InsertDataQuill(DataType.Formula, insertPropVal[DataType.Formula])
                    :
                        new InsertDataCustom(keys[0], insertPropVal[keys[0]]);
    };
    return InsertOpsConverter;
}());
export { InsertOpsConverter };
