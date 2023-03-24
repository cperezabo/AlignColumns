import {AlignColumns, CenterAlignment, RightAlignment} from "./AlignColumns";

describe('Align Columns suite', () => {
    test('Should return no rows when there are no rows with columns to align', () => {
        const alignColumns = AlignColumns.fromPlainArray([])
        expect(alignColumns.asPlainArray()).toEqual([])
    })

    test('Should return the row with the column when there is one row and column', () => {
        const alignColumns = AlignColumns.fromPlainArray([['1234']])
        expect(alignColumns.asPlainArray()).toEqual([['1234']])
    })

    test('Should return rows with its columns for same column size', () => {
        const alignColumns = AlignColumns.fromPlainArray([['1234'], ['abcd']])
        expect(alignColumns.asPlainArray()).toEqual([['1234'], ['abcd']])
    })

    test('Columns of different rows should have the same width', () => {
        const alignColumns = AlignColumns.fromPlainArray([['1234'], ['12']])
        expect(alignColumns.asPlainArray()).toEqual([['1234'], ['12  ']])
    })

    test('Max column width can be in any row', () => {
        const alignColumns = AlignColumns.fromPlainArray([['12'], ['1234']])
        expect(alignColumns.asPlainArray()).toEqual([['12  '], ['1234']])
    })

    test('Align rows with more than one column', () => {
        const alignColumns = AlignColumns.fromPlainArray([['12', 'abc'], ['1234', 'ab']])
        expect(alignColumns.asPlainArray()).toEqual([['12  ', 'abc'], ['1234', 'ab ']])
    })

    test('First row can have different number of columns', () => {
        const alignColumns = AlignColumns.fromPlainArray([['12', 'abc'], ['1234']])
        expect(alignColumns.asPlainArray()).toEqual([['12  ', 'abc'], ['1234', '   ']])
    })

    test('Any row can have different number of columns', () => {
        const alignColumns = AlignColumns.fromPlainArray([['12'], ['1234', 'abc']])
        expect(alignColumns.asPlainArray()).toEqual([['12  ', '   '], ['1234', 'abc']])
    })

    test('Can align to right', () => {
        const alignColumns = AlignColumns.fromPlainArray([['12', 'abc'], ['1234', 'a']], new RightAlignment())
        expect(alignColumns.asPlainArray()).toEqual([['  12', 'abc'], ['1234', '  a']])
    })

    test('Alignment can be center', () => {
        const alignColumns = AlignColumns.fromPlainArray([['12', 'abc'], ['1234', 'ab']], new CenterAlignment())
        expect(alignColumns.asPlainArray()).toEqual([[' 12 ', 'abc'], ['1234', ' ab']])
    })

    test('Can align an empty string', () => {
        const alignColumns = AlignColumns.fromPlainText('', new CenterAlignment());
        expect(alignColumns.asPlainArray()).toEqual([])
    })

    test('Can align one row with one column', () => {
        const alignColumns = AlignColumns.fromPlainText('123', new CenterAlignment());
        expect(alignColumns.asPlainArray()).toEqual([['123']])
    })

    test('Can align one rows with many columns', () => {
        const alignColumns = AlignColumns.fromPlainText('123$abc', new CenterAlignment());
        expect(alignColumns.asPlainArray()).toEqual([['123', 'abc']])
    })

    test('Can align many rows with many columns', () => {
        const alignColumns = AlignColumns.fromPlainText('123$abc\n1$a', new CenterAlignment());
        expect(alignColumns.asPlainArray()).toEqual([['123', 'abc'], [' 1 ', ' a ']])
    })

    test('Can generate string output from empty input', () => {
        const alignColumns = AlignColumns.fromPlainText('', new CenterAlignment());
        expect(alignColumns.asPlainText()).toEqual(
            '**\n' +
            '||\n' +
            '**')
    })

    test('Can generate string output one row with one column', () => {
        const alignColumns = AlignColumns.fromPlainText('123', new CenterAlignment());
        expect(alignColumns.asPlainText()).toEqual(
            '*---*\n' +
            '|123|\n' +
            '*---*')
    })

    test('Can generate string output one row with many columns', () => {
        const alignColumns = AlignColumns.fromPlainText('123$a', new CenterAlignment());
        expect(alignColumns.asPlainText()).toEqual(
            '*---*-*\n' +
            '|123|a|\n' +
            '*---*-*')
    })

    test('Can generate string output with many rows and many columns', () => {
        const alignColumns = AlignColumns.fromPlainText('123$a\n1$abc', new CenterAlignment());
        expect(alignColumns.asPlainText()).toEqual(
            '*---*---*\n' +
            '|123| a |\n' +
            '| 1 |abc|\n' +
            '*---*---*')
    })
})