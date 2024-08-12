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

pg.types.setTypeParser(pg.types.builtins.INT8, (value) => {
  return parseInt(value)
})

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => {
  return parseFloat(value)
})

const db = require('knex')(dbConfig)

module.exports = { db, dbConfig }
