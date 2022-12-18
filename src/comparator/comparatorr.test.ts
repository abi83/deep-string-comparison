import { StringComparer } from './comparator'
import { ERROR_MESSAGES } from './comparator.literals'

describe('Unit tests for comparer class', () => {
  it('Should not fall with empty strings', () => {
    expect(() => {
      new StringComparer('', '').getDiffs()
      new StringComparer('a', '').getDiffs()
      new StringComparer('', 'b').getDiffs()

    }).not.toThrow()
  })

  it('Should return empty diffs for identical strings', () => {
    const diffs = new StringComparer('abc', 'abc').getDiffs()
    const expected = {
      aDiffs: [{ from: 0, to: 2, type: 'not_changed', value: 'abc' }],
      bDiffs: [{ from: 0, to: 2, type: 'not_changed', value: 'abc' }]
    }
    expect(diffs).toEqual(expected)
  })

  it('Should create comparer', () => {
    const comparer = new StringComparer('abc', 'xyz')
    expect(comparer).toBeDefined()
  })

  it('Should call preliminaryCheck', () => {
    const comparer = new StringComparer('abc', 'xyz')
    const preliminaryCheckMock = jest.spyOn(comparer, 'preliminaryCheck')
    comparer.getDiffs()
    expect(preliminaryCheckMock).toHaveBeenCalledTimes(1)
  })

  it('Should cover starting and ending equal substrings', () => {
    const comparer = new StringComparer(
      'ABCDE++++++++++XYZ',
      'ABCDE----------XYZ',
    )
    const { startIndex, endIndex } = comparer.preliminaryCheck()
    expect(startIndex).toBe(5)
    expect(endIndex).toBe(3)
  })

  it('Should store equal symbols to tree', () => {
    const comparer = new StringComparer(
      // ADK - only equal symbols
      'AbcDefgijK',
      'lhmnAoqrDtuvxKyz',
    )
    const storeMock = jest.spyOn(comparer, 'storeEqualSymbols')
    comparer.buildTreeOfEqualSymbols()
    expect(storeMock).toHaveBeenCalledTimes(3)
  })

  it('Should create child nodes if equal symbols appears in both strings in same order', () => {
    const comparer = new StringComparer(
      // ADK - only equal symbols
      'AbcDefgijK',
      'lhmnAoqrDtuvxKyz',
    )
    const expected = [
      { indexA: 0, indexB: 4, value: 'A', depth: 1 },
      { indexA: 3, indexB: 8, value: 'D', depth: 2 },
      { indexA: 9, indexB: 13, value: 'K', depth: 3 }
    ]
    expected.forEach(symbol => {
      comparer.storeEqualSymbols(symbol.indexA, symbol.indexB)
      const deepestNode = comparer.getDeepestNode()
      expect(deepestNode.payload).toEqual(expect.objectContaining({
        indexA: symbol.indexA,
        indexB: symbol.indexB,
        value: symbol.value
      }))
      expect(deepestNode.depth).toEqual(symbol.depth)
    })
  })

  it('Should create nodes of same depth for equal symbols in mixed order', () => {
    const comparer = new StringComparer(
      // ABC - only equal symbols
      'bAcBefC',
      'AhmCoqrdtuvxByz',
    )
    const expected = [
      { indexA: 1, indexB: 0, value: 'A', depth: 1 },
      { indexA: 3, indexB: 12, value: 'B', depth: 2 },
      { indexA: 6, indexB: 3, value: 'C', depth: 2 }
    ]
    expected.forEach(symbol => {
      comparer.storeEqualSymbols(symbol.indexA, symbol.indexB)
      const deepestNode = comparer.getDeepestNode()
      expect(deepestNode.depth).toEqual(symbol.depth)
    })
  })

  it('Should throw an error, when trying to store in tree non equal symbols', () => {
    const comparer = new StringComparer(
      // ABC - only equal symbols
      'bAcBefC',
      'AhmCoqrdtuvxByz',
    )
    expect(() => {comparer.storeEqualSymbols(0, 0)})
      .toThrow(ERROR_MESSAGES.NOT_EQUAL_SYMBOLS)
  })

  it('Should return deepest node within area', () => {
    const comparer = new StringComparer(
      'abc',
      'xyz',
    )
    const rootNode = comparer.getDeepestNode()
    // creating some nodes manually
    comparer.createNewNode(
      { indexA: 2, indexB: 3, value: 'A' },
      rootNode)
    comparer.createNewNode(
      { indexA: 6, indexB: 8, value: 'B' },
      rootNode)
    comparer.createNewNode(
      { indexA: 3, indexB: 8, value: 'c' },
      rootNode)
    const resultA = comparer.getDeepestNodeInArea(5, 5)
    expect(resultA.payload.value).toBe('A')

    // should consider indexes distance es well
    comparer.createNewNode(
      { indexA: 3, indexB: 4, value: 'D' },
      rootNode)
    const resultB = comparer.getDeepestNodeInArea(5, 5)
    expect(resultB.payload.value).toBe('D')
  })

  it('Should consider index distance returning deepest node', () => {
    const comparer = new StringComparer(
      'abc',
      'xyz',
    )
    const rootNode = comparer.getDeepestNode()
    // creating some nodes manually
    comparer.createNewNode(
      { indexA: 2, indexB: 3, value: 'A' },
      rootNode)
    comparer.createNewNode(
      { indexA: 3, indexB: 4, value: 'B' },
      rootNode)
    const resultB = comparer.getDeepestNodeInArea(5, 5)
    expect(resultB.payload.value).toBe('B')
  })

  it('Should mark symbols as not changed if they appear in the same order', () => {
    const comparer = new StringComparer(
      'qAweBrtCyu',
      'sdAfgBhjCkl',
    )
    comparer.buildTreeOfEqualSymbols()
    comparer.markNotChangedSymbols()
    expect(Array.from(comparer['notChangedIndexPairs'])).toEqual(
      expect.arrayContaining([ '1__2', '4__5', '7__8' ]))
  })

  it('Should mark not changed symbols from leafNode to rootNode', () => {
    const comparer = new StringComparer(
      'abc',
      'xyz',
    )
    const forEachReversedMock = jest.spyOn(comparer, 'forEachReversed')
    const forEachMock = jest.spyOn(comparer, 'forEach')
    comparer.markNotChangedSymbols()
    expect(forEachReversedMock).toBeCalled()
    expect(forEachMock).not.toBeCalled()
  })

  it('Should mark moved symbols from rootNode', () => {
    const comparer = new StringComparer(
      // ABC - only equal symbols
      'abc',
      'xyz',
    )
    const forEachReversedMock = jest.spyOn(comparer, 'forEachReversed')
    const forEachMock = jest.spyOn(comparer, 'forEach')
    comparer.markMovedSymbols()
    expect(forEachReversedMock).not.toBeCalled()
    expect(forEachMock).toBeCalled()
  })

  it('Should mark symbol as moved,' +
    'only if both of indexes are not marked as notChanged', () => {
    const comparer = new StringComparer(
      // ABC - only equal symbols
      '123cba456',
      '7a8b90c',
    )
    comparer.buildTreeOfEqualSymbols()
    comparer.markNotChangedSymbols()
    comparer.markMovedSymbols()
    expect(comparer['movedIndexPairs'].has('4__3'))
      .toBeTruthy() // correct behaviour

    // breaking instance manually to check behaviour
    // adding just first index
    comparer['notChangedIndexPairs'].add('4__999')
    comparer.markMovedSymbols()
    expect(comparer['notChangedIndexPairs'].has('4__3'))
      .toBeFalsy() // one of the indexes was marked as notMoved
  })

  it('Should mark symbol as moved,' +
    'only if both of indexes are not marked as moved yet', () => {
    const comparer = new StringComparer(
      // abc - only equal symbols
      '123cba456',
      '7a8b90c',
    )
    comparer.buildTreeOfEqualSymbols()
    comparer.markNotChangedSymbols()
    comparer.markMovedSymbols()
    expect(comparer['movedIndexPairs'].has('4__3'))
      .toBeTruthy() // correct behaviour

    // breaking instance manually to check behaviour
    // adding just first index
    comparer['movedIndexPairs'].add('999__3')
    comparer.markMovedSymbols()
    expect(comparer['notChangedIndexPairs'].has('4__3'))
      .toBeFalsy() // one of the indexes was marked as notMoved
  })

  it('Should return correct diff', () => {
    const comparer = new StringComparer(
      'my test string HAS data',
      'my COOL string test data',
    )
    const { aDiffs, bDiffs } = comparer.getDiffs()
    // unique substrings ('my', 'string', 'data')
    expect(aDiffs.filter(diff => diff.type === 'not_changed').length).toBe(3)
    expect(aDiffs.filter(diff => diff.type === 'not_changed').map(diff => diff.value))
      .toEqual(bDiffs.filter(diff => diff.type === 'not_changed').map(diff => diff.value))

    // moved substring 'test'
    expect(aDiffs.filter(diff => diff.type === 'moved').length).toBe(1)
    expect(aDiffs.filter(diff => diff.type === 'moved').map(diff => diff.value))
      .toEqual(bDiffs.filter(diff => diff.type === 'moved').map(diff => diff.value))

    // deleted substring 'HAS'
    expect(aDiffs.filter(diff => diff.type === 'deleted').length).toBe(1)
    expect(aDiffs.filter(diff => diff.type === 'deleted').map(diff => diff.value))
      .toEqual([ 'HAS' ])

    // added substring 'COOL'
    expect(bDiffs.filter(diff => diff.type === 'added').length).toBe(1)
    expect(bDiffs.filter(diff => diff.type === 'added').map(diff => diff.value))
      .toEqual([ 'COOL' ])
  })
})
