export interface Diff {
  from: number;
  to: number;
  value: string;
}

function substringIncludedTimes(subString:string, string:string) {
  const searchReGex = new RegExp(
    subString.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'
  )
  return [ ...string.matchAll(searchReGex) ].length
}

const EMPTY: Diff = { from: 0, to: 0, value: '' }

/**
 * Some function to calculate removed parts in the string
 * @param a
 * @param b
 */
function removedStrings(a:string, b:string): Diff[] {
  const removedParts: Diff[] = []
  let matchingSequence = a[0] === b[0]
  let removedValue:Diff = EMPTY
  for (let index = 0; index < a.length; index++) {
    for (let subIndex = 0; subIndex < a.length - index; subIndex++) {
      const currentIndex = index + subIndex

      const currentAndNextSymbols = a.substring(currentIndex, currentIndex + 2)
      const isCurrentAndNextSymbolsRemoved = !(
        b.includes(currentAndNextSymbols)
          && substringIncludedTimes(currentAndNextSymbols, a)
          === substringIncludedTimes(currentAndNextSymbols, b)
      )

      if (matchingSequence) {
        const subStringToSearch = a.substring(index, currentIndex + 1)
        const isSubStringFound = b.includes(subStringToSearch)
        //The sequence is still matching
        if (isSubStringFound) continue

        matchingSequence = false
        if (isCurrentAndNextSymbolsRemoved) {
          removedValue = { value: a[currentIndex], from: currentIndex, to: currentIndex }
        }
        continue
      }

      // not matching (removed) sequence
      const isSymbolRemoved = !b.includes(a[currentIndex])
      if (isSymbolRemoved || isCurrentAndNextSymbolsRemoved) {
        removedValue = {
          value: removedValue.value + a[currentIndex],
          to: currentIndex,
          from: currentIndex - removedValue.value.length
        }
        continue
      }
      matchingSequence = true
      if (removedValue.value.length > 0 && !removedParts.includes(removedValue)) {
        removedParts.push(removedValue)
      }
      index = Math.max(removedValue.to, currentIndex + 1)
      break
    }
  }
  return removedParts
}

function addedStrings(a: string, b: string): Diff[] {
  return removedStrings(b, a)
}

function movedStrings(a: string, b: string): Diff[] {
  const changedParts: Diff[] = []
  let matchingSequence = a[0] === b[0]
  let changedPart:Diff = EMPTY
  for (let index = 0; index < a.length; index++) {
    for (let subIndex = 0; subIndex < a.length - index; subIndex++) {
      const currentIndex = index + subIndex

      const currentAndNextSymbols = a.substring(currentIndex, currentIndex + 2)
      const isCurrentAndNextSymbolsRemoved = !(
        b.includes(currentAndNextSymbols)
        && substringIncludedTimes(currentAndNextSymbols, a)
        === substringIncludedTimes(currentAndNextSymbols, b)
      )
      console.warn(currentIndex)
      if (matchingSequence) {
        const subStringToSearch = a.substring(index, currentIndex + 1)
        const isSubStringFound = b.includes(subStringToSearch)
        //The sequence is still matching
        if (isSubStringFound) continue

        matchingSequence = false
        if (!isCurrentAndNextSymbolsRemoved) {
          changedPart = { value: a[currentIndex], from: currentIndex, to: currentIndex }
        }
        continue
      }

      // not matching (removed) sequence
      const isSymbolRemoved = !b.includes(a[currentIndex])
      if (!isSymbolRemoved && !isCurrentAndNextSymbolsRemoved) {
        changedPart = {
          value: changedPart.value + a[currentIndex],
          to: currentIndex,
          from: currentIndex - changedPart.value.length
        }
        continue
      }
      matchingSequence = true
      if (changedPart.value.length > 0 && !changedParts.includes(changedPart)) {
        changedParts.push(changedPart)
      }
      index = Math.max(changedPart.to, currentIndex)
      break
    }
  }
  return changedParts
}

export { removedStrings, movedStrings, addedStrings }
