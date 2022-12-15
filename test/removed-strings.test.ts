import { removedStrings } from '../src'
import { Diff } from '../src'

test('Same strings return empty array', () => {
  expect(removedStrings('abc', 'abc')).toEqual([])
})

test('Substring inside string marked as removed correctly', () => {
  const output = removedStrings('My custom string', 'My string')
  const expected: Diff[] = [{ from: 3, to: 8, value: 'custom' }]
  expect(output).toEqual(expected)
})

test('With reordered string no substring marked as removed', () => {
  const output = removedStrings('My custom string', 'string custom My')
  expect(output).toEqual([])
})

test('Start substring removing indicates correctly', () => {
  const output = removedStrings('custom my string', 'my string')
  const expected: Diff[] = [{ from: 0, to: 6, value: 'custom ' }]
  expect(output).toEqual(expected)
})

test('End substring removing indicates correctly', () => {
  const output = removedStrings('My string is custom', 'My string')
  const expected: Diff[] = [{ from: 9, to: 18, value: ' is custom' }]
  expect(output).toEqual(expected)
})
//
test('Multiple removes indicates correctly', () => {
  const output = removedStrings('My xxxx string yyyy is custom', 'My string is custom')
  const expected: Diff[] = [
    { from: 3, to: 6, value: 'xxxx' },
    { from: 15, to: 18, value: 'yyyy' }
  ]
  expect(output).toEqual(expected)
})

test('Spaces removes indicates correctly', () => {
  const output = removedStrings('My (    ) string is custom', 'My () string is custom')
  const expected: Diff[] = [{ from: 4, to: 7, value: '    ' }]
  expect(output).toEqual(expected)
})

test('Two symbols removes indicates correctly', () => {
  const output = removedStrings('My 12 string is custom', 'My string is custom')
  const expected: Diff[] = [{ from: 3, to: 4, value: '12' }]
  expect(output).toEqual(expected)
})

test('One removed symbol indicates correctly', () => {
  const output = removedStrings('My str_ing is custom', 'My string is custom')
  const expected: Diff[] = [{ from: 6, to: 6, value: '_' }]
  expect(output).toEqual(expected)
})

test('Same text removed indicates correctly', () => {
  const output = removedStrings(
    'My XXX string XXX is XXX custom',
    'My string XXX is XXX custom'
  )
  const expected: Diff[] = [{ from: 3, to: 5, value: 'XXX' }]
  expect(output).toEqual(expected)
})

test('Same text removed indicates correctly!!', () => {
  const output = removedStrings(
    'My XX string XX is XX custom',
    'My string XX is XX custom'
  )
  const expected: Diff[] = [{ from: 3, to: 4, value: 'XX' }]
  expect(output).toEqual(expected)
})

test('____Same text removed indicates correctly!!', () => {
  const output = removedStrings(
    'My AB string AB is custom',
    'AB My string is AB custom'
  )
  const expected: Diff[] = []
  expect(output).toEqual(expected)
})

test('__Confused removing works almost nice', () => {
  const output = removedStrings(
    'My ABCX0 string is custom',
    'ABAY1 My string is custom'
  )
  const expected: Diff[] = [{ from: 4, to: 7, value: 'BCX0' }]
  expect(output).toEqual(expected)
})

test('Case change marked as removed', () => {
  const output = removedStrings(
    'My string is custom',
    'My STRING is custom'
  )
  const expected: Diff[] = [{ 'from': 3, 'to': 8, 'value': 'string' }]
  expect(output).toEqual(expected)
})

test('One symbol removed from the end indicates correctly', () => {
  const output = removedStrings(
    'My string is custom_',
    'My string is custom'
  )
  const expected: Diff[] = [{ 'from': 19, 'to': 19, 'value': '_' }]
  expect(output).toEqual(expected)
})

test('One specific case (no value duplicates)', () => {
  const A = 'string CCC my custom'
  const B = 'my XXX custom string'
  const expected: Diff[] = [{ value: ' CCC ', to: 10, from: 6 }]
  expect(removedStrings(A, B)).toEqual(expected)
})

test('Lorem ipsum', () => {
  // eslint-disable-next-line max-len
  const a = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
  // eslint-disable-next-line max-len
  const b = 'Lorem ipsum sit amet, consectetur adipiscing elit, sed do tempor incididunt ut labore et e magna aliqua. Ut enim ad minim veniam, quis exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt anim id est laborum'
  const expected: Diff[] = [
    { from: 12, to: 16, value: 'dolor' },
    { from: 64, to: 70, value: 'eiusmod' },
    { from: 103, to: 107, value: 'dolor' },
    { from: 154, to: 160, value: 'nostrud' },
    { from: 418, to: 423, value: 'mollit' }
  ]
  expect(removedStrings(a, b)).toEqual(expected)
})
