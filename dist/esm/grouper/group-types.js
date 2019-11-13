var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var InlineGroup = (function () {
    function InlineGroup(ops) {
        this.ops = ops;
    }
    return InlineGroup;
}());
var SingleItem = (function () {
    function SingleItem(op) {
        this.op = op;
    }
    return SingleItem;
}());
var VideoItem = (function (_super) {
    __extends(VideoItem, _super);
    function VideoItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VideoItem;
}(SingleItem));
var BlotBlock = (function (_super) {
    __extends(BlotBlock, _super);
    function BlotBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BlotBlock;
}(SingleItem));
var BlockGroup = (function () {
    function BlockGroup(op, ops) {
        this.op = op;
        this.ops = ops;
    }
    return BlockGroup;
}());
var ListGroup = (function () {
    function ListGroup(items) {
        this.items = items;
    }
    return ListGroup;
}());
var ListItem = (function () {
    function ListItem(item, innerList) {
        if (innerList === void 0) { innerList = null; }
        this.item = item;
        this.innerList = innerList;
    }
    return ListItem;
}());
var TableGroup = (function () {
    function TableGroup(rows) {
        this.rows = rows;
    }
    return TableGroup;
}());
var TableRow = (function () {
    function TableRow(cells) {
        this.cells = cells;
    }
    return TableRow;
}());
var TableCell = (function () {
    function TableCell(item) {
        this.item = item;
    }
    return TableCell;
}());
export { VideoItem, BlotBlock, InlineGroup, BlockGroup, ListGroup, ListItem, TableGroup, TableRow, TableCell };
