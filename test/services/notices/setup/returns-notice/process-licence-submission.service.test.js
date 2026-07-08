// Test framework dependencies

// Things we need to stub
import * as CheckLicenceExistsDal from '../../../../../app/dal/notices/setup/check-licence-exists.dal.js'
import * as FetchDueReturnsForLicenceService from '../../../../../app/services/notices/setup/returns-notice/fetch-due-returns-for-licence.service.js'

// Thing under test
import ProcessReturnsNoticeLicenceSubmission from '../../../../../app/services/notices/setup/returns-notice/process-licence-submission.service.js'

describe('Notices - Setup - Returns Notice - Process Returns Notice Licence Submission', () => {
  let dueReturns
  let licenceRef
  let payload

  beforeEach(() => {
    dueReturns = [{ returnLogId: '123' }]
    licenceRef = '01/234/R01'
    payload = { licenceRef }

    vi.spyOn(CheckLicenceExistsDal, 'default').mockResolvedValue(true)
    vi.spyOn(FetchDueReturnsForLicenceService, 'default').mockResolvedValue(dueReturns)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns the due returns as additional session data', async () => {
      const result = await ProcessReturnsNoticeLicenceSubmission(payload)

      expect(result.additionalSessionData).toEqual({ dueReturns })
    })

    describe('with a valid payload', () => {
      it('returns no validation error', async () => {
        const result = await ProcessReturnsNoticeLicenceSubmission(payload)

        expect(result.validationResult).toBeNull()
      })
    })

    describe('fails validation', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns a validation error', async () => {
        const result = await ProcessReturnsNoticeLicenceSubmission(payload)

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
