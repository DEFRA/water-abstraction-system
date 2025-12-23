'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')

// Things we need to stub
const ProcessBillingFlagService = require('../../../../app/services/licences/supplementary/process-billing-flag.service.js')

// Thing under test
const SubmitConfirmedService = require('../../../../app/services/return-logs/setup/submit-confirmed.service.js')

describe('Return Logs Setup - Submit Confirmed service', () => {
  let licence
  let returnLog
  let ProcessBillingFlagServiceStub

  beforeEach(async () => {
    licence = await LicenceHelper.add()

    returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef })

    ProcessBillingFlagServiceStub = Sinon.stub(ProcessBillingFlagService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a user submits the confirmed return to be marked for supplementary billing', () => {
    it('returns the licenceId for the redirect', async () => {
      const result = await SubmitConfirmedService.go(returnLog.id)

      expect(result).to.equal(licence.id)
    })

    it('sends the return to be processed by the "processBillingFlagsService"', async () => {
      await SubmitConfirmedService.go(returnLog.id)

      expect(ProcessBillingFlagServiceStub.called).to.be.true()
    })
  })
})
