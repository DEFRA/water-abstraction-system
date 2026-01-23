'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const InternalUserPresenter = require('../../../app/presenters/users/internal-user.presenter.js')

describe('Users - Internal User Presenter', () => {
  let user

  beforeEach(() => {
    user = UsersFixture.basicAccess()
  })

  it('correctly presents the data', () => {
    const result = InternalUserPresenter.go(user)

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
        const basicAccessUser = UsersFixture.basicAccess()
        const { $permissions, $status } = basicAccessUser

        user = { ...basicAccessUser, lastLogin: null, $permissions, $status }
      })

      it('returns "Never signed in"', () => {
        const result = InternalUserPresenter.go(user)

        expect(result.lastSignedIn).to.equal('Never signed in')
      })
    })
  })
})
