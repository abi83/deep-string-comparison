import { Tree } from './tree/tree'
import { Tuple } from './tuple/tuple'
import { GroupedDiff, StringDiffs, Node, Diff } from './comparer.types'

/**
 * Compares two strings, and returns symbol by symbol diffs.
 *  Get started:
 *
 *    cons comparer = new StringComparer('string one', 'string two')
 *    comparer.getDiffs()
 *
 * Algorithm complexity: O(n^2), where n is string length
 */
export class StringComparer extends Tree<Node> {
  private readonly aString: string
  private readonly bString: string
  private notChangedIndexPairs: Set<string> = new Set()
  private movedIndexPairs: Set<string> = new Set()

  constructor(aString: string, bString: string) {
    const rootNode:Node = {
      id: 0,
      depth: 0,
      parentNode: null,
      childNodes: [],
      payload: {
        indexA: -1,
        indexB: -1,
        processed: false,
        value: ''
      }
    }
    super(rootNode)
    this.aString = aString
    this.bString = bString
  }

  /**
   * Returns the deepest node in the tree withing range.
   * @param maxIndexA   limitation in aString
   * @param maxIndexB   limitation in bString
   */
  private getDeepestNodeInArea(maxIndexA: number, maxIndexB: number): Node {
    const inRange = (node:Node, maxA:number, maxB:number) => {
      return node.payload.indexA < maxA && node.payload.indexB < maxB
    }
    const comparer = (indexA:number, indexB:number): (n1:Node, n2:Node)=>number => {
      return (nodeA: Node, nodeB: Node) => {
        if (
          inRange(nodeA, indexA, indexB) &&
          inRange(nodeB, indexA, indexB)
        ) {
          if (nodeB.depth !== nodeA.depth)
            return nodeB.depth - nodeA.depth
          return (nodeB.payload.indexA + nodeB.payload.indexB)
               - (nodeA.payload.indexA + nodeA.payload.indexB)
        }
        if (
          !inRange(nodeA, indexA, indexB) &&
          !inRange(nodeB, indexA, indexB)
        ) {
          return 0
        }
        return Number(inRange(nodeB, indexA, indexB)) - Number(inRange(nodeA, indexA, indexB))
      }
    }
    return this.getBestNode(comparer(maxIndexA, maxIndexB))
  }

  /**
   * Add node of equal symbols to a tree.
   * Parent is the deepest node withing current index limitations
   * Such a node, being the closest not changed symbol to the current one
   * is a good candidate to build not changes symbols chain
   * @param indexA  new node indexA
   * @param indexB  new node indexA
   */
  private storeEqualSymbols(indexA: number, indexB: number): void {
    const parentNode = this.getDeepestNodeInArea(indexA, indexB)
    const payload = {
      indexA, indexB,
      processed: false,
      value: this.aString[indexA] // which is equal to this.bString[indexB]
    }
    this.createNewNode(payload, parentNode)
  }

  private preliminaryCheck() {
    let startIndex, endIndex
    for (
      startIndex = 0;
      startIndex < Math.min(this.aString.length, this.bString.length);
      startIndex++
    ) if (
      this.aString[startIndex] === this.bString[startIndex]
    ) {
      const indexPair = new Tuple(startIndex, startIndex)
      this.notChangedIndexPairs.add(indexPair.value)
    } else break

    for (
      endIndex = 0;
      endIndex <= Math.min(this.aString.length, this.bString.length) - startIndex - 1;
      endIndex++
    ) if (
      this.aString[this.aString.length - endIndex - 1] ===
      this.bString[this.bString.length - endIndex - 1]
    ) {
      const indexPair = new Tuple(
        this.aString.length - endIndex - 1,
        this.bString.length - endIndex - 1
      )
      this.notChangedIndexPairs.add(indexPair.value)
    } else break
    return { startIndex, endIndex }
  }

  /**
   * Loops through all combination of symbolA and symbolB.
   * Adds a node to a tree, if symbols are equal
   * The idea is to find the longest path of equal symbols (nodes)
   */
  private buildTreeOfEqualSymbols() {
    const { startIndex, endIndex } = this.preliminaryCheck()
    for (let indexB = startIndex; indexB < this.bString.length - endIndex; indexB++) {
      for (let indexA = startIndex; indexA < this.aString.length - endIndex; indexA++) {
        if (this.aString[indexA] === this.bString[indexB])
          this.storeEqualSymbols(indexA, indexB)
      }
    }
  }

