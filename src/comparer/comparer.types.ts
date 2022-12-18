import { BaseNode } from '../tree/tree.types'

export type DiffTypes = 'moved' | 'not_moved' | 'deleted' | 'added'
export type Diff = {
  index: number,
  value: string,
  type: DiffTypes
}
export interface GroupedDiff {
  from: number;
  to: number;
  type: DiffTypes
  value: string
}

export interface StringDiffs {
  aDiffs: GroupedDiff[],
  bDiffs: GroupedDiff[]
}

export interface Node extends BaseNode {
  parentNode: Node | null,
  childNodes: Node[]
  payload: {
    indexA: number,
    indexB: number,
    processed: boolean
    value: string,
  }
}
