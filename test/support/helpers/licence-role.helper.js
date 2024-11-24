'use strict'

/**
 * @module LicenceRoleHelper
 */

const { data: licenceRoles } = require('../../../db/seeds/data/licence-roles.js')

/**
 * Select an entry from the reference data entries seeded at the start of testing
 *
 * Because this helper is linked to a reference record instead of a transaction, we don't expect these to be created
 * when using the service.
 *
 * So, they are seeded automatically when tests are run. Tests that need to link to a record can use this method to
 * select a specific entry.
 *
 * @param {string} [name] - The reference entry to select. Defaults to 'licenceHolder'
 *
 * @returns {object} The selected reference entry or one picked at random
 */
function select(name = 'licenceHolder') {
  return licenceRoles.find((licenceRole) => {
    return licenceRole.name === name
  })
}

module.exports = {
  data: licenceRoles,
  select
}
