// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import * as UserSessionsFixture from '../../../../support/fixtures/user-sessions.fixture.js'

// Thing under test
import CheckPresenter from '../../../../../app/presenters/users/external/setup/check.presenter.js'

describe('Users - External - Setup - Check Presenter', () => {
  let session

  beforeEach(() => {
    session = UserSessionsFixture.unregistrationSession()
    session.allLicences = true
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckPresenter(session)

      expect(result).toEqual({
        activeNavBar: 'users',
        licences: ['All licences'],
        links: {
          cancel: `/system/users/external/setup/${session.id}/cancel`,
          licences: `/system/users/external/setup/${session.id}/licences`
        },
        pageTitle: 'Check licences to unregister',
        pageTitleCaption: session.user.username,
        warning: {
          iconFallbackText: 'Warning',
          text: 'All these licences will no longer be accessible to existing users.'
        }
      })
    })
  })

  describe('the "warning" property', () => {
    describe('when "all licences" was selected', () => {
      it('returns a message specific for "All licences"', () => {
        const result = CheckPresenter(session)

        expect(result.warning).toEqual({
          iconFallbackText: 'Warning',
          text: 'All these licences will no longer be accessible to existing users.'
        })
      })
    })

    describe('when a single licence was selected', () => {
      beforeEach(() => {
        session.allLicences = false
        session.selectedLicences = [session.licences[0].id]
      })

      it('returns a message specific for one licence', () => {
        const result = CheckPresenter(session)

        expect(result.warning).toEqual({
          iconFallbackText: 'Warning',
          text: 'This licence will no longer be accessible to existing users.'
        })
      })
    })

    describe('when licences were selected', () => {
      beforeEach(() => {
        session.allLicences = false
        session.selectedLicences = [session.licences[0].id, session.licences[1].id]
      })

      it('returns a message specific for one licence', () => {
        const result = CheckPresenter(session)

        expect(result.warning).toEqual({
          iconFallbackText: 'Warning',
          text: 'These licences will no longer be accessible to existing users.'
        })
      })
    })
  })
})
