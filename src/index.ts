import { StringComparer } from './comparator/comparator'
import { StringDiffs, GroupedDiff, DiffTypes } from './comparator/comparer.types'

const comparator = (first: string, second: string): StringDiffs => {
  return new StringComparer(first, second).getDiffs()
}

export { comparator }
export { StringDiffs, GroupedDiff, DiffTypes }