  /**
   * Deepest node represents the longest path of unique symbol pairs.
   * Starting from deepest leafNode traversing to rootNode,
   * the method stores all index pairs as 'notChanged'
   */
  private markNotChangedSymbols() {
    const leafNode = this.getDeepestNode()
    this.forEachReversed((node) => {
      const indexPair = new Tuple(node.payload.indexA, node.payload.indexB)
      this.notChangedIndexPairs.add(indexPair.value)
    }, leafNode)
  }

  /**
   * All other nodes in the tree represents moved symbols
   * Check if both of indexes in the pair are still not marked
   * and stores such indexPair as 'moved'
   */
  private markMovedSymbols() {
    this.forEach(node => {
      if (node.payload.processed) return
      const currentIndexes = new Tuple(node.payload.indexA, node.payload.indexB)
      for (const notChangedIndexPair of this.notChangedIndexPairs) {
        const notChangedIndexes = new Tuple(notChangedIndexPair)
        if (
          notChangedIndexes.elements[0] === currentIndexes.elements[0] ||
          notChangedIndexes.elements[1] === currentIndexes.elements[1])
          return
      }
      for (const movedIndexPair of this.movedIndexPairs) {
        const movedIndexes = new Tuple(movedIndexPair)
        if (
          movedIndexes.elements[0] === currentIndexes.elements[0] ||
          movedIndexes.elements[1] === currentIndexes.elements[1])
          return
      }
      this.movedIndexPairs.add(currentIndexes.value)
    })
  }

  /**
   * Group symbol-per-symbol diffs in groups
   */
  private groupDiffs(linearDiffs: Diff[]): GroupedDiff[] {
    if (!linearDiffs.length) return []
    const groupedADiffs: GroupedDiff[] = []
    let currentDiff: GroupedDiff = {
      from: linearDiffs[0].index,
      to: linearDiffs[0].index,
      value: linearDiffs[0].value,
      type: linearDiffs[0].type
    }

    linearDiffs.forEach((dif, index) => {
      if (index === 0) return
      if (dif.type === currentDiff.type) {
        currentDiff = {
          ...currentDiff,
          to: currentDiff.to + 1,
          value: currentDiff.value + dif.value
        }
        return
      }
      groupedADiffs.push({ ...currentDiff })
      currentDiff = {
        from: dif.index,
        to: dif.index,
        type: dif.type,
        value: dif.value
      }
    })
    groupedADiffs.push({ ...currentDiff })
    return groupedADiffs
  }

  /**
   * Build symbol per symbol diffs,
   * by parsing 'notChangedIndexPairs' and 'movedIndexPairs'.
   * All other indexes are marked as 'deleted' from aString
   * and 'added' to bString
   */
  private buildDiffs(): StringDiffs {
    const aDiffs: Array<Diff|undefined> = new Array(this.aString.length)
      .fill('')
      .map(() => undefined)

    const bDiffs: Array<Diff|undefined> = new Array(this.bString.length)
      .fill('')
      .map(() => undefined)

    this.notChangedIndexPairs.forEach((indexPair) => {
      const [ aIndex, bIndex ] = new Tuple(indexPair).elements
      aDiffs[aIndex] = {
        index: aIndex,
        value: this.aString[aIndex],
        type: 'not_moved'
      }
      bDiffs[bIndex] = {
        index: bIndex,
        value: this.bString[bIndex],
        type: 'not_moved'
      }
    })

    this.movedIndexPairs.forEach((indexPair) => {
      const [ aIndex, bIndex ] = new Tuple(indexPair).elements
      aDiffs[aIndex] = {
        index: aIndex,
        value: this.aString[aIndex],
        type: 'moved'
      }
      bDiffs[bIndex] = {
        index: bIndex,
        value: this.bString[bIndex],
        type: 'moved'
      }
    })
    const fullDiffs__A: Diff[] = aDiffs.map(
      (dif, index) => dif === undefined
        ? { index, value: this.aString[index], type: 'deleted' }
        : dif
    )
    const fullDiffs__B: Diff[] = bDiffs.map(
      (dif, index) => dif === undefined
        ? { index, value: this.bString[index], type: 'added' }
        : dif
    )
    return {
      aDiffs: this.groupDiffs(fullDiffs__A),
      bDiffs: this.groupDiffs(fullDiffs__B)
    }
  }

  /**
   * Call all calculations and return final diffs
   */
  public getDiffs(): StringDiffs {
    this.buildTreeOfEqualSymbols()
    this.markNotChangedSymbols()
    this.markMovedSymbols()
    return this.buildDiffs()
  }
}
