'use strict'

const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

const validLicenceRequiredOnly = {
  licenceRef: generateLicenceRef(),
  naldRegionId: 1,
  startDate: '2001-01-01',
  waterUndertaker: true
}

module.exports = {
  validLicenceRequiredOnly
}
