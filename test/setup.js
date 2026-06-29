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
  // Always destroy the Knex pool after each test file. Knex's pool library (tarn) creates a setInterval reaper on
  // every instance — even idle ones — which keeps the fork process alive after tests complete. db.destroy() is the
  // only thing that stops it. With pool.min set to 0 in the test knex config, requiring db here when it was never
  // imported by the test file creates no real connections, so the destroy is cheap.
  const { db } = require('../db/db.js')
  await db.destroy()

  // Diagnostic: report any handles still alive after teardown. process.stderr is unbuffered so this appears in CI
  // logs immediately. The last occurrence in the log (just before the step timeout) identifies what is preventing
  // the fork from exiting. Remove once the root cause is confirmed and fixed.
  const handles = process._getActiveHandles()

  if (handles.length > 0) {
    const names = handles.map((h) => h.constructor?.name ?? String(h)).join(', ')

    process.stderr.write(`[vitest/setup] ${handles.length} open handle(s) after teardown: ${names}\n`)
  }
})
