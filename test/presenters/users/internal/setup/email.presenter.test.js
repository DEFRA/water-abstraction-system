// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { generateUUID } from '../../../../support/generators.js'

// Thing under test
import EmailPresenter from '../../../../../app/presenters/users/internal/setup/email.presenter.js'

describe('Users - Internal - Setup - Email Presenter', () => {
  let session

  beforeEach(() => {
    session = { id: generateUUID() }
  })

  it('correctly presents the data', () => {
    const result = EmailPresenter(session)

    expect(result).toEqual({
      activeNavBar: 'users',
      backLink: {
        href: '/system/users',
        text: 'Back'
      },
      email: null,
      pageTitle: 'Enter an email address for the user',
      pageTitleCaption: 'Internal'
    })
  })

  describe('the "backLink" property', () => {
    describe('when the check page has previously been visited', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns the correct href', () => {
        const result = EmailPresenter(session)

        expect(result.backLink.href).toEqual(`/system/users/internal/setup/${session.id}/check`)
      })
    })

    describe('when the check page has not previously been visited', () => {
      it('returns the correct href', () => {
        const result = EmailPresenter(session)

        expect(result.backLink.href).toEqual('/system/users')
      })
    })
  })

  describe('the "email" property', () => {
    describe('when the email has previously been saved', () => {
      beforeEach(() => {
        session.email = 'BOB@test.com'
      })

      it('returns the email from the session in lowercase', () => {
        const result = EmailPresenter(session)

        expect(result.email).toEqual('bob@test.com')
      })
    })

    describe('when the email has not previously been saved', () => {
      it('returns an empty string', () => {
        const result = EmailPresenter(session)

        expect(result.email).toBeNull()
      })
    })
  })
})
