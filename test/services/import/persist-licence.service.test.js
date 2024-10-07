'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers

// Thing under test
const PersistImportService = require('../../../app/services/import/persist-import.service.js')

describe('Persist licence service', () => {
  let transformedCompanies
  let transformedLicence

  describe('when an error is thrown when persisting the licence', () => {
    beforeEach(() => {
      // We cause the error by making the last record to be persisted have an invalid value. This demonstrates the
      // purpose of the DB transaction: either all records are persisted or none of them
      transformedLicence.licenceVersions[0].licenceVersionPurposes[0].primaryPurposeId = 'boom'
    })

    it('throws an error and persists nothing', async () => {
      await expect(PersistImportService.go(transformedLicence, transformedCompanies)).to.reject()

      const newLicence = await _fetchPersistedLicence(transformedLicence.licenceRef)

      expect(newLicence).to.be.undefined()
    })
  })
})
