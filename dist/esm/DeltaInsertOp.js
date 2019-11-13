import { NewLine, ListType, DataType } from './value-types';
import { InsertDataCustom, InsertDataQuill } from './InsertData';
var DeltaInsertOp = (function () {
    function DeltaInsertOp(insertVal, attrs) {
        if (typeof insertVal === 'string') {
            insertVal = new InsertDataQuill(DataType.Text, insertVal + '');
        }
        this.insert = insertVal;
        this.attributes = attrs || {};
    }
    DeltaInsertOp.createNewLineOp = function () {
        return new DeltaInsertOp(NewLine);
    };
    DeltaInsertOp.prototype.isContainerBlock = function () {
        var attrs = this.attributes;
        return !!(attrs.blockquote ||
            attrs.list ||
            attrs.table ||
            attrs['code-block'] ||
            attrs.header ||
            attrs.align ||
            attrs.direction ||
            attrs.indent);
    };
    DeltaInsertOp.prototype.isBlockquote = function () {
        return !!this.attributes.blockquote;
    };
    DeltaInsertOp.prototype.isHeader = function () {
        return !!this.attributes.header;
    };
    DeltaInsertOp.prototype.isTable = function () {
        return !!this.attributes.table;
    };
    DeltaInsertOp.prototype.isSameHeaderAs = function (op) {
        return op.attributes.header === this.attributes.header && this.isHeader();
    };
    DeltaInsertOp.prototype.hasSameAdiAs = function (op) {
        return (this.attributes.align === op.attributes.align &&
            this.attributes.direction === op.attributes.direction &&
            this.attributes.indent === op.attributes.indent);
    };
    DeltaInsertOp.prototype.hasSameIndentationAs = function (op) {
        return this.attributes.indent === op.attributes.indent;
    };
    DeltaInsertOp.prototype.hasHigherIndentThan = function (op) {
        return ((Number(this.attributes.indent) || 0) >
            (Number(op.attributes.indent) || 0));
    };
    DeltaInsertOp.prototype.isInline = function () {
        return !(this.isContainerBlock() || this.isVideo() || this.isCustomBlock());
    };
    DeltaInsertOp.prototype.isCodeBlock = function () {
        return !!this.attributes['code-block'];
    };
    DeltaInsertOp.prototype.hasSameLangAs = function (op) {
        return this.attributes['code-block'] === op.attributes['code-block'];
    };
    DeltaInsertOp.prototype.isJustNewline = function () {
        return this.insert.value === NewLine;
    };
    DeltaInsertOp.prototype.isList = function () {
        return (this.isOrderedList() ||
            this.isBulletList() ||
            this.isCheckedList() ||
            this.isUncheckedList());
    };
    DeltaInsertOp.prototype.isOrderedList = function () {
        return this.attributes.list === ListType.Ordered;
    };
    DeltaInsertOp.prototype.isBulletList = function () {
        return this.attributes.list === ListType.Bullet;
    };
    DeltaInsertOp.prototype.isCheckedList = function () {
        return this.attributes.list === ListType.Checked;
    };
    DeltaInsertOp.prototype.isUncheckedList = function () {
        return this.attributes.list === ListType.Unchecked;
    };
    DeltaInsertOp.prototype.isACheckList = function () {
        return (this.attributes.list == ListType.Unchecked ||
            this.attributes.list === ListType.Checked);
    };
    DeltaInsertOp.prototype.isSameListAs = function (op) {
        return (!!op.attributes.list &&
            (this.attributes.list === op.attributes.list ||
                (op.isACheckList() && this.isACheckList())));
    };
    DeltaInsertOp.prototype.isSameTableRowAs = function (op) {
        return (!!op.isTable() &&
            this.isTable() &&
            this.attributes.table === op.attributes.table);
    };
    DeltaInsertOp.prototype.isText = function () {
        return this.insert.type === DataType.Text;
    };
    DeltaInsertOp.prototype.isImage = function () {
        return this.insert.type === DataType.Image;
    };
    DeltaInsertOp.prototype.isFormula = function () {
        return this.insert.type === DataType.Formula;
    };
    DeltaInsertOp.prototype.isVideo = function () {
        return this.insert.type === DataType.Video;
    };
    DeltaInsertOp.prototype.isLink = function () {
        return this.isText() && !!this.attributes.link;
    };
    DeltaInsertOp.prototype.isCustom = function () {
        return this.insert instanceof InsertDataCustom;
    };
    DeltaInsertOp.prototype.isCustomBlock = function () {
        return this.isCustom() && !!this.attributes.renderAsBlock;
    };
    DeltaInsertOp.prototype.isMentions = function () {
        return this.isText() && !!this.attributes.mentions;
    };
    return DeltaInsertOp;
}());
export { DeltaInsertOp };
