'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const CheckLicenceExistsDal = require('../../../../../app/dal/notices/setup/check-licence-exists.dal.js')
const FetchRenewalLicenceDal = require('../../../../../app/dal/notices/setup/fetch-renewal-licence.dal.js')

// Helpers
const LicenceModel = require('../../../../../app/models/licence.model.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const ProcessRenewalsNoticeLicenceSubmission = require('../../../../../app/services/notices/setup/renewal-notice/process-licence-submission.service.js')

describe('Notices - Setup - Renewal Notice - Process Renewals Notice Licence Submission', () => {
  let clock
  let expiryDate
  let licenceRef
  let payload
  let renewalDate

  beforeEach(() => {
    clock = Sinon.useFakeTimers(new Date('2026-06-01'))

    expiryDate = new Date('2026-06-01T00:00:00.000Z')
    renewalDate = new Date('2026-03-03T00:00:00.000Z')
    licenceRef = '01/234/R01'
    payload = { licenceRef }

    Sinon.stub(CheckLicenceExistsDal, 'go').resolves(true)
    Sinon.stub(FetchRenewalLicenceDal, 'go').resolves(
      LicenceModel.fromJson({
        expiredDate: new Date('2026-09-01'),
        id: generateUUID(),
        lapsedDate: null,
        licenceRef,
        revokedDate: null
      })
    )
  })

  afterEach(() => {
    clock.restore()
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      it('returns the expected result', async () => {
        const result = await ProcessRenewalsNoticeLicenceSubmission.go(payload)

        expect(result).to.equal({
          additionalSessionData: { expiryDate, renewalDate },
          validationResult: null
        })
      })
    })

    describe('fails validation', () => {
      describe('because no licence ref was entered', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns a validation error', async () => {
          const result = await ProcessRenewalsNoticeLicenceSubmission.go(payload)

          expect(result).to.equal({
            additionalSessionData: { expiryDate, renewalDate },
            validationResult: {
              errorList: [{ href: '#licenceRef', text: 'Enter a licence number' }],
              licenceRef: { text: 'Enter a licence number' }
            }
          })
        })
      })

      describe('because the licence ref does not exist', () => {
        beforeEach(() => {
          CheckLicenceExistsDal.go.resolves(false)
        })

        it('returns a validation error', async () => {
          const result = await ProcessRenewalsNoticeLicenceSubmission.go(payload)

          expect(result).to.equal({
            additionalSessionData: { expiryDate, renewalDate },
            validationResult: {
              errorList: [{ href: '#licenceRef', text: 'Enter a valid licence number' }],
              licenceRef: { text: 'Enter a valid licence number' }
            }
          })
        })
      })
    })
  })
})
