'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FixtureImportLicence = require('./_fixtures/import-licence.fixture.js')
const FixtureImportLicenceVersion = require('./_fixtures/import-licence-versions.fixture.js')

// Thing under test
const ImportLicenceValidatorService =
  require('../../../app/services/import/licence-validator.service.js')

describe('Import licence validator service', () => {
  let licence
  let licenceVersionsAndPurposes

  beforeEach(async () => {
    licence = {
      ...FixtureImportLicence.create()
    }

    licenceVersionsAndPurposes = [...FixtureImportLicenceVersion.create()]
  })

  it('should not throw an error - licence is valid', async () => {
    expect(() => { return ImportLicenceValidatorService.go(licence, licenceVersionsAndPurposes) }).to.not.throw()
  })

  describe('when a licence has badly formatted data', () => {
    beforeEach(() => {
      licence = {}
    })

    it('should not throw an error - licence is valid', async () => {
      expect(() => { return ImportLicenceValidatorService.go(licence, licenceVersionsAndPurposes) }).to.throw('"licenceRef" is required')
    })
  })
})
