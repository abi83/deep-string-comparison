import { StringComparer } from '../src'
import { StringDiffs } from '../src'

describe('Integration tests for StringComparer', () => {
  test('Same strings return empty diffs', () => {
    const comparer = new StringComparer('abc', 'abc')
    const expected: StringDiffs = {
      aDiffs: [{ from: 0, to: 2, type: 'not_moved', value: 'abc' }],
      bDiffs: [{ from: 0, to: 2, type: 'not_moved', value: 'abc' }]
    }
    expect(comparer.getDiffs()).toEqual(expected)
  })

  test('Substring inside string marked as removed correctly', () => {
    const result = new StringComparer('My ==removed part== string', 'My string').getDiffs()
    const expected_aDiffs = [
      { from: 0, to: 2, type: 'not_moved', value: 'My ' },
      { from: 3, to: 19, type: 'deleted', value: '==removed part== ' },
      { from: 20, to: 25, type: 'not_moved', value: 'string' }
    ]
    expect(result.bDiffs.length).toEqual(1)
    expect(result.bDiffs[0].type).toEqual('not_moved')
    expect(result.aDiffs).toEqual(expected_aDiffs)
  })

  test('Start substring removing indicates correctly', () => {
    const result = new StringComparer('==removed part ==My string', 'My string').getDiffs()
    const expected_aDiffs = [
      { from: 0, to: 16, type: 'deleted', value: '==removed part ==' },
      { from: 17, to: 25, type: 'not_moved', value: 'My string' }
    ]
    expect(result.bDiffs.length).toEqual(1)
    expect(result.bDiffs[0].type).toEqual('not_moved')
    expect(result.aDiffs).toEqual(expected_aDiffs)
  })

  test('End substring removing indicates correctly', () => {
    const result = new StringComparer('My string==removed part ==', 'My string').getDiffs()
    const expected_aDiffs = [
      { from: 0, to: 8, type: 'not_moved', value: 'My string' },
      { from: 9, to: 25, type: 'deleted', value: '==removed part ==' }
    ]
    expect(result.bDiffs.length).toEqual(1)
    expect(result.bDiffs[0].type).toEqual('not_moved')
    expect(result.aDiffs).toEqual(expected_aDiffs)
  })

  test('Multiple removes indicates correctly', () => {
  })

  test('One removed symbol indicates correctly', () => {
  })

  test('Same text removed indicates correctly', () => {
  })

  test('Case change marked as removed', () => {
    // 'My string is custom',
    // 'My STRING is custom'
  })

  test('One specific case (no value duplicates)', () => {
    const A = 'string CCC my custom'
    const B = 'my XXX custom string'
  })

  test('Lorem ipsum', () => {
    // eslint-disable-next-line max-len
    const a = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
    // eslint-disable-next-line max-len
    const b = 'Lorem ipsum sit amet, consectetur adipiscing elit, sed do tempor incididunt ut labore et e magna aliqua. Ut enim ad minim veniam, quis exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt anim id est laborum'
  })
})
