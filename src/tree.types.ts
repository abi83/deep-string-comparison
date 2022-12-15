export interface BaseNode {
  id: number,
  parentNode: BaseNode | null,
  childNodes: BaseNode[],
  depth: number,
}
