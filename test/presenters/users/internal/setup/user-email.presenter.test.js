'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const UserEmailPresenter = require('../../../../../app/presenters/users/internal/setup/user-email.presenter.js')

describe('Users - Internal - Setup - User Email Presenter', () => {
  let session

  beforeEach(() => {
    session = { id: generateUUID() }
  })

  describe('when called', () => {
    it('correctly presents the data', () => {
      const result = UserEmailPresenter.go(session)

      expect(result).to.equal({
        backLink: {
          href: '/system/users',
          text: 'Back'
        },
        email: null,
        pageTitle: 'Enter an email address for the user',
        pageTitleCaption: 'Internal'
      })
    })

    describe('the "email" property', () => {
      describe('when the email has previously been saved', () => {
        beforeEach(() => {
          session.email = 'BOB@test.com'
        })

        it('returns the email from the session in lowercase', () => {
          const result = UserEmailPresenter.go(session)

          expect(result.email).to.equal('bob@test.com')
        })
      })

      describe('when the email has not previously been saved', () => {
        it('returns an empty string', () => {
          const result = UserEmailPresenter.go(session)

          expect(result.email).to.be.null()
        })
      })
    })
  })
})
