/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */

import { Tree } from './tree'
import { BaseNode } from './tree.types'
import { ERROR_MESSAGES } from './tree.literals'

describe('Unit tests for Tree class', () => {
  const rootNodeFabric = (): BaseNode => ({
    id: 0,
    parentNode: null,
    childNodes: [],
    depth: 0,
    payload: { testData: 0 }
  })

  it('Should create a tree', () => {
    const rootNode = rootNodeFabric()
    const tree = new Tree(rootNode)
    expect(tree).toBeDefined()
  })

  it('Should add new node to the tree', () => {
    const rootNode = rootNodeFabric()
    const tree = new Tree(rootNode)
    expect(() => {
      tree.createNewNode({ testData: 999 }, rootNode)
    }).not.toThrow()
    expect(tree.getDeepestNode().payload.testData).toEqual(999)
    expect(tree.isNodeInTree(1)).toBeTruthy()
  })

  it('Should throw an error on creatingNewNode with non-existing parent', () => {
    const rootNode = rootNodeFabric()
    const tree = new Tree(rootNode)
    expect(() => {
      tree.createNewNode({ }, {
        id: 100, depth: 5, parentNode: rootNode, childNodes: [], payload: {}
      })
    }).toThrow(ERROR_MESSAGES.NOT_IN_TREE)
  })

  it('Should find best node by comparer function', () => {
    const rootNode = rootNodeFabric()
    const tree = new Tree(rootNode)
    tree.createNewNode({ testData: 100 }, rootNode)
    tree.createNewNode({ testData: 101 }, rootNode)
    tree.createNewNode({ testData: 102 }, rootNode)

    const bestNode = tree.getBestNode(
      (nodeA, nodeB) => nodeB.payload.testData - nodeA.payload.testData
    )
    expect(bestNode.payload.testData).toBe(102)
  })

  it('Should return rootNode as deepestNode by default', () => {
    const rootNode = rootNodeFabric()
    const tree = new Tree(rootNode)
    expect(tree.getDeepestNode()).toBe(rootNode)
  })

  it('Should return deepest node', () => {
    const rootNode = rootNodeFabric()
    const tree = new Tree(rootNode)
    tree.createNewNode({ testData: 100 }, rootNode)
    tree.createNewNode({ testData: 101 }, rootNode)
    const bestNode = tree.getBestNode(
      (nodeA, nodeB) => nodeB.payload.testData - nodeA.payload.testData
    )
    tree.createNewNode({ testData: 102 }, bestNode)
    expect(tree.getDeepestNode().payload.testData).toBe(102)
  })

  it('Should return true if node is in tree', () => {
    const rootNode = rootNodeFabric()
    const tree = new Tree(rootNode)
    tree.createNewNode({ testData: 100 }, rootNode)
    tree.createNewNode({ testData: 101 }, rootNode)
    expect(tree.isNodeInTree(1)).toBeTruthy()
    expect(tree.isNodeInTree(2)).toBeTruthy()
    expect(tree.isNodeInTree(3)).toBeFalsy()
  })

  it('Should run callback forEach node starting from rootNode', () => {
    const rootNode = rootNodeFabric()
    const tree = new Tree(rootNode)
    tree.createNewNode({ testData: 100 }, rootNode)
    tree.createNewNode({ testData: 101 }, rootNode)
    tree.createNewNode({ testData: 102 }, tree.getDeepestNode())

    const callbackMock = jest.fn()
    tree.forEach(callbackMock)

    expect(callbackMock).toHaveBeenCalledTimes(4)
    expect(callbackMock).toHaveBeenNthCalledWith(1,
      expect.objectContaining({
        id: 0,
        depth: 0,
        parentNode: null,
        childNodes: expect.any(Array)
      })
    )
    expect(callbackMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(Number),
        depth: expect.any(Number),
        parentNode: expect.any(Object),
        childNodes: expect.any(Array)
      }))
  })

  it('Should run callback for leafNode and each parent', () => {
    const rootNode = rootNodeFabric()
    const tree = new Tree(rootNode)
    tree.createNewNode({ testData: 100 }, rootNode)
    tree.createNewNode({ testData: 101 }, rootNode)
    tree.createNewNode({ testData: 102 }, tree.getDeepestNode())
    tree.createNewNode({ testData: 103 }, tree.getDeepestNode())
    tree.createNewNode({ testData: 104 }, tree.getDeepestNode())

    const leafNode = tree.getDeepestNode()
    const callbackMock = jest.fn()

    tree.forEachReversed(callbackMock, leafNode)
    expect(callbackMock).toHaveBeenCalledTimes(5)
    expect(callbackMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: leafNode.id,
        depth: leafNode.depth,
        parentNode: expect.any(Object),
        childNodes: expect.any(Array)
      }))
    expect(callbackMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        id: 0,
        depth: 0,
        parentNode: null,
        childNodes: expect.any(Array)
      })
    )
  })
})
