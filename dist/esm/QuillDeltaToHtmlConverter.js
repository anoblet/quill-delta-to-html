import { InsertOpsConverter } from './InsertOpsConverter';
import { OpToHtmlConverter } from './OpToHtmlConverter';
import { Grouper } from './grouper/Grouper';
import { VideoItem, BlockGroup, ListGroup, BlotBlock, TableGroup } from './grouper/group-types';
import { ListNester } from './grouper/ListNester';
import { makeStartTag, makeEndTag, encodeHtml } from './funcs-html';
import * as obj from './helpers/object';
import { GroupType } from './value-types';
import { TableGrouper } from './grouper/TableGrouper';
var BrTag = '<br/>';
var QuillDeltaToHtmlConverter = (function () {
    function QuillDeltaToHtmlConverter(deltaOps, options) {
        this.rawDeltaOps = [];
        this.callbacks = {};
        this.options = obj.assign({
            paragraphTag: 'p',
            encodeHtml: true,
            classPrefix: 'ql',
            inlineStyles: false,
            multiLineBlockquote: true,
            multiLineHeader: true,
            multiLineCodeblock: true,
            multiLineParagraph: true,
            allowBackgroundClasses: false,
            linkTarget: '_blank'
        }, options, {
            orderedListTag: 'ol',
            bulletListTag: 'ul',
            listItemTag: 'li'
        });
        var inlineStyles;
        if (!this.options.inlineStyles) {
            inlineStyles = undefined;
        }
        else if (typeof this.options.inlineStyles === 'object') {
            inlineStyles = this.options.inlineStyles;
        }
        else {
            inlineStyles = {};
        }
        this.converterOptions = {
            encodeHtml: this.options.encodeHtml,
            classPrefix: this.options.classPrefix,
            inlineStyles: inlineStyles,
            listItemTag: this.options.listItemTag,
            paragraphTag: this.options.paragraphTag,
            linkRel: this.options.linkRel,
            linkTarget: this.options.linkTarget,
            allowBackgroundClasses: this.options.allowBackgroundClasses
        };
        this.rawDeltaOps = deltaOps;
    }
    QuillDeltaToHtmlConverter.prototype._getListTag = function (op) {
        return op.isOrderedList()
            ? this.options.orderedListTag + ''
            : op.isBulletList()
                ? this.options.bulletListTag + ''
                : op.isCheckedList()
                    ? this.options.bulletListTag + ''
                    : op.isUncheckedList()
                        ? this.options.bulletListTag + ''
                        : '';
    };
    QuillDeltaToHtmlConverter.prototype.getGroupedOps = function () {
        var deltaOps = InsertOpsConverter.convert(this.rawDeltaOps, this.options);
        var pairedOps = Grouper.pairOpsWithTheirBlock(deltaOps);
        var groupedSameStyleBlocks = Grouper.groupConsecutiveSameStyleBlocks(pairedOps, {
            blockquotes: !!this.options.multiLineBlockquote,
            header: !!this.options.multiLineHeader,
            codeBlocks: !!this.options.multiLineCodeblock
        });
        var groupedOps = Grouper.reduceConsecutiveSameStyleBlocksToOne(groupedSameStyleBlocks);
        var tableGrouper = new TableGrouper();
        groupedOps = tableGrouper.group(groupedOps);
        var listNester = new ListNester();
        return listNester.nest(groupedOps);
    };
    QuillDeltaToHtmlConverter.prototype.convert = function () {
        var _this = this;
        var groups = this.getGroupedOps();
        return groups
            .map(function (group) {
            if (group instanceof ListGroup) {
                return _this._renderWithCallbacks(GroupType.List, group, function () {
                    return _this._renderList(group);
                });
            }
            else if (group instanceof TableGroup) {
                return _this._renderWithCallbacks(GroupType.Table, group, function () {
                    return _this._renderTable(group);
                });
            }
            else if (group instanceof BlockGroup) {
                var g = group;
                return _this._renderWithCallbacks(GroupType.Block, group, function () {
                    return _this._renderBlock(g.op, g.ops);
                });
            }
            else if (group instanceof BlotBlock) {
                return _this._renderCustom(group.op, null);
            }
            else if (group instanceof VideoItem) {
                return _this._renderWithCallbacks(GroupType.Video, group, function () {
                    var g = group;
                    var converter = new OpToHtmlConverter(g.op, _this.converterOptions);
                    return converter.getHtml();
                });
            }
            else {
                return _this._renderWithCallbacks(GroupType.InlineGroup, group, function () {
                    return _this._renderInlines(group.ops, true);
                });
            }
        })
            .join('');
    };
    QuillDeltaToHtmlConverter.prototype._renderWithCallbacks = function (groupType, group, myRenderFn) {
        var html = '';
        var beforeCb = this.callbacks['beforeRender_cb'];
        html =
            typeof beforeCb === 'function'
                ? beforeCb.apply(null, [groupType, group])
                : '';
        if (!html) {
            html = myRenderFn();
        }
        var afterCb = this.callbacks['afterRender_cb'];
        html =
            typeof afterCb === 'function'
                ? afterCb.apply(null, [groupType, html])
                : html;
        return html;
    };
    QuillDeltaToHtmlConverter.prototype._renderList = function (list) {
        var _this = this;
        var firstItem = list.items[0];
        return (makeStartTag(this._getListTag(firstItem.item.op)) +
            list.items.map(function (li) { return _this._renderListItem(li); }).join('') +
            makeEndTag(this._getListTag(firstItem.item.op)));
    };
    QuillDeltaToHtmlConverter.prototype._renderListItem = function (li) {
        li.item.op.attributes.indent = 0;
        var converter = new OpToHtmlConverter(li.item.op, this.converterOptions);
        var parts = converter.getHtmlParts();
        var liElementsHtml = this._renderInlines(li.item.ops, false);
        return (parts.openingTag +
            liElementsHtml +
            (li.innerList ? this._renderList(li.innerList) : '') +
            parts.closingTag);
    };
    QuillDeltaToHtmlConverter.prototype._renderTable = function (table) {
        var _this = this;
        return (makeStartTag('table') +
            makeStartTag('tbody') +
            table.rows.map(function (row) { return _this._renderTableRow(row); }).join('') +
            makeEndTag('tbody') +
            makeEndTag('table'));
    };
    QuillDeltaToHtmlConverter.prototype._renderTableRow = function (row) {
        var _this = this;
        return (makeStartTag('tr') +
            row.cells.map(function (cell) { return _this._renderTableCell(cell); }).join('') +
            makeEndTag('tr'));
    };
    QuillDeltaToHtmlConverter.prototype._renderTableCell = function (cell) {
        var converter = new OpToHtmlConverter(cell.item.op, this.converterOptions);
        var parts = converter.getHtmlParts();
        var cellElementsHtml = this._renderInlines(cell.item.ops, false);
        return (makeStartTag('td', {
            key: 'data-row',
            value: cell.item.op.attributes.table
        }) +
            parts.openingTag +
            cellElementsHtml +
            parts.closingTag +
            makeEndTag('td'));
    };
    QuillDeltaToHtmlConverter.prototype._renderBlock = function (bop, ops) {
        var _this = this;
        var converter = new OpToHtmlConverter(bop, this.converterOptions);
        var htmlParts = converter.getHtmlParts();
        if (bop.isCodeBlock()) {
            return (htmlParts.openingTag +
                encodeHtml(ops
                    .map(function (iop) {
                    return iop.isCustom() ? _this._renderCustom(iop, bop) : iop.insert.value;
                })
                    .join('')) +
                htmlParts.closingTag);
        }
        var inlines = ops.map(function (op) { return _this._renderInline(op, bop); }).join('');
        return htmlParts.openingTag + (inlines || BrTag) + htmlParts.closingTag;
    };
    QuillDeltaToHtmlConverter.prototype._renderInlines = function (ops, isInlineGroup) {
        var _this = this;
        if (isInlineGroup === void 0) { isInlineGroup = true; }
        var opsLen = ops.length - 1;
        var html = ops
            .map(function (op, i) {
            if (i > 0 && i === opsLen && op.isJustNewline()) {
                return '';
            }
            return _this._renderInline(op, null);
        })
            .join('');
        if (!isInlineGroup) {
            return html;
        }
        var startParaTag = makeStartTag(this.options.paragraphTag);
        var endParaTag = makeEndTag(this.options.paragraphTag);
        if (html === BrTag || this.options.multiLineParagraph) {
            return startParaTag + html + endParaTag;
        }
        return (startParaTag +
            html
                .split(BrTag)
                .map(function (v) {
                return v === '' ? BrTag : v;
            })
                .join(endParaTag + startParaTag) +
            endParaTag);
    };
    QuillDeltaToHtmlConverter.prototype._renderInline = function (op, contextOp) {
        if (op.isCustom()) {
            return this._renderCustom(op, contextOp);
        }
        var converter = new OpToHtmlConverter(op, this.converterOptions);
        return converter.getHtml().replace(/\n/g, BrTag);
    };
    QuillDeltaToHtmlConverter.prototype._renderCustom = function (op, contextOp) {
        var renderCb = this.callbacks['renderCustomOp_cb'];
        if (typeof renderCb === 'function') {
            return renderCb.apply(null, [op, contextOp]);
        }
        return '';
    };
    QuillDeltaToHtmlConverter.prototype.beforeRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['beforeRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.afterRender = function (cb) {
        if (typeof cb === 'function') {
            this.callbacks['afterRender_cb'] = cb;
        }
    };
    QuillDeltaToHtmlConverter.prototype.renderCustomWith = function (cb) {
        this.callbacks['renderCustomOp_cb'] = cb;
    };
    return QuillDeltaToHtmlConverter;
}());
export { QuillDeltaToHtmlConverter };
