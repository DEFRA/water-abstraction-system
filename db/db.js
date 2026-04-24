'use strict'

const environment = process.env.NODE_ENV || 'development'

const dbConfig = require('../knexfile.application.js')[environment]

// Where the 'pg' package has concern that parsing a DB value into its JavaScript equivalent will lead to a loss of
// data it will return the value as a string. For example, a PostgreSQL BigInt has the range -9223372036854775808 to
// 9223372036854775807. A JavaScript Integer (its closest type) only has the range -9007199254740991 to
// 9007199254740991.
//
// The intent is it's on us, as the developers, to determine how each value should be used. Fortunately, we know we are
// never using values that are large enough to concern ourselves with any loss of precision.
//
// So, to avoid having to deal with converting strings explicitly in our code we can tell the pg driver to parse these
// problematic values instead. See the following for more details about both the issue and this config change
// https://github.com/brianc/node-postgres/pull/353
// https://github.com/knex/knex/issues/387#issuecomment-51554522
// https://stackoverflow.com/a/39176670/6117745
const pg = require('pg')

console.log(`🚀 ~ Enabling pg type parsers for INT8 and NUMERIC to avoid loss of precision`)
console.log(`🚀 ~ Env var is ${process.env.TRACE_PG_DEPRECATION_WARNING}`)
console.log(`🚀 ~ Env var equals ${process.env.TRACE_PG_DEPRECATION_WARNING === 'true'}`)

if (process.env.TRACE_PG_DEPRECATION_WARNING === 'true' && !pg.Client.prototype._tracePgDeprecationWarningPatched) {
  console.log('🚀 ~ Patching pg.Client.prototype.query to trace concurrent queries')
  const originalQuery = pg.Client.prototype.query
  const activeClients = new Set()

  process.__tracePgDumpActiveQueries = () => {
    if (activeClients.size === 0) {
      console.error('[TRACE_PG_DEPRECATION_WARNING] No active client query traces available')
      return
    }

    console.error(`[TRACE_PG_DEPRECATION_WARNING] Active clients: ${activeClients.size}`)

    for (const client of activeClients) {
      console.error('[TRACE_PG_DEPRECATION_WARNING] --- active client ---')
      console.error(`[TRACE_PG_DEPRECATION_WARNING] in-flight count: ${client._tracePgInFlightQueryCount ?? 0}`)
      if (client._tracePgActiveQuerySql) {
        console.error(`[TRACE_PG_DEPRECATION_WARNING] active SQL: ${client._tracePgActiveQuerySql}`)
      }
      if (client._tracePgActiveQueryStack) {
        console.error(client._tracePgActiveQueryStack)
      }
    }
  }

  pg.Client.prototype.query = function patchedQuery(...args) {
    this._tracePgInFlightQueryCount = this._tracePgInFlightQueryCount ?? 0
    this._tracePgActiveQueryStack = this._tracePgActiveQueryStack ?? null
    this._tracePgActiveQuerySql = this._tracePgActiveQuerySql ?? null

    const sql = typeof args[0] === 'string' ? args[0] : args[0]?.text
    const incomingStack = new Error('[TRACE_PG_DEPRECATION_WARNING] incoming query callsite').stack

    if (this._tracePgInFlightQueryCount > 0) {
      console.error('\n[TRACE_PG_DEPRECATION_WARNING] concurrent client.query call attempted')
      if (sql) {
        console.error(`[TRACE_PG_DEPRECATION_WARNING] incoming SQL: ${sql}`)
      }
      if (this._tracePgActiveQuerySql) {
        console.error(`[TRACE_PG_DEPRECATION_WARNING] active SQL: ${this._tracePgActiveQuerySql}`)
      }
      console.error(incomingStack)
      if (this._tracePgActiveQueryStack) {
        console.error(this._tracePgActiveQueryStack)
      }
    }

    this._tracePgInFlightQueryCount += 1
    this._tracePgActiveQueryStack = incomingStack
    this._tracePgActiveQuerySql = sql ?? null
    activeClients.add(this)

    let released = false
    const release = () => {
      if (released) {
        return
      }

      released = true
      this._tracePgInFlightQueryCount -= 1

      if (this._tracePgInFlightQueryCount === 0) {
        this._tracePgActiveQueryStack = null
        this._tracePgActiveQuerySql = null
        activeClients.delete(this)
      }
    }

    const callbackIndex = args.findIndex((arg) => typeof arg === 'function')
    if (callbackIndex !== -1) {
      const originalCallback = args[callbackIndex]
      args[callbackIndex] = (...callbackArgs) => {
        release()
        return originalCallback(...callbackArgs)
      }
    }

    const result = originalQuery.apply(this, args)

    if (result && typeof result.finally === 'function') {
      return result.finally(() => {
        release()
      })
    }

    if (result && typeof result.once === 'function') {
      result.once('end', release)
      result.once('error', release)

      return result
    }

    release()

    return result
  }

  pg.Client.prototype._tracePgDeprecationWarningPatched = true
}

pg.types.setTypeParser(pg.types.builtins.INT8, (value) => {
  return Number.parseInt(value)
})

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => {
  return Number.parseFloat(value)
})

const db = require('knex')(dbConfig)

module.exports = { db, dbConfig }
