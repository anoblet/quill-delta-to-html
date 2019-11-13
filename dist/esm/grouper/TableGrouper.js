import { TableGroup, BlockGroup, TableRow, TableCell } from './group-types';
import { groupConsecutiveElementsWhile } from '../helpers/array';
var TableGrouper = (function () {
    function TableGrouper() {
    }
    TableGrouper.prototype.group = function (groups) {
        var tableBlocked = this.convertTableBlocksToTableGroups(groups);
        return tableBlocked;
    };
    TableGrouper.prototype.convertTableBlocksToTableGroups = function (items) {
        var _this = this;
        var grouped = groupConsecutiveElementsWhile(items, function (g, gPrev) {
            return (g instanceof BlockGroup &&
                gPrev instanceof BlockGroup &&
                g.op.isTable() &&
                gPrev.op.isTable());
        });
        return grouped.map(function (item) {
            if (!Array.isArray(item)) {
                if (item instanceof BlockGroup && item.op.isTable()) {
                    return new TableGroup([new TableRow([new TableCell(item)])]);
                }
                return item;
            }
            return new TableGroup(_this.convertTableBlocksToTableRows(item));
        });
    };
    TableGrouper.prototype.convertTableBlocksToTableRows = function (items) {
        var grouped = groupConsecutiveElementsWhile(items, function (g, gPrev) {
            return (g instanceof BlockGroup &&
                gPrev instanceof BlockGroup &&
                g.op.isTable() &&
                gPrev.op.isTable() &&
                g.op.isSameTableRowAs(gPrev.op));
        });
        return grouped.map(function (item) {
            return new TableRow(Array.isArray(item)
                ? item.map(function (it) { return new TableCell(it); })
                : [new TableCell(item)]);
        });
    };
    return TableGrouper;
}());
export { TableGrouper };
