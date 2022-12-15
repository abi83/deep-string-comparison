/**
 * Very basic and 'agile' tuple class
 * Tuple length is restirted to 2
 * Tuple can be created like new Tuple(100,200) and
 */
export class Tuple {
  private readonly _value: string
  separator: string

  constructor(...tupleElements: [string] | [number, number]) {
    this.separator = '__'
    if (tupleElements.length === 1 &&
      typeof tupleElements[0] === 'string'
    ) {
      const tupleValue = tupleElements[0]
      if (tupleValue.split(this.separator).length !== 2) {
        throw new Error('Not a valid tuple value')
      }
      this._value = tupleValue
      return
    }
    this._value = String(tupleElements[0]) + this.separator + String(tupleElements[1])
  }

  get value() : string {
    return this._value
  }
  get elements(): [number, number] {
    const elements = this._value.split(this.separator).map(el => Number(el))
    return [ elements[0], elements[1] ]
  }
}
