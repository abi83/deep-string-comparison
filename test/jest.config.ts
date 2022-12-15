import { InitialOptionsTsJest } from 'ts-jest/dist/types'

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
}

export default config

// TODO: 1. Move jest.config to test folder
// TODO: 2. Separate tsconfig for test files
// TODO: 3. Remove prettier from package.json
// TODO: 4. Rename, clean and refactor tests
