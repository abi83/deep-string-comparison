import { BaseNode } from './tree.types'

export type DiffTypes = 'moved' | 'not_moved' | 'deleted' | 'added'
export type SingleDiff = {
  index: number,
  value: string,
  type: DiffTypes
}
export type GroupedDiff = {
  from: number;
  to: number;
  type: DiffTypes
  value: string
}

export type Output = {
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
    value?: string,
  }
}
