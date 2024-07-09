'use strict'

const LicenceAgreementsMapper = require('./mappers/agreements.mapper.js')

/**
 * Maps licence data from the import schema
 * @module ImportLicenceMapper
 */
function go (licence) {
  return {
    agreements: LicenceAgreementsMapper.go(licence.tptAgreements, licence.section130Agreements)
  }
}

module.exports = {
  go
}
