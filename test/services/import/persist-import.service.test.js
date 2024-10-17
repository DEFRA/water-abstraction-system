'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')
const PersistCompanyService = require('../../../app/services/import/persist/persist-company.service.js')
const PersistLicenceService = require('../../../app/services/import/persist/persist-licence.service.js')
const PersistLicenceVersionsService = require('../../../app/services/import/persist/persist-licence-versions.service.js')
const PersistLicenceDocumentService = require('../../../app/services/import/persist/persist-licence-document.service.js')

// Thing under test
const PersistImportService = require('../../../app/services/import/persist-import.service.js')

describe('Persist import service', () => {
  const transformedCompanies = []
  const transformedLicence = []

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the services are used', () => {
    beforeEach(() => {
      Sinon.stub(LicenceModel, 'transaction').callsFake(async (callback) => {
        try {
          return await callback() // Execute the callback within the transaction
        } catch (error) {
          return Promise.reject(error) // Properly handle and pass through the rejection
        }
      })
    })

    describe('when a licence has been successfully created or updated', () => {
      beforeEach(() => {
        Sinon.stub(PersistLicenceService, 'go').resolves('1234')
        Sinon.stub(PersistLicenceVersionsService, 'go').resolves()
        Sinon.stub(PersistCompanyService, 'go').resolves()
        Sinon.stub(PersistLicenceDocumentService, 'go').resolves()
      })

      it('should return the licence id', async () => {
        const result = await PersistImportService.go(transformedLicence, transformedCompanies)

        expect(result).to.equal('1234')
      })
    })

    describe('when a service has failed', () => {
      beforeEach(() => {
        Sinon.stub(PersistLicenceService, 'go').resolves('1234')
        Sinon.stub(PersistLicenceVersionsService, 'go').resolves()
        Sinon.stub(PersistCompanyService, 'go').rejects(new Error('boom'))
        Sinon.stub(PersistLicenceDocumentService, 'go').resolves()
      })

      it('should throw an error', async () => {
        await expect(PersistImportService.go(transformedLicence, transformedCompanies)).to.reject(Error, 'boom')
      })
    })
  })

  describe('when the transaction has failed', () => {
    beforeEach(() => {
      Sinon.stub(PersistLicenceService, 'go').resolves('1234')
      Sinon.stub(PersistLicenceVersionsService, 'go').resolves()
      Sinon.stub(PersistCompanyService, 'go').resolves()
      Sinon.stub(PersistLicenceDocumentService, 'go').resolves()

      Sinon.stub(LicenceModel, 'transaction').rejects(new Error('boom'))
    })

    it('should throw an error', async () => {
      await expect(PersistImportService.go(transformedLicence, transformedCompanies)).to.reject(Error, 'boom')
    })
  })
})
