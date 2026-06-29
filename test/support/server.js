'use strict'

/**
 * Test helper for creating a Hapi server instance
 * @module ServerHelper
 */

const { init } = require('../../app/server.js')

/**
 * Initialise the Hapi server and register an afterAll hook to stop it
 *
 * Hapi's `server.initialize()` starts all registered Catbox caches. Each cache uses a `setInterval` timer internally
 * for TTL/pruning. Without an explicit `server.stop()` those timers remain active after the test file finishes,
 * preventing the Vitest fork process from exiting and causing CI to hang.
 *
 * Calling this helper instead of `init()` directly ensures the server is always stopped at the end of the test file.
 *
 * @returns {Promise<object>} the initialised Hapi server
 */
async function createServer() {
  const server = await init()

  afterAll(() => server.stop())

  return server
}

module.exports = { createServer }
