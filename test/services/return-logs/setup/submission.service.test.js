// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmissionService from '../../../../app/services/return-logs/setup/submission.service.js'

describe('Return Logs Setup - Submission service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = { beenReceived: false, returnReference: '1234' }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await SubmissionService(session.id)

      expect(result).toEqual({
        backLink: { href: `/system/return-logs/setup/${session.id}/received`, text: 'Back' },
        beenReceived: false,
        journey: null,
        pageTitle: 'What do you want to do with this return?',
        pageTitleCaption: 'Return reference 1234'
      })
    })
  })
})
