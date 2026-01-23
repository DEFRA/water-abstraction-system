'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../fixtures/users.fixture.js')

// Thing under test
const ExternalUserPresenter = require('../../../app/presenters/users/external-user.presenter.js')

describe('Users - External User Presenter', () => {
  let user

  beforeEach(() => {
    user = UsersFixture.external()
  })

  it('correctly presents the data', () => {
    const result = ExternalUserPresenter.go(user)

    expect(result).to.equal({
      backLink: {
        href: '/',
        text: 'Go back to search'
      },
      id: 100007,
      lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
      pageTitle: 'User external@example.co.uk',
      pageTitleCaption: 'External',
      status: 'enabled'
    })
  })

  describe('the "lastSignedIn" property', () => {
    describe('when the lastLogin is "null"', () => {
      beforeEach(() => {
        const externalUser = UsersFixture.external()
        const { $status } = externalUser

        user = { ...externalUser, lastLogin: null, $status }
      })

      it('returns "Never signed in"', () => {
        const result = ExternalUserPresenter.go(user)

        expect(result.lastSignedIn).to.equal('Never signed in')
      })
    })
  })
})
