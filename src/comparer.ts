import { Tree } from './tree'
import { Tuple } from './tuple'
import { GroupedDiff, Output, Node, SingleDiff } from './comparer.types'

export class StringComparer extends Tree<Node> {
  readonly aString: string
  readonly bString: string
  private operationsCount = 0 // to count comparison complexity
  notChangedDots: Set<string> = new Set()
  movedDots: Set<string> = new Set()

  constructor(a: string, b: string) {
    const rootNode:Node = {
      id: 0,
      depth: 0,
      parentNode: null,
      childNodes: [],
      payload: {
        indexA: -1,
        indexB: -1,
        processed: false
      }
    }
    super(rootNode)
    this.aString = a
    this.bString = b
  }

  private getDeepestNodeInArea(maxIndexA: number, maxIndexB: number): Node {
    let nodeWithMaxDistance = this.rootNode
    this.forEach((node) => {
      this.operationsCount++
      if (node.payload.indexA >= maxIndexA || node.payload.indexB >= maxIndexB) return
      if (node.depth > nodeWithMaxDistance.depth)
        nodeWithMaxDistance = node
    })
    return nodeWithMaxDistance
  }

  private addNodeToTree(indexA: number, indexB: number): void {
    const parentNode = this.getDeepestNodeInArea(indexA, indexB)
    const currentNode:Node = {
      id: this.operationsCount,
      depth: parentNode.depth + 1,
      parentNode,
      childNodes: [],
      payload: {
        indexA, indexB,
        processed: false,
        value: this.aString[indexA]
      }
    }
    parentNode.childNodes.push(currentNode)
  }

  private buildTreeOfEqualSymbols() {
    for (let indexB = 0; indexB < this.bString.length; indexB++) {
      for (let indexA = 0; indexA < this.aString.length; indexA++) {
        this.operationsCount++
        if (this.aString[indexA] === this.bString[indexB]) {
          this.addNodeToTree(indexA, indexB)
        }
      }
    }
    return this.rootNode
  }

  private markNotChangedSymbols() {
    const leafNode = this.getDeepestNode()
    this.forEachReversed((node) => {
      this.operationsCount++
      if (node.payload.indexA < 0 || node.payload.indexB < 0) return
      const tuple = new Tuple(node.payload.indexA, node.payload.indexB)
      this.notChangedDots.add(tuple.value)
    }, leafNode)
  }
  private markMovedSymbols() {
    this.forEach(node => {
      if (node.payload.processed) return
      if (node.payload.indexA < 0 || node.payload.indexB < 0) return
      const tuple = new Tuple(node.payload.indexA, node.payload.indexB)
      for (const dot of this.notChangedDots) {
        this.operationsCount++
        const dotTuple = new Tuple(dot)
        if (dotTuple.elements[0] === tuple.elements[0])
          return
        if (dotTuple.elements[1] === tuple.elements[1])
          return
      }
      for (const dot of this.movedDots) {
        this.operationsCount++
        const dotTuple = new Tuple(dot)
        if (dotTuple.elements[0] === tuple.elements[0])
          return
        if (dotTuple.elements[1] === tuple.elements[1])
          return
      }
      this.movedDots.add(tuple.value)
    })
  }
  private groupDiffs(linearDiffs: Array<SingleDiff>): GroupedDiff[] {
    const groupedADiffs: GroupedDiff[] = []
    let currentDiff: GroupedDiff = {
      from: linearDiffs[0].index,
      to: linearDiffs[0].index,
      value: linearDiffs[0].value,
      type: linearDiffs[0].type
    }

    linearDiffs.forEach((dif, index) => {
      if (index === 0) return
      this.operationsCount++
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
  private buildDiffs(): Output {
    const aDiffs: Array<SingleDiff|undefined> = new Array(this.aString.length)
      .fill('')
      .map(() => undefined)

    const bDiffs: Array<SingleDiff|undefined> = new Array(this.bString.length)
      .fill('')
      .map(() => undefined)

    this.notChangedDots.forEach((dot) => {
      this.operationsCount++
      const [ aIndex, bIndex ] = new Tuple(dot).elements
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

    this.movedDots.forEach((dot) => {
      this.operationsCount++
      const [ aIndex, bIndex ] = new Tuple(dot).elements
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
    const fullDiffs__A: SingleDiff[] = aDiffs.map(
      (dif, index) => dif === undefined
        ? { index, value: this.aString[index], type: 'deleted' }
        : dif
    )
    const fullDiffs__B: SingleDiff[] = bDiffs.map(
      (dif, index) => dif === undefined
        ? { index, value: this.bString[index], type: 'added' }
        : dif
    )

    return {
      aDiffs: this.groupDiffs(fullDiffs__A),
      bDiffs: this.groupDiffs(fullDiffs__B)
    }
  }
  public getDiffs(): Output {
    this.buildTreeOfEqualSymbols()
    this.markNotChangedSymbols()
    this.markMovedSymbols()
    return this.buildDiffs()
  }
}
