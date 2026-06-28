'use strict'

/**
 * Vitest setup file — runs once in the fork process that executes all tests
 *
 * This file is loaded via `setupFiles` in vitest.config.js. Any `afterAll` registered here fires after every test
 * file has finished, just before the fork process exits.
 *
 * Without this, Knex keeps its connection pool alive after the last test, holding open pg socket handles and preventing
 * the fork from exiting naturally. Vitest then hangs waiting for the fork, and the CI action never progresses past the
 * test step.
 *
 * @module Setup
 */

afterAll(async () => {
  // Only destroy the pool if db/db.js was actually imported during this run. Requiring it here when it was never
  // imported would open a fresh connection just to immediately tear it down.
  const dbModulePath = require.resolve('../db/db.js')

  if (require.cache[dbModulePath]) {
    const { db } = require('../db/db.js')
    await db.destroy()
  }
})
