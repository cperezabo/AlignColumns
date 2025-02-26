/**
 *  @abstract
 */
class Alignment {
    /**
     * @protected
     */
    _paddingCharacter;

    constructor(paddingCharacter = ' ') {
        this._paddingCharacter = paddingCharacter;
    }

    changePaddingCharacter(paddingCharacter) {
        return new this.constructor(paddingCharacter)
    }

    /**
     *  @abstract
     */
    apply(content, width) {
    }
}

class LeftAlignment extends Alignment {
    apply(content, width) {
        return content + this._paddingCharacter.repeat(width - content.length)
    }
}

class RightAlignment extends Alignment {
    apply(content, width) {
        return this._paddingCharacter.repeat(width - content.length) + content
    }
}

class CenterAlignment extends Alignment {
    apply(content, width) {
        const leftSpaces = Math.ceil((width - content.length) / 2)
        const rightSpaces = width - content.length - leftSpaces
        return this._paddingCharacter.repeat(leftSpaces) + content + this._paddingCharacter.repeat(rightSpaces)
    }
}

class Column {
    #content

    constructor(content) {
        this.#content = content
    }

    align(alignment, width) {
        return new this.constructor(alignment.apply(this.#content, width))
    }

    width() {
        return this.#content.length
    }

    asPlainText() {
        return this.#content;
    }
}

class Row {
    #columns
    #shape

    constructor(columns) {
        this.#columns = columns
        this.#shape = RowShape.fromColumns(columns)
    }

    static empty() {
        return new this([]);
    }

    static fromPlainArray(columns) {
        return new this(columns.map(column => new Column(column)))
    }

    align(alignment, shape) {
        return new this.constructor(shape.alignColumns(this.#columns, alignment));
    }

    mergeOwnShapeWith(otherShape) {
        return this.#shape.mergeWith(otherShape)
    }

    asPlainArray() {
        return this.#columns.map(column => column.asPlainText());
    }

    asPlainText(columnSeparator) {
        let textRow = this.#columns.map(column => column.asPlainText()).join(columnSeparator);
        return columnSeparator + textRow + columnSeparator
    }
}

class RowShape {
    #columnWidths

    constructor(columnWidths) {
        this.#columnWidths = columnWidths
    }

    static fromColumns(columns) {
        return new this(columns.map(column => column.width()));
    }

    static empty() {
        return new this([]);
    }

    mergeWith(otherShape) {
        return this.#withLongerAndShorterShapes(otherShape, (longer, shorter) => longer.#mergeColumnWidthsWith(shorter));
    }

    alignColumns(columns, alignment) {
        return this.#columnWidths.map((width, index) => columns.either(index).or(() => new Column('')).align(alignment, width));
    }

    #mergeColumnWidthsWith(otherShape) {
        return new this.constructor(this.#columnWidths.map((width, index) => Math.max(width, otherShape.#columnWidths.either(index).or(() => 0))));
    }

    #withLongerAndShorterShapes(otherShape, callback) {
        if (this.#columnWidths.length > otherShape.#columnWidths.length) {
            return callback(this, otherShape);
        }
        return callback(otherShape, this);
    }
}

class AlignColumns {
    #rows
    #alignment
    #commonRowShape

    constructor(rows, alignment = new LeftAlignment()) {
        this.#rows = rows;
        this.#alignment = alignment;
        this.#commonRowShape = this.#calculateCommonRowShape();
    }

    static fromPlainArray(plainRows, alignment) {
        return new this(plainRows.map(Row.fromPlainArray.bind(Row)), alignment);
    }

    static fromPlainText(text, alignment) {
        return this.fromPlainArray(this.#parsePlainRows(text), alignment);
    }

    static #parsePlainRows(text) {
        if (text.length === 0)
            return []
        return text.split('\n').map(row => row.split('$'))
    }

    asPlainArray() {
        return this.#rows.map(row => row.align(this.#alignment, this.#commonRowShape).asPlainArray())
    }

    asPlainText(borderSeparator = '*', borderCharacter = '-', columnSeparator = '|') {
        if (this.#rows.length === 0)
            return this.#emptyPlainText(borderSeparator, columnSeparator);
        return this.#plainText(borderSeparator, borderCharacter, columnSeparator);
    }

    #calculateCommonRowShape() {
        return this.#rows.reduce((shape, row) => row.mergeOwnShapeWith(shape), RowShape.empty());
    }

    #plainText(borderSeparator, borderCharacter, columnSeparator) {
        const borderText = Row.empty()
            .align(this.#alignment.changePaddingCharacter(borderCharacter), this.#commonRowShape)
            .asPlainText(borderSeparator);

        const rowTexts = this.#rows.map(
            row => row.align(this.#alignment, this.#commonRowShape).asPlainText(columnSeparator)
        );

        return [borderText, ...rowTexts, borderText].join('\n');
    }

    #emptyPlainText(borderSeparator, columnSeparator) {
        return [
            borderSeparator.repeat(2),
            columnSeparator.repeat(2),
            borderSeparator.repeat(2),
        ].join('\n');
    }
}

module.exports = {
    AlignColumns,
    LeftAlignment,
    RightAlignment,
    CenterAlignment,
};

// Don't look at me!!
Array.prototype.either = function (index) {
    return {
        or: (defaultValueCallback) => {
            if (index < this.length) {
                return this[index];
            }
            return defaultValueCallback();
        }
    }
}