---
name: testing
description: Testing standards and conventions for this project
---

# Testing skill

## Framework

- Use `vitest` — not Jest, Mocha, Chai, or Sinon
- `vitest` runs with `globals: false`, so `describe`, `it`, `expect`, `beforeAll`, `afterAll`, `beforeEach`, `afterEach`, and `vi` must always be imported explicitly from `'vitest'`
- Test files are ESM. No `'use strict'`, no `require()` — use `import`

## Test file structure

Test files do not use JSDoc or `@module`. The top-of-file order is imports grouped by section comment:

```js
// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SomeModelHelper from '../support/helpers/some-model.helper.js'

// Things we need to stub
import * as SomeDal from '../../app/dal/some.dal.js'

// Thing under test
import SubjectUnderTest from '../../app/services/subject-under-test.service.js'
```

- Use these section comments in order, omitting any that are not needed:
  1. `// Test framework` (omit entirely when only Vitest globals are needed — i.e. no other imports)
  2. `// Test helpers`
  3. `// Things we need to stub`
  4. `// Thing under test`
  5. `// For running our service` (controller tests only — the `init` import used to start the Hapi server)
- Alphabetical ordering within each section still applies (alanisms rule 2)
- The top-level `describe` label must reflect the file's folder path. Each path segment is title-cased and joined with ` - `, followed by the module type:

  ```js
  // test/services/notices/setup/fetch-notice.service.test.js
  describe('Notices - Setup - Fetch Notice service', () => {
    // ...
  })
  ```

## Controller tests

- Start the server in `beforeAll` and stop it in `afterAll` with `await server.stop()`

## Stubbing and spying

Use `vi.spyOn()` and `vi.fn()` — vitest's built-in mocking, not Sinon.

- To stub a static/class method (e.g. an Objection model), spy directly on the default import — mutating a method on the object works even though the import binding itself is read-only:

```js
import ReturnLogModel from '../../../app/models/return-log.model.js'

vi.spyOn(ReturnLogModel, 'query').mockReturnValue({
  patch: vi.fn().mockReturnThis(),
  findById: vi.fn().mockResolvedValue()
})
```

- To stub a module's default-exported function (e.g. a service or DAL), you can't spy on the default import binding directly — import it as a namespace instead and spy on the `'default'` property:

```js
import * as FetchBillService from '../../../app/services/bills/fetch-bill-service.js'

vi.spyOn(FetchBillService, 'default').mockResolvedValue(billData)
```

- Always call `vi.restoreAllMocks()` in `afterEach` whenever stubs are used
- Never leave stubs active across tests

## Mocking

- Never use `vi.mock()` or `vi.doMock()`. They hoist to the top of the file, auto-mock every export, and behave inconsistently between CJS and ESM — they've caused real problems in this codebase and are banned
- Use the `vi.spyOn()` patterns above instead
- This also works for named exports of third-party packages, e.g. `vi.spyOn(Tar, 'create')` against `import * as Tar from 'tar'`
- If a module genuinely cannot be stubbed this way (e.g. a CJS module with a module-level singleton, or a package whose live bindings can't be intercepted), use `Proxyquire` instead — see `test/plugins/airbrake.plugin.test.js` for an example. Don't reach for `vi.mock()`/`vi.doMock()` as a workaround

## Assertions

- Vitest assertions use `.toEqual()`, `.toBe()`, etc. directly on `expect()`
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
