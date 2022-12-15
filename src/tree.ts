import { BaseNode } from './tree.types'

/**
 * Two ways binded
 * Undirected
 * Unweighted
 * Two dimensions
 *
 */
export class Tree<TreeNode extends BaseNode> {
  readonly rootNode: TreeNode
  constructor(a: TreeNode) {
    this.rootNode = a
  }
  forEach(
    callback: (node: TreeNode) => void,
    startNode = this.rootNode
  ): void {
    callback(startNode)
    startNode.childNodes.forEach(child => this.forEach(callback, child as TreeNode))
  }

  forEachReversed(
    callback: (node: TreeNode)=>void,
    leanNode: TreeNode
  ): void {
    callback(leanNode)
    if (leanNode.parentNode)
      this.forEachReversed(callback, leanNode.parentNode as TreeNode)
  }
  getDeepestNode(): TreeNode {
    const comparer = (node1:TreeNode, node2: TreeNode): number => {
      return node2.depth - node1.depth
    }
    return this.getBestNode(comparer)
  }

  getBestNode(
    comparer: (nodeA: TreeNode, nodeB: TreeNode)=>number
  ): TreeNode {
    const finder = (node: TreeNode): TreeNode => {
      if (node.childNodes.length === 0) return node
      const allKids = node.childNodes.map(child => finder(child as TreeNode))
      const kids = [ ...allKids, node ].sort(comparer)
      return kids[0]
    }
    return finder(this.rootNode)
  }
}
