'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const ProcessImportedLicenceService = require('../../../app/services/licences/supplementary/process-imported-licence.service.js')

// Thing under test
const DetermineSupplementaryBillingFlagsService = require('../../../app/services/import/determine-supplementary-billing-flags.service.js')

describe('Determine Supplementary Billing Flags Service', () => {
  let licence
  let notifierStub
  let importedLicence

  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    Sinon.stub(ProcessImportedLicenceService, 'go').resolves()
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('when given a licence id that has no end dates', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()
    })

    describe('and a imported licence with no end dates', () => {
      beforeEach(() => {
        importedLicence = {
          expiredDate: null,
          lapsedDate: null,
          revokedDate: null
        }
      })

      it('does not pass the licence on to be flagged', async () => {
        await DetermineSupplementaryBillingFlagsService.go(importedLicence, licence.id)

        expect(ProcessImportedLicenceService.go.called).to.be.false()
      })
    })

    describe('and a imported licence with end dates', () => {
      beforeEach(() => {
        importedLicence = {
          expiredDate: new Date('2030-01-01'),
          lapsedDate: null,
          revokedDate: new Date('2023-01-01')
        }
      })

      it('passes the licence on to be flagged', async () => {
        await DetermineSupplementaryBillingFlagsService.go(importedLicence, licence.id)

        expect(ProcessImportedLicenceService.go.called).to.be.true()
      })
    })
  })

  describe('when given a licence id that has a revoked date', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add({ revokedDate: new Date('2023-01-01') })
    })

    describe('and a imported licence with no end dates', () => {
      beforeEach(() => {
        importedLicence = {
          expiredDate: null,
          lapsedDate: null,
          revokedDate: null
        }
      })

      it('passes the licence on to be flagged', async () => {
        await DetermineSupplementaryBillingFlagsService.go(importedLicence, licence.id)

        expect(ProcessImportedLicenceService.go.called).to.be.true()
      })
    })

    describe('and a imported licence with the same end dates', () => {
      beforeEach(() => {
        importedLicence = {
          expiredDate: null,
          lapsedDate: null,
          revokedDate: new Date('2023-01-01')
        }
      })

      it('does not pass the licence on to be flagged', async () => {
        await DetermineSupplementaryBillingFlagsService.go(importedLicence, licence.id)

        expect(ProcessImportedLicenceService.go.called).to.be.false()
      })
    })
  })

  describe('when given a licence id that has a lapsed date', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add({ lapsedDate: new Date('2023-01-01') })
    })

    describe('and a imported licence with no end dates', () => {
      beforeEach(() => {
        importedLicence = {
          expiredDate: null,
          lapsedDate: null,
          revokedDate: null
        }
      })

      it('passes the licence on to be flagged', async () => {
        await DetermineSupplementaryBillingFlagsService.go(importedLicence, licence.id)

        expect(ProcessImportedLicenceService.go.called).to.be.true()
      })
    })

    describe('and a imported licence with the same end dates', () => {
      beforeEach(() => {
        importedLicence = {
          expiredDate: null,
          lapsedDate: new Date('2023-01-01'),
          revokedDate: null
        }
      })

      it('does not pass the licence on to be flagged', async () => {
        await DetermineSupplementaryBillingFlagsService.go(importedLicence, licence.id)

        expect(ProcessImportedLicenceService.go.called).to.be.false()
      })
    })
  })

  describe('when given a licence id that has an expired date', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add({ expiredDate: new Date('2023-01-01') })
    })

    describe('and a imported licence with no end dates', () => {
      beforeEach(() => {
        importedLicence = {
          expiredDate: null,
          lapsedDate: null,
          revokedDate: null
        }
      })

      it('passes the licence on to be flagged', async () => {
        await DetermineSupplementaryBillingFlagsService.go(importedLicence, licence.id)

        expect(ProcessImportedLicenceService.go.called).to.be.true()
      })
    })

    describe('and a imported licence with the same end dates', () => {
      beforeEach(() => {
        importedLicence = {
          expiredDate: new Date('2023-01-01'),
          lapsedDate: null,
          revokedDate: null
        }
      })

      it('does not pass the licence on to be flagged', async () => {
        await DetermineSupplementaryBillingFlagsService.go(importedLicence, licence.id)

        expect(ProcessImportedLicenceService.go.called).to.be.false()
      })
    })
  })

  describe('when there is an error', () => {
    let licenceId

    beforeEach(() => {
      // To make the service fail we pass it an invalid licence id
      licenceId = '1234'

      importedLicence = {
        expiredDate: null,
        lapsedDate: null,
        revokedDate: null
      }
    })

    it('handles the error', async () => {
      await DetermineSupplementaryBillingFlagsService.go(importedLicence, licenceId)

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Determine supplementary billing flags on import failed ')
      expect(args[1].licenceId).to.equal(licenceId)
      expect(args[2]).to.be.an.error()
    })
  })
})
