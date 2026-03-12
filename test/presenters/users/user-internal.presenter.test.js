'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const UserInternalPresenter = require('../../../app/presenters/users/user-internal.presenter.js')

describe('Users - User Internal Presenter', () => {
  let user

  beforeEach(() => {
    user = UsersFixture.basicAccess()
  })

  it('correctly presents the data', () => {
    const result = UserInternalPresenter.go(user)

    expect(result).to.equal({
      backLink: {
        href: '/',
        text: 'Go back to search'
      },
      id: user.id,
      lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
      pageTitle: 'User basic.access@wrls.gov.uk',
      pageTitleCaption: 'Internal',
      permissions: 'Basic access',
      status: 'enabled'
    })
  })

  describe('the "lastSignedIn" property', () => {
    describe('when the lastLogin is "null"', () => {
      beforeEach(() => {
        user = UsersFixture.basicAccess()
        user.lastLogin = null
      })

      it('returns "Never signed in"', () => {
        const result = UserInternalPresenter.go(user)

        expect(result.lastSignedIn).to.equal('Never signed in')
      })
    })
  })
})
