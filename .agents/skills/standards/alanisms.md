---
name: alanisms
description: Non-negotiable code conventions that cannot be enforced by automation or linting
---

# Alanisms

Quirky but non-negotiable code conventions from our lead engineer. They cannot be enforced by automation or linting, so they require active judgement on every change.

> This file is a living document. New ones will be added as they are identified.

## 1 — Object keys must be in alphabetical order

All object literals must have their keys sorted A–Z.

```js
// Bad
return {
  pageTitle: 'Jokes',
  joke: data.joke,
  backLink: { href: '/', text: 'Back' }
}

// Good
return {
  backLink: { href: '/', text: 'Back' },
  joke: data.joke,
  pageTitle: 'Jokes'
}
```

This applies everywhere: return values, inline objects, `module.exports`, test assertions.

## 2 — `require()` imports must be in alphabetical order by variable name

Within each group (see rule 3), sort imports A–Z by variable name.

```js
// Bad
const path = require('path')
const crypto = require('node:crypto')

// Good
const crypto = require('node:crypto')
const path = require('path')
```

## 3 — External packages, internal dependencies, and config modules must be in separate groups

Group 1 is external packages (from `node_modules`). Group 2 is internal dependencies (relative paths). Group 3 is config modules (from `config/`). Separate the groups with a blank line. Each group is sorted alphabetically (rule 2).

```js
// Bad — external packages and config mixed with other internals, and not in alpha order
const crypto = require('node:crypto')
const LicenceModel = require('../../../models/licence.model.js')
const path = require('path')
const DatabaseConfig = require('../../../../config/database.config.js')
const ViewNoticeService = require('../../../services/notices/view-notice.service.js')

// Good — three groups, each in alpha order
const crypto = require('node:crypto')
const path = require('path')

const LicenceModel = require('../../../models/licence.model.js')
const ViewNoticeService = require('../../../services/notices/view-notice.service.js')

const DatabaseConfig = require('../../../../config/database.config.js')
```

## 4 — Blank line after variable declarations before the first statement

A blank line must separate variable declarations from the first non-declaration statement. When mixing `const` and `let` declarations, each declaration kind must also be separated from the next by a blank line.

```js
// Bad — no blank line before statement
const username = 'alan.thegreat@gmail.com'
await UserModel.query().insert({ username })

// Good — blank line before statement
const username = 'alan.thegreat@gmail.com'

await UserModel.query().insert({ username })

// Good — multiple declarations of the same kind, one blank line before statement
const username = 'alan.thegreat@gmail.com'
const lastLogin = new Date()

await UserModel.query().insert({ lastLogin, username })

// Bad — mixed const/let with no blank lines between kinds
const username = 'alan.thegreat@gmail.com'
let lastLogin = new Date()
await UserModel.query().insert({ lastLogin, username })

// Good — blank line between const and let, and before statement
const username = 'alan.thegreat@gmail.com'

let lastLogin = new Date()

await UserModel.query().insert({ lastLogin, username })
```

## 5 — File structure order: `'use strict'`, then `@module` JSDoc, then imports

Every file must follow this top-of-file order:

1. `'use strict'`
2. The `@module` JSDoc block
3. `require()` imports (grouped and sorted per rules 2 and 3)

```js
// Bad — imports before @module, or @module at the bottom
'use strict'

const FetchSessionDal = require('../../dal/fetch-session.dal.js')

/**
 * @module MyService
 */

// Good
'use strict'

/**
 * Does the thing.
 *
 * @module MyService
 */

const FetchSessionDal = require('../../dal/fetch-session.dal.js')
```
