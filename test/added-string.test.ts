import { addedStrings, removedStrings } from '../src'

it('Should revert removedString result', () => {
  const A = 'my ABCD custom string'
  const B = 'my custom WXYZ string'
  expect(addedStrings(A, B)).toEqual(removedStrings(B, A))
})
