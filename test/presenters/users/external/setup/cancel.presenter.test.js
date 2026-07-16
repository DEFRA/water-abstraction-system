// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import * as UserSessionsFixture from '../../../../support/fixtures/user-sessions.fixture.js'

// Thing under test
import CancelPresenter from '../../../../../app/presenters/users/external/setup/cancel.presenter.js'

describe('Users - External - Setup - Cancel Presenter', () => {
  let session

  beforeEach(() => {
    session = UserSessionsFixture.unregistrationSession()
    session.allLicences = true
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CancelPresenter(session)

      expect(result).toEqual({
        activeNavBar: 'users',
        backLink: {
          href: `/system/users/external/setup/${session.id}/check`,
          text: 'Back'
        },
        licences: ['All licences'],
        pageTitle: 'You are about to cancel unregistering these licences',
        pageTitleCaption: session.user.username
      })
    })
  })
})
