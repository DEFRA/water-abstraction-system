---
name: testing
description: Testing standards and conventions for this project
---

# Testing skill

## Framework

- Use `vitest` — not Jest, Mocha, or Chai
- Use `sinon` for stubs and spies
- `vitest` runs with `globals: true`, so `describe`, `it`, `expect`, `beforeAll`, `afterAll`, `beforeEach`, `afterEach`, and `vi` are all available without importing

## Test file structure

Test files do not use JSDoc or `@module`. The top-of-file order is `'use strict'` followed by imports grouped by section comment:

```js
'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SomeModelStub = require('../support/stubs/some-model.stub.js')

// Things we need to stub
const SomeDal = require('../../app/dal/some.dal.js')

// Thing under test
const SubjectUnderTest = require('../../app/services/subject-under-test.service.js')
```

- Use these section comments in order, omitting any that are not needed:
  1. `// Test framework dependencies` (omit entirely when only Vitest globals are needed — i.e. no Sinon or other requires)
  2. `// Test helpers`
  3. `// Things we need to stub`
  4. `// Thing under test`
- Alphabetical ordering within each section still applies (alanisms rule 2)
- The top-level `describe` label must reflect the file's folder path. Each path segment is title-cased and joined with ` - `, followed by the module type:

  ```js
  // test/services/notices/setup/fetch-notice.service.test.js
  describe('Notices - Setup - Fetch Notice service', () => {
    // ...
  })
  ```

## Controller tests

- Always call `await server.stop()` in `after`

## Sinon

- Always call `Sinon.restore()` in `afterEach` whenever stubs are used
- Never leave stubs active across tests

## Assertions

- Vitest assertions use `.toEqual()`, `.toBe()`, etc. directly on `expect()`:
- Never inline computed values directly in `expect()` — assign them to a variable first, then wrap in the array at the assertion. Always leave a blank line between the assignment and the `expect()`:

```js
// wrong
expect(results).to.equal([SomeSeeder.transform(record)])

// right
const expectedResult = SomeSeeder.transform(record)

expect(results).toEqual([expectedResult])
```

For comparing objects while ignoring specific fields (e.g. timestamps), use `.toMatchObject()`:

```js
// Checks all testRecord properties are present in result — ignores extra fields like createdAt
expect(result).toMatchObject(testRecord)
```

## Running tests

Use the docker exec wrapper to run tests. You can pass specific files or patterns as additional arguments:

```sh
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm run test -- test/services/notices/setup/my-service.test.js'
docker compose exec dev /bin/bash -c 'cd /home/repos/water-abstraction-system && npm run test -- test/services/notices/setup/foo.test.js test/services/notices/setup/bar.test.js'
```

Do not use `npx vitest` directly.

## Writing tests

- Tests live in `test/` mirroring the `app/` structure
- Test file names match the module they test with a `.test.js` extension (e.g. `delete-session.dal.test.js`)
- Test behaviour, not implementation
- Never leave `describe.only()` or `it.only()` in committed code — CI will fail on these
- Use nested `describe` blocks to group scenarios (e.g. `describe('when valid', ...)`, `describe('when invalid', ...)`)
