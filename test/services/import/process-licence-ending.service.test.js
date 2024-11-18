'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const ProcessImportedLicenceService = require('../../../app/services/licences/supplementary/process-imported-licence.service.js')
const ProcessLicenceReturnLogsService = require('../../../app/services/jobs/return-logs/process-licence-return-logs.service.js')

// Thing under test
const ProcessLicenceEndingService = require('../../../app/services/import/process-licence-ending.service.js')

describe('Determine Supplementary Billing Flags Service', () => {
  const lapsedDate = new Date('2023-01-01')
  const revokedDate = new Date('2023-01-01')
  const expiredDate = new Date('2023-01-01')

  let existingLicenceNullDates
  let existingLicencePopulatedDates
  let notifierStub
  let importedLicence

  before(async () => {
    existingLicenceNullDates = await LicenceHelper.add()
    existingLicencePopulatedDates = await LicenceHelper.add({ expiredDate, lapsedDate, revokedDate })
  })

  beforeEach(() => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    Sinon.stub(ProcessImportedLicenceService, 'go').resolves()
    Sinon.stub(ProcessLicenceReturnLogsService, 'go').resolves()
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('when the existing version of the licence', () => {
    describe('matches the imported version of the licence', () => {
      describe('because all the dates are null', () => {
        before(() => {
          importedLicence = { expiredDate: null, lapsedDate: null, revokedDate: null }
        })

        it('does not call ProcessImportedLicenceService', async () => {
          await ProcessLicenceEndingService.go(importedLicence, existingLicenceNullDates.id)

          expect(ProcessImportedLicenceService.go.called).to.be.false()
        })
      })

      describe('because all the dates match', () => {
        before(() => {
          importedLicence = { expiredDate, lapsedDate, revokedDate }
        })

        it('does not call ProcessImportedLicenceService', async () => {
          await ProcessLicenceEndingService.go(importedLicence, existingLicencePopulatedDates.id)

          expect(ProcessImportedLicenceService.go.called).to.be.false()
        })
      })
    })

    describe('does not match the imported version of the licence', () => {
      describe('because the imported version has an end date where the existing version has null', () => {
        before(() => {
          importedLicence = { expiredDate, lapsedDate: null, revokedDate: null }
        })

        it('calls ProcessImportedLicenceService to handle what supplementary flags are needed and ProcessLicenceReturnLogsService to create return logs', async () => {
          await ProcessLicenceEndingService.go(importedLicence, existingLicenceNullDates.id)

          expect(ProcessImportedLicenceService.go.called).to.be.true()
          expect(ProcessLicenceReturnLogsService.go.called).to.be.true()
        })
      })

      describe('because the imported version has a null end date where the existing version has one', () => {
        before(() => {
          importedLicence = { expiredDate, lapsedDate: null, licenceRef: 'testReference', revokedDate }
        })

        it('calls ProcessImportedLicenceService to handle what supplementary flags are needed', async () => {
          await ProcessLicenceEndingService.go(importedLicence, existingLicencePopulatedDates.id)

          expect(ProcessImportedLicenceService.go.called).to.be.true()
          expect(ProcessLicenceReturnLogsService.go.calledWith(
            importedLicence.licenceRef,
            importedLicence.revokedDate
          )).to.be.true()
        })
      })

      describe('because the imported version has a different end date to the existing version', () => {
        before(() => {
          importedLicence = { expiredDate, lapsedDate, licenceRef: 'testReference', revokedDate: new Date('2023-02-02') }
        })

        it('calls ProcessImportedLicenceService to handle what supplementary flags are needed', async () => {
          await ProcessLicenceEndingService.go(importedLicence, existingLicencePopulatedDates.id)

          expect(ProcessImportedLicenceService.go.called).to.be.true()
          expect(ProcessLicenceReturnLogsService.go.calledWith(
            importedLicence.licenceRef,
            importedLicence.expiredDate
          )).to.be.true()
        })
      })
    })
  })

  describe('when there is an error', () => {
    let licenceId

    before(() => {
      // To make the service fail we pass it an invalid licence id
      licenceId = '1234'

      importedLicence = { expiredDate: null, lapsedDate: null, revokedDate: null }
    })

    it('handles the error', async () => {
      await ProcessLicenceEndingService.go(importedLicence, licenceId)

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Determine supplementary billing flags on import failed ')
      expect(args[1].licenceId).to.equal(licenceId)
      expect(args[2]).to.be.an.error()
    })
  })
})
