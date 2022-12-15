import { Diff, movedStrings } from '../src'

test('Very first test case', () => {
  const A = 'string CCCC my custom'
  const B = 'my XXX custom string'
  const expected = [{ value: 'strin', from: 0, to: 4 }]
  expect(movedStrings(A, B)).toEqual(expected)
})

test('Very second test case', () => {
  const A = 'this is a sample text'
  const B = 'this text is sample'
  const expected:Diff[] = [
    { value: 'is', from: 5, to: 6 },
    { value: ' sampl', from: 9, to: 14 }
  ]
  expect(movedStrings(A, B)).toEqual(expected)
})
