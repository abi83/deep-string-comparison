import { StringComparer } from './comparator/comparator'

describe('Integration tests for StringComparer', () => {
  it('Should mark as "deleted" internal substring', () => {
    const result = new StringComparer(
      'My ==removed part== string',
      'My string').getDiffs()
    const expected_aDiffs = [
      { from: 0, to: 2, type: 'not_changed', value: 'My ' },
      { from: 3, to: 19, type: 'deleted', value: '==removed part== ' },
      { from: 20, to: 25, type: 'not_changed', value: 'string' }
    ]
    expect(result.bDiffs.length).toEqual(1)
    expect(result.bDiffs[0].type).toEqual('not_changed')
    expect(result.aDiffs).toEqual(expected_aDiffs)
  })

  it('Should mark as "deleted" substring from start', () => {
    const result = new StringComparer(
      '==removed part==My string',
      'My string').getDiffs()
    const expected_aDiffs = [
      { from: 0, to: 15, type: 'deleted', value: '==removed part==' },
      { from: 16, to: 24, type: 'not_changed', value: 'My string' }
    ]
    expect(result.bDiffs.length).toEqual(1)
    expect(result.bDiffs[0].type).toEqual('not_changed')
    expect(result.aDiffs).toEqual(expected_aDiffs)
  })

  it('Should mark as "deleted" substring at end', () => {
    const result = new StringComparer(
      'My string==removed part==',
      'My string').getDiffs()
    const expected_aDiffs = [
      { from: 0, to: 8, type: 'not_changed', value: 'My string' },
      { from: 9, to: 24, type: 'deleted', value: '==removed part==' }
    ]
    expect(result.bDiffs.length).toEqual(1)
    expect(result.bDiffs[0].type).toEqual('not_changed')
    expect(result.aDiffs).toEqual(expected_aDiffs)
  })

  it('Should mark as "deleted" multiple substrings', () => {
    const result = new StringComparer(
      'My ==removed part== string //second removed part//',
      'My string').getDiffs()
    const expectedDiffs = [
      { from: 0, to: 2, type: 'not_changed', value: 'My ' },
      { from: 3, to: 19, type: 'deleted', value: '==removed part== ' },
      { from: 20, to: 25, type: 'not_changed', value: 'string' },
      { from: 26, to: 49, type: 'deleted', value: ' //second removed part//' }
    ]
    expect(result.aDiffs).toEqual(expectedDiffs)
  })

  it('Should mark substring as "moved"', () => {
    const { aDiffs, bDiffs } = new StringComparer(
      'My custom string =moved= with cool content',
      'My custom string with cool =moved= content').getDiffs()
    const expected_aDiffs = [
      { from: 0, to: 16, type: 'not_changed', value: 'My custom string ' },
      { from: 17, to: 24, type: 'moved', value: '=moved= ' },
      { from: 25, to: 41, type: 'not_changed', value: 'with cool content' }
    ]
    expect(aDiffs).toEqual(expected_aDiffs)
    // second string
    expect(bDiffs.length).toEqual(3)
    expect(bDiffs[0].type).toEqual('not_changed')
    expect(bDiffs[1].type).toEqual('moved')
    expect(bDiffs[2].type).toEqual('not_changed')
  })

  it('Should include all indexes in diffs for both strings', () => {
    const a = 'My sting with some content'
    const b = 'My custom string with deletions!'
    const { aDiffs, bDiffs } = new StringComparer(a, b).getDiffs()

    // from 0 to string.length
    expect(aDiffs[0].from).toEqual(0)
    expect(aDiffs[aDiffs.length - 1].from).toEqual(a.length - 1)
    expect(aDiffs[0].from).toEqual(0)
    expect(aDiffs[aDiffs.length - 1].from).toEqual(a.length - 1)
    // diffs cover string without gap
    aDiffs
      .slice(0, aDiffs.length - 1)
      .forEach((diff, index) => {
        expect(diff.to + 1).toEqual(aDiffs[index + 1].from)
      })
    bDiffs
      .slice(0, bDiffs.length - 1)
      .forEach((diff, index) => {
        expect(diff.to + 1).toEqual(bDiffs[index + 1].from)
      })
  })

  it('Should mark as "deleted" or "moved" even one symbol', () => {
    const { aDiffs, bDiffs } = new StringComparer(
      'My_custom! string',
      'My custom string_').getDiffs()
    const aMoved = aDiffs.find(diff => diff.value === '_')
    const bMoved = bDiffs.find(diff => diff.value === '_')
    const aDeleted = aDiffs.find(diff => diff.value === '!')

    expect(aMoved).toBeDefined()
    expect(bMoved).toBeDefined()
    expect(aDeleted).toBeDefined()
  })

  it('Should mark as or "moved" space symbols', () => {
    const { aDiffs, bDiffs } = new StringComparer(
      'My string',
      'Mystring ').getDiffs()
    const aMoved = aDiffs.find(diff => diff.value === ' ')
    const bMoved = bDiffs.find(diff => diff.value === ' ')

    expect(aMoved).toBeDefined()
    expect(bMoved).toBeDefined()
  })

  test('Should handle duplicated texts', () => {
    const { aDiffs, bDiffs } = new StringComparer(
      'My DUPLICATE custom string DUPLICATE with some content',
      'My custom string with some content DUPLICATE').getDiffs()
    const aRemoved = aDiffs.filter(diff =>
      diff.value.trim() === 'DUPLICATE' && diff.type === 'deleted')
    const aMoved = aDiffs.filter(diff =>
      diff.value.trim() === 'DUPLICATE' && diff.type === 'moved')

    const bRemoved = bDiffs.filter(diff =>
      diff.value.trim() === 'DUPLICATE' && diff.type === 'deleted')
    const bMoved = bDiffs.filter(diff =>
      diff.value.trim() === 'DUPLICATE' && diff.type === 'moved')

    expect(aRemoved.length).toBe(1)
    expect(aMoved.length).toBe(1)
    expect(bRemoved.length).toBe(0)
    expect(bMoved.length).toBe(1)
  })

  test('Should mark as "deleted"/"added" substrings with different case', () => {
    const { aDiffs, bDiffs } = new StringComparer(
      'My string with custom content',
      'My string with CUSTOM content').getDiffs()
    const aDeleted = aDiffs.find(diff => diff.type === 'deleted')
    const bAdded = bDiffs.find(diff => diff.type === 'added')
    expect(aDeleted).toBeDefined()
    expect(bAdded).toBeDefined()
  })

  test('Should reliably handle complex case', () => {
    // eslint-disable-next-line max-len
    const a = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
    // eslint-disable-next-line max-len
    const b = 'Lorem ipsum sit amet, adipiscing elit, sed do tempor incididunt ut labore et e magna aliqua. Ut consectetur enim ad minim veniam, quis exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt anim id est laborum'
    const { aDiffs, bDiffs } = new StringComparer(a, b).getDiffs()
    expect(aDiffs.length).toBe(26)
    expect(bDiffs.length).toBe(5)
    expect(aDiffs.filter(diff => diff.type === 'not_changed').length).toBe(9)
    expect(aDiffs.filter(diff => diff.type === 'moved').length).toBe(6)
    expect(aDiffs.filter(diff => diff.type === 'deleted').length).toBe(11)
    expect(bDiffs.filter(diff => diff.type === 'not_changed').length).toBe(3)
    expect(bDiffs.filter(diff => diff.type === 'moved').length).toBe(2)
    expect(bDiffs.find(diff => diff.type === 'added')).not.toBeDefined()

  })
})
