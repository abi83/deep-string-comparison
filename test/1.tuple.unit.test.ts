import { Tuple } from '../src/tuple'

const EXPECTED_SEPARATOR = '__' //expected tuple value like "12__34"
describe('Uni tests for Tupple class', () => {
  it('Should create a tuple from two numbers and return tuple value', () => {
    const tuple = new Tuple(12, 34)
    expect(tuple.value).toEqual(`12${EXPECTED_SEPARATOR}34`)
  })

  it('Should return a pair of numbers from string value', () => {
    const tuple = new Tuple(`12${EXPECTED_SEPARATOR}34`)
    expect(tuple.elements).toEqual([ 12, 34 ])
  })

  it('Should ignore third and all subsequent numbers on tuple creation', () => {
    // @ts-expect-error
    const tupleOne = new Tuple(12, 34, 56)
    expect(tupleOne.value).toEqual(`12${EXPECTED_SEPARATOR}34`)
  })

  it('Should throw an error on wrong separator', () => {
    expect(() => {
      new Tuple('12_34')
    }).toThrow(
      `Tuple string value should contain a valid separator: "${EXPECTED_SEPARATOR}"`)
  })

  it('Should throw an error on wrong elements number in the string value', () => {
    expect(() => {
      new Tuple(`12${EXPECTED_SEPARATOR}34${EXPECTED_SEPARATOR}56`)
    }).toThrow('Tuple can be build only from two elements')
  })

  it('Should throw an error on building a tuple from NaN elements', () => {
    expect(() => {
      new Tuple(`firstValue${EXPECTED_SEPARATOR}secondValue`)
    }).toThrow('Tuple can be build only from numbers')
  })
})
