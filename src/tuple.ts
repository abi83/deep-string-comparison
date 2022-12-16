import { SEPARATOR, ERROR_MESSAGES } from './tuple.literals'

/**
 * Very basic and 'agile' tuple class
 * Tuple length is always two elements
 * The tuple can be created from a pair of numbers, as well as from a string value,
 * returned from another tuple.
 */
export class Tuple {
  private readonly _value: string

  constructor(...tupleElements: [string] | [number, number]) {
    if (
      // string value to build a tuple
      tupleElements.length === 1 &&
      typeof tupleElements[0] === 'string'
    ) {
      this._value = this.validateTupleValue(tupleElements[0])
      return
    }
    // a pair of numbers to build a tuple
    this._value = String(tupleElements[0]) + SEPARATOR + String(tupleElements[1])
  }

  private validateTupleValue(tupleValue: string): string {
    if (!tupleValue.includes(SEPARATOR))
      throw new Error(ERROR_MESSAGES.NO_SEPARATOR)

    if (tupleValue.split(SEPARATOR).length !== 2)
      throw new Error(ERROR_MESSAGES.WRONG_LENGTH)

    tupleValue.split(SEPARATOR).forEach((tupleElement) => {
      if (isNaN(Number(tupleElement)))
        throw new Error(ERROR_MESSAGES.ONLY_NUMBERS)
    })
    return tupleValue
  }

  get value() : string {
    return this._value
  }

  get elements(): [number, number] {
    const elements = this._value
      .split(SEPARATOR)
      .map(el => Number(el))
    return [ elements[0], elements[1] ]
  }
}
