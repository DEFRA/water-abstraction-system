'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Helpers
const LicenceModel = require('../../../../../app/models/licence.model.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchRenewalLicenceDal = require('../../../../../app/dal/notices/setup/fetch-renewal-licence.dal.js')

// Thing under test
const ProcessRenewalsNoticeLicenceSubmission = require('../../../../../app/services/notices/setup/renewal-notice/process-licence-submission.service.js')

describe('Notices - Setup - Renewal Notice - Process Renewals Notice Licence Submission', () => {
  let licenceExpiryDate
  let licenceRef
  let payload
  let renewalDate
  let fetchRenewalLicenceDalStub
  let licenceRenewal

  beforeEach(() => {
    licenceExpiryDate = new Date('2026-09-01')
    licenceRef = generateLicenceRef()
    payload = { licenceRef }
    renewalDate = new Date('2026-06-03')

    licenceRenewal = LicenceModel.fromJson({
      expiredDate: licenceExpiryDate,
      id: generateUUID(),
      lapsedDate: null,
      licenceRef,
      revokedDate: null
    })

    fetchRenewalLicenceDalStub = Sinon.stub(FetchRenewalLicenceDal, 'go').resolves(licenceRenewal)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      it('returns the expected result', async () => {
        const result = await ProcessRenewalsNoticeLicenceSubmission.go(payload)

        expect(result).to.equal({
          additionalSessionData: { expiryDate: licenceExpiryDate, renewalDate },
          validationResult: null
        })
      })
    })

    describe('fails validation', () => {
      describe('because no licence ref was entered', () => {
        beforeEach(() => {
          payload = {}

          fetchRenewalLicenceDalStub.resolves(undefined)
        })

        it('returns a validation error', async () => {
          const result = await ProcessRenewalsNoticeLicenceSubmission.go(payload)

          expect(result).to.equal({
            additionalSessionData: {},
            validationResult: {
              errorList: [{ href: '#licenceRef', text: 'Enter a licence number' }],
              licenceRef: { text: 'Enter a licence number' }
            }
          })
        })
      })

      describe('because the licence ref does not exist', () => {
        beforeEach(() => {
          payload = { licenceRef }

          licenceRenewal.expiredDate = null

          fetchRenewalLicenceDalStub.resolves(licenceRenewal)
        })

        it('returns a validation error', async () => {
          const result = await ProcessRenewalsNoticeLicenceSubmission.go(payload)

          expect(result).to.equal({
            additionalSessionData: {},
            validationResult: {
              errorList: [
                {
                  href: '#licenceRef',
                  text: 'The licence does not have an expiry date'
                }
              ],
              licenceRef: {
                text: 'The licence does not have an expiry date'
              }
            }
          })
        })
      })
    })
  })
})
