---
name: testing
description: Testing standards and conventions for this project
---

# Testing skill

## Framework

- Use `@hapi/lab` and `@hapi/code` — not Jest, Mocha, or Chai
- Use `sinon` for stubs and spies

## Test file structure

Test files do not use JSDoc or `@module`. The top-of-file order is `'use strict'` followed by imports grouped by section comment:

```js
'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SomeModelStub = require('../support/stubs/some-model.stub.js')

// Things we need to stub
const SomeDal = require('../../app/dal/some.dal.js')

// Thing under test
const SubjectUnderTest = require('../../app/services/subject-under-test.service.js')
```

- Use these section comments in order, omitting any that are not needed:
  1. `// Test framework dependencies`
  2. `// Test helpers`
  3. `// Things we need to stub`
  4. `// Thing under test`
- The Lab destructuring line and `const { expect } = Code` follow immediately after the framework `require()` calls — no blank line between them
- Alphabetical ordering within each section still applies (alanisms rule 2)
- The top-level `describe` label must reflect the file's folder path. Each path segment is title-cased and joined with ` - `, followed by the module type:

  ```js
  // test/services/notices/setup/fetch-notice.service.test.js
  describe('Notices - Setup - Fetch Notice service', () => {
    // ...
  })
  ```

## Sinon

- Always call `Sinon.restore()` in `afterEach` whenever stubs are used
- Never leave stubs active across tests

## Writing tests

- Tests live in `test/` mirroring the `app/` structure
- Test file names match the module they test with a `.test.js` extension (e.g. `delete-session.dal.test.js`)
- Test behaviour, not implementation
- Never leave `describe.only()` or `it.only()` in committed code — CI will fail on these
- Use nested `describe` blocks to group scenarios (e.g. `describe('when valid', ...)`, `describe('when invalid', ...)`)
