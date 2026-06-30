'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Things we need to stub
const CheckLicenceExistsDal = require('../../../../../app/dal/notices/setup/check-licence-exists.dal.js')
const FetchDueReturnsForLicenceService = require('../../../../../app/services/notices/setup/returns-notice/fetch-due-returns-for-licence.service.js')

// Thing under test
const ProcessReturnsNoticeLicenceSubmission = require('../../../../../app/services/notices/setup/returns-notice/process-licence-submission.service.js')

describe('Notices - Setup - Returns Notice - Process Returns Notice Licence Submission', () => {
  let dueReturns
  let licenceRef
  let payload

  beforeEach(() => {
    dueReturns = [{ returnLogId: '123' }]
    licenceRef = '01/234/R01'
    payload = { licenceRef }

    Sinon.stub(CheckLicenceExistsDal, 'go').resolves(true)
    Sinon.stub(FetchDueReturnsForLicenceService, 'go').resolves(dueReturns)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the due returns as additional session data', async () => {
      const result = await ProcessReturnsNoticeLicenceSubmission.go(payload)

      expect(result.additionalSessionData).toEqual({ dueReturns })
    })

    describe('with a valid payload', () => {
      it('returns no validation error', async () => {
        const result = await ProcessReturnsNoticeLicenceSubmission.go(payload)

        expect(result.validationResult).toBeNull()
      })
    })

    describe('fails validation', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns a validation error', async () => {
        const result = await ProcessReturnsNoticeLicenceSubmission.go(payload)

        expect(result).toEqual({
          additionalSessionData: { dueReturns: [] },
          validationResult: {
            errorList: [{ href: '#licenceRef', text: 'Enter a licence number' }],
            licenceRef: { text: 'Enter a licence number' }
          }
        })
      })
    })
  })
})
