// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import SubmissionPresenter from '../../../../app/presenters/return-logs/setup/submission.presenter.js'

describe('Return Logs Setup - Submission presenter', () => {
  let session

  describe('when provided with a populated session', () => {
    beforeEach(() => {
      session = {
        id: 'e840675e-9fb9-4ce1-bf0a-d140f5c57f47',
        beenReceived: false,
        returnReference: '1234'
      }
    })

    it('correctly presents the data', () => {
      const result = SubmissionPresenter(session)

      expect(result).toEqual({
        backLink: { href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/received', text: 'Back' },
        beenReceived: false,
        journey: null,
        pageTitle: 'What do you want to do with this return?',
        pageTitleCaption: 'Return reference 1234'
      })
    })

    describe('the "backLink" property', () => {
      describe('when the user has come from the "check" page', () => {
        beforeEach(() => {
          session.checkPageVisited = true
        })

        it('returns a link back to the "check" page', () => {
          const result = SubmissionPresenter(session)

          expect(result.backLink.href).toEqual('/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/check')
        })
      })

      describe('when the user has come from somewhere else', () => {
        it('returns a link back to the "received" page on', () => {
          const result = SubmissionPresenter(session)

          expect(result.backLink.href).toEqual(
            '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/received'
          )
        })
      })
    })

    describe('the "journey" property', () => {
      describe('when an option has been selected and submitted', () => {
        beforeEach(() => {
          session.journey = 'enterReturn'
        })

        it('returns the selected option', () => {
          const result = SubmissionPresenter(session)

          expect(result.journey).toEqual('enterReturn')
        })
      })
    })
  })
})
