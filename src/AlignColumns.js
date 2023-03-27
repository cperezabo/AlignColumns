/**
 *  @abstract
 */
class Alignment {
    /**
     *  @abstract
     */
    apply(content, width) {
    }
}

class LeftAlignment extends Alignment {
    apply(content, width) {
        return content + ' '.repeat(width - content.length)
    }
}

class RightAlignment extends Alignment {
    apply(content, width) {
        return ' '.repeat(width - content.length) + content
    }
}

class CenterAlignment extends Alignment {
    apply(content, width) {
        const leftSpaces = Math.ceil((width - content.length) / 2)
        const rightSpaces = width - content.length - leftSpaces
        return ' '.repeat(leftSpaces) + content + ' '.repeat(rightSpaces)
    }
}

class Column {
    #content

    constructor(content) {
        this.#content = content
    }

    align(alignment, width) {
        return new Column(alignment.apply(this.#content, width))
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
        return new Row([]);
    }

    static fromPlainArray(columns) {
        return new Row(columns.map(column => new Column(column)))
    }

    align(alignment, shape) {
        return shape.alignRow(this, alignment)
    }

    alignColumnAt(index, alignment, width) {
        const columns = [...this.#columns];
        columns[index] = this.#columnAt(index).align(alignment, width);
        return new Row(columns);
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

    #columnAt(index) {
        return this.#columns.either(index).or(() => new Column(''));
    }
}

class RowShape {
    #columnWidths

    constructor(columnWidths) {
        this.#columnWidths = columnWidths
    }

    static fromColumns(columns) {
        return new RowShape(columns.map(column => column.width()));
    }

    static empty() {
        return new RowShape([]);
    }

    mergeWith(otherShape) {
        return this.#withLongerAndShorterShapes(otherShape, (longer, shorter) => longer.#mergeColumnWidthsWith(shorter));
    }

    alignRow(row, alignment) {
        return this.#columnWidths.reduce((alignedRow, width, index) => alignedRow.alignColumnAt(index, alignment, width), row);
    }

    #mergeColumnWidthsWith(otherShape) {
        return new RowShape(this.#columnWidths.map((width, index) => Math.max(width, otherShape.#columnWidths.either(index).or(() => 0))));
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
        return new AlignColumns(plainRows.map(Row.fromPlainArray), alignment);
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
        return this.#rows.reduce(
            (commonRowShape, row) => row.mergeOwnShapeWith(commonRowShape),
            RowShape.empty(),
        );
    }

    #plainText(borderSeparator, borderCharacter, columnSeparator) {
        const borderText = Row.empty()
            .align(this.#alignment, this.#commonRowShape)
            .asPlainText(borderSeparator)
            .replaceAll(' ', borderCharacter);

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