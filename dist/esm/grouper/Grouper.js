import { DeltaInsertOp } from './../DeltaInsertOp';
import { flatten, groupConsecutiveElementsWhile, sliceFromReverseWhile } from './../helpers/array';
import { VideoItem, InlineGroup, BlockGroup, BlotBlock } from './group-types';
var Grouper = (function () {
    function Grouper() {
    }
    Grouper.pairOpsWithTheirBlock = function (ops) {
        var result = [];
        var canBeInBlock = function (op) {
            return !(op.isJustNewline() ||
                op.isCustomBlock() ||
                op.isVideo() ||
                op.isContainerBlock());
        };
        var isInlineData = function (op) { return op.isInline(); };
        var lastInd = ops.length - 1;
        var opsSlice;
        for (var i = lastInd; i >= 0; i--) {
            var op = ops[i];
            if (op.isVideo()) {
                result.push(new VideoItem(op));
            }
            else if (op.isCustomBlock()) {
                result.push(new BlotBlock(op));
            }
            else if (op.isContainerBlock()) {
                opsSlice = sliceFromReverseWhile(ops, i - 1, canBeInBlock);
                result.push(new BlockGroup(op, opsSlice.elements));
                i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;
            }
            else {
                opsSlice = sliceFromReverseWhile(ops, i - 1, isInlineData);
                result.push(new InlineGroup(opsSlice.elements.concat(op)));
                i = opsSlice.sliceStartsAt > -1 ? opsSlice.sliceStartsAt : i;
            }
        }
        result.reverse();
        return result;
    };
    Grouper.groupConsecutiveSameStyleBlocks = function (groups, blocksOf) {
        if (blocksOf === void 0) { blocksOf = {
            header: true,
            codeBlocks: true,
            blockquotes: true
        }; }
        return groupConsecutiveElementsWhile(groups, function (g, gPrev) {
            if (!(g instanceof BlockGroup) || !(gPrev instanceof BlockGroup)) {
                return false;
            }
            return ((blocksOf.codeBlocks &&
                Grouper.areBothCodeblocksWithSameLang(g, gPrev)) ||
                (blocksOf.blockquotes &&
                    Grouper.areBothBlockquotesWithSameAdi(g, gPrev)) ||
                (blocksOf.header && Grouper.areBothSameHeadersWithSameAdi(g, gPrev)));
        });
    };
    Grouper.reduceConsecutiveSameStyleBlocksToOne = function (groups) {
        var newLineOp = DeltaInsertOp.createNewLineOp();
        return groups.map(function (elm) {
            if (!Array.isArray(elm)) {
                if (elm instanceof BlockGroup && !elm.ops.length) {
                    elm.ops.push(newLineOp);
                }
                return elm;
            }
            var groupsLastInd = elm.length - 1;
            elm[0].ops = flatten(elm.map(function (g, i) {
                if (!g.ops.length) {
                    return [newLineOp];
                }
                return g.ops.concat(i < groupsLastInd ? [newLineOp] : []);
            }));
            return elm[0];
        });
    };
    Grouper.areBothCodeblocksWithSameLang = function (g1, gOther) {
        return (g1.op.isCodeBlock() &&
            gOther.op.isCodeBlock() &&
            g1.op.hasSameLangAs(gOther.op));
    };
    Grouper.areBothSameHeadersWithSameAdi = function (g1, gOther) {
        return g1.op.isSameHeaderAs(gOther.op) && g1.op.hasSameAdiAs(gOther.op);
    };
    Grouper.areBothBlockquotesWithSameAdi = function (g, gOther) {
        return (g.op.isBlockquote() &&
            gOther.op.isBlockquote() &&
            g.op.hasSameAdiAs(gOther.op));
    };
    return Grouper;
}());
export { Grouper };
