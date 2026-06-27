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

## Lifecycle hooks

Lab's `before` and `after` hooks are `beforeAll` and `afterAll` in Vitest:

- `beforeAll` — runs once before all tests in the current `describe` scope
- `afterAll` — runs once after all tests in the current `describe` scope
- `beforeEach` / `afterEach` — unchanged

## Sinon

- Always call `Sinon.restore()` in `afterEach` whenever stubs are used
- Never leave stubs active across tests

## Assertions

Vitest assertions use `.toEqual()`, `.toBe()`, etc. directly on `expect()`:

```js
// wrong
expect(results).to.equal([SomeSeeder.transform(record)])

// right
const expectedResult = SomeSeeder.transform(record)

expect(results).toEqual([expectedResult])
```

Common assertion mappings from the old `@hapi/code` style:

| Old (`@hapi/code`) | New (Vitest) |
|---|---|
| `.to.equal(x)` | `.toEqual(x)` |
| `.to.be.true()` | `.toBe(true)` |
| `.to.be.false()` | `.toBe(false)` |
| `.to.be.null()` | `.toBeNull()` |
| `.to.be.undefined()` | `.toBeUndefined()` |
| `.to.exist()` | `.toBeDefined()` |
| `.to.not.exist()` | `.toBeUndefined()` |
| `.to.include(x)` / `.to.contain(x)` | `.toContain(x)` |
| `.to.have.length(n)` | `.toHaveLength(n)` |
| `.to.be.instanceOf(X)` / `.to.be.an.instanceOf(X)` | `.toBeInstanceOf(X)` |
| `.to.be.an.array()` | `.toBeInstanceOf(Array)` |
| `.to.be.an.error()` | `.toBeInstanceOf(Error)` |
| `.to.be.empty()` | `.toHaveLength(0)` |
| `await expect(fn).to.reject()` | `await expect(fn).rejects.toThrow()` |
| `await expect(fn).to.reject(E, 'msg')` | `await expect(fn).rejects.toThrow('msg')` |

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
