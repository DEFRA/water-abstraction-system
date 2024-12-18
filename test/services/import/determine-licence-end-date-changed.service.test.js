'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Thing under test
const DetermineLicenceEndDateChangedService = require('../../../app/services/import/determine-licence-end-date-changed.service.js')

describe('Determine Licence End Date Changed Service', () => {
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

        it('does not call ProcessLicenceReturnLogsService', async () => {
          const result = await DetermineLicenceEndDateChangedService.go(importedLicence, existingLicenceNullDates.id)

          expect(result).to.be.false()
        })
      })

      describe('because all the dates match', () => {
        before(() => {
          importedLicence = { expiredDate, lapsedDate, revokedDate }
        })

        it('does not call ProcessLicenceReturnLogsService', async () => {
          const result = await DetermineLicenceEndDateChangedService.go(
            importedLicence,
            existingLicencePopulatedDates.id
          )

          expect(result).to.be.false()
        })
      })
    })

    describe('does not match the imported version of the licence', () => {
      describe('because the imported version has an end date where the existing version has null', () => {
        before(() => {
          importedLicence = { expiredDate, lapsedDate: null, revokedDate: null }
        })

        it('calls ProcessImportedLicenceService to handle what supplementary flags are needed', async () => {
          const result = await DetermineLicenceEndDateChangedService.go(importedLicence, existingLicenceNullDates.id)

          expect(result).to.be.true()
        })
      })

      describe('because the imported version has a null end date where the existing version has one', () => {
        before(() => {
          importedLicence = { expiredDate, lapsedDate: null, revokedDate }
        })

        it('calls ProcessImportedLicenceService to handle what supplementary flags are needed', async () => {
          const result = await DetermineLicenceEndDateChangedService.go(
            importedLicence,
            existingLicencePopulatedDates.id
          )

          expect(result).to.be.true()
        })
      })

      describe('because the imported version has a different end date to the existing version', () => {
        before(() => {
          importedLicence = { expiredDate, lapsedDate, revokedDate: new Date('2023-02-02') }
        })

        it('calls ProcessImportedLicenceService to handle what supplementary flags are needed', async () => {
          const result = await DetermineLicenceEndDateChangedService.go(
            importedLicence,
            existingLicencePopulatedDates.id
          )

          expect(result).to.be.true()
        })
      })
    })
  })
})
