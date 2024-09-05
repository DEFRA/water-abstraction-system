'use strict'

const { legacyDbSnakeCaseMappers } = require('./app/lib/legacy-db-snake-case-mappers.lib.js')

/**
 * Passing in our variant of `knexSnakeCaseMappers` allows us to use camelCase everywhere and knex will convert it to
 * snake_case on the fly. (see `app/lib/legacy-db-snake-case-mappers.lib.js` for details on why we have our own
 * variant)
 *
 * This means when we access a property on the model we can use camelCase even if the underlying database property
 * was snake_case. It also means we get camelCase object keys, handy when you need to return a db query result as is
 * in a response.
 *
 * @see {@link https://vincit.github.io/objection.js/recipes/snake-case-to-camel-case-conversion.html}
 *
 * We set the `underscoreBeforeDigits` option so that properties like lineAttr1 are correctly changed to line_attr_1.
 *
 * However, this causes issues with migrations as it works differently. It still applies the underscore before the digit
 * even if the rest of the name is snake case. For example, a migration to create `line_attr_1` will actually create
 * `line_attr__1`. So, we only add `knexSnakeCaseMappers` when running the application to ensure that it isn't applied
 * to migrations.
 */

const knexfile = require('./knexfile.js')

for (const environment in knexfile) {
  Object.assign(knexfile[environment], legacyDbSnakeCaseMappers({ underscoreBeforeDigits: true }))
}

module.exports = { ...knexfile }
