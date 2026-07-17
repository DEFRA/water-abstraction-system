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

This applies everywhere: return values, inline objects, export declarations, test assertions.

## 2 — `import` statements must be in alphabetical order by variable name

Within each group (see rule 3), sort imports A–Z by the imported identifier. Named (destructured) imports are an exception: place them after non-destructured (default) imports within the same group, then sort named imports alphabetically by file name (not by the variable names being imported).

```js
// Bad
import path from 'path'
import crypto from 'node:crypto'

// Good
import crypto from 'node:crypto'
import path from 'path'

// Bad — named imports mixed with default imports
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import { flashNotification } from '../../../../lib/general.lib.js'
import { formatValidationResult } from '../../../../presenters/base.presenter.js'
import PermissionsPresenter from '../../../../presenters/users/internal/setup/permissions.presenter.js'

// Good — default imports first (sorted by variable name), then named imports (sorted by file name)
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import PermissionsPresenter from '../../../../presenters/users/internal/setup/permissions.presenter.js'
import { formatValidationResult } from '../../../../presenters/base.presenter.js'
import { flashNotification } from '../../../../lib/general.lib.js'
```

## 3 — External packages, internal dependencies, and config modules must be in separate groups

Group 1 is external packages (from `node_modules`, including `node:` builtins). Group 2 is internal dependencies (relative paths). Group 3 is config modules (from `config/`). Separate the groups with a blank line. Each group is sorted alphabetically (rule 2).

```js
// Bad — external packages and config mixed with other internals, and not in alpha order
import crypto from 'node:crypto'
import LicenceModel from '../../../models/licence.model.js'
import path from 'path'
import DatabaseConfig from '../../../../config/database.config.js'
import ViewNoticeService from '../../../services/notices/view-notice.service.js'

// Good — three groups, each in alpha order
import crypto from 'node:crypto'
import path from 'path'

import LicenceModel from '../../../models/licence.model.js'
import ViewNoticeService from '../../../services/notices/view-notice.service.js'

import DatabaseConfig from '../../../../config/database.config.js'
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

## 5 — File structure order: `@module` JSDoc then imports

Every file must follow this top-of-file order:

1. The `@module` JSDoc block
2. `import` statements (grouped and sorted per rules 2 and 3)

ESM modules are always in strict mode — `'use strict'` is no longer needed and must not be added.

```js
// Bad — imports before @module, or @module at the bottom
import FetchSessionDal from '../../dal/fetch-session.dal.js'

/**
 * @module MyService
 */

// Good
/**
 * Does the thing.
 *
 * @module MyService
 */

import FetchSessionDal from '../../dal/fetch-session.dal.js'
```
