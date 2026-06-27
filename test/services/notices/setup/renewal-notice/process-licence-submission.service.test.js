'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Helpers
const LicenceModel = require('../../../../../app/models/licence.model.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchRenewalLicenceDal = require('../../../../../app/dal/notices/setup/fetch-renewal-licence.dal.js')

// Thing under test
const ProcessRenewalsNoticeLicenceSubmission = require('../../../../../app/services/notices/setup/renewal-notice/process-licence-submission.service.js')

describe('Notices - Setup - Renewal Notice - Process Renewals Notice Licence Submission', () => {
  let clock
  let fetchRenewalLicenceDalStub
  let licenceExpiryDate
  let licenceRef
  let licenceRenewal
  let payload
  let renewalDate

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

    clock = Sinon.useFakeTimers(new Date('2026-05-21'))

    fetchRenewalLicenceDalStub = Sinon.stub(FetchRenewalLicenceDal, 'go').resolves(licenceRenewal)
  })

  afterEach(() => {
    clock.restore()
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      it('returns the expected result', async () => {
        const result = await ProcessRenewalsNoticeLicenceSubmission.go(payload)

        expect(result).toEqual({
          additionalSessionData: { expiryDate: licenceExpiryDate, renewalDate },
          validationResult: null
        })
      })
    })

    describe('with an  invalid payload', () => {
      describe('fails validation', () => {
        describe('because no licence ref was entered', () => {
          beforeEach(() => {
            payload = {}
          })

          it('returns a validation error', async () => {
            const result = await ProcessRenewalsNoticeLicenceSubmission.go(payload)

            expect(result).toEqual({
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

            fetchRenewalLicenceDalStub.resolves(undefined)
          })

          it('returns a validation error', async () => {
            const result = await ProcessRenewalsNoticeLicenceSubmission.go(payload)

            expect(result).toEqual({
              additionalSessionData: {},
              validationResult: {
                errorList: [
                  {
                    href: '#licenceRef',
                    text: 'Enter a valid licence number'
                  }
                ],
                licenceRef: {
                  text: 'Enter a valid licence number'
                }
              }
            })
          })
        })
      })
    })
  })
})
