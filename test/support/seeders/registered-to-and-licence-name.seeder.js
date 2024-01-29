'use strict'

/**
 * Seeder to setup registered to and licence name details for a LicenceModel
 * @module RegisteredToAndLicenceNameSeeder
 */

const LicenceDocumentHeaderHelper = require('../helpers/licence-document-header.helper.js')
const LicenceEntityRoleHelper = require('../helpers/licence-entity-role.helper.js')
const LicenceEntityHelper = require('../helpers/licence-entity.helper.js')

/**
 * Sets up the additional records needed for `$licenceName()` and `%registeredTo()` on the licence to return values
 *
 * The registered to and licence name details are seen on the view licence page (if a licence has them). Unfortunately,
 * we have to link through a number of the legacy tables to extract the data.
 *
 * This seeder ensures the records needed are created and specifically support the `registeredToAndLicenceName()`
 * modifier on the `LicenceModel`.
 *
 * @param {module:LicenceModel} licence - The licence instance we are setting up the records for
 * @param {String} [licenceName] The custom licence name to use
 */
async function seed (licence, licenceName = 'My custom licence name') {
  const { licenceRef } = licence

  // We get from the licence to the registered user via LicenceDocumentHeader and LicenceEntityRole which are linked
  // by the same companyEntityId
  const companyEntityId = 'c960a4a1-94f9-4c05-9db1-a70ce5d08738'

  // Create a licence document header record
  await LicenceDocumentHeaderHelper.add({
    companyEntityId,
    licenceName,
    licenceRef
  })

  // Create the licence entity record. It's `name` field holds the user email that the licence is registered to
  const { id: licenceEntityId } = await LicenceEntityHelper.add()

  // Create the licence entity role record that is the part of the link between the licence and the user email
  await LicenceEntityRoleHelper.add({ companyEntityId, licenceEntityId })
}

module.exports = {
  seed
}
