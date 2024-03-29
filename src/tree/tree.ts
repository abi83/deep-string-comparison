import { BaseNode } from './tree.types'
import { ERROR_MESSAGES } from './tree.literals'

/**
 * Very basic Tree class:
 *  - two-way binding
 *  - unlimited number of child nodes
 *  - unweighted
 * Recursion is used, which can be a limitation
 */
export class Tree<TreeNode extends BaseNode> {
  protected readonly rootNode: TreeNode
  private nodeIds: Set<number> = new Set()
  constructor(rootNode: TreeNode) {
    this.rootNode = rootNode
    this.rootNode.id = 0
    this.nodeIds.add(0)
  }

  /**
   * Calls callback for each node in preorder traversal.
   * @param {Function}  callback    current node is the only argument
   * @param {Object}   startNode    Optional. rootNode is default value
   */
  forEach(
    callback: (node: TreeNode) => void,
    startNode = this.rootNode
  ): void {
    callback(startNode)
    startNode.childNodes.forEach(child => this.forEach(callback, child as TreeNode))
  }

  /**
   * Calls callback for leanNode and all parentNodes one by one
   * @param {Function}  callback    current node is the only argument
   * @param {Object}    leanNode    node to start traversal from
   */
  forEachReversed(
    callback: (node: TreeNode) => void,
    leanNode: TreeNode
  ): void {
    callback(leanNode)
    if (leanNode.parentNode)
      this.forEachReversed(callback, leanNode.parentNode as TreeNode)
  }

  /**
   * Get "best" node found by binary comparer callback
   * @param {Function}  comparer  Function, that defines a sort order
   *                              receives two nodes as args
   */
  getBestNode(
    comparer: (nodeA: TreeNode, nodeB: TreeNode) => number
  ): TreeNode {
    const finder = (node: TreeNode): TreeNode => {
      if (node.childNodes.length === 0) return node
      const allKids = node.childNodes
        .map(child => finder(child as TreeNode))
      const kids = [ ...allKids, node ].sort(comparer)
      return kids[0]
    }
    return finder(this.rootNode)
  }

  /**
   * Get node with max depth
   */
  getDeepestNode(): TreeNode {
    const comparer = (node1:TreeNode, node2: TreeNode) => {
      return node2.depth - node1.depth
    }
    return this.getBestNode(comparer)
  }

  isNodeInTree(nodeId: number): boolean {
    return this.nodeIds.has(nodeId)
  }

  createNewNode(
    payload: TreeNode['payload'],
    parentNode: TreeNode
  ): void {
    if (!this.isNodeInTree(parentNode.id)) {
      throw new Error(ERROR_MESSAGES.NOT_IN_TREE)
    }
    const id = this.nodeIds.size
    this.nodeIds.add(id)
    const newNode = {
      id,
      parentNode,
      depth: parentNode.depth + 1,
      childNodes: [],
      payload
    }
    parentNode.childNodes.push(newNode)
  }
}
