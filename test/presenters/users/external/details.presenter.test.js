'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../../support/fixtures/users.fixture.js')

// Thing under test
const DetailsPresenter = require('../../../../app/presenters/users/external/details.presenter.js')

describe('Users - External - Details Presenter', () => {
  let back
  let user
  let viewingUserScope

  beforeEach(() => {
    back = 'users'
    user = UsersFixture.external()
    viewingUserScope = ['manage_accounts']
  })

  it('correctly presents the data', () => {
    const result = DetailsPresenter.go(user, viewingUserScope, back)

    expect(result).to.equal({
      activeNavBar: 'users',
      backLink: {
        href: '/system/users',
        text: 'Go back to users'
      },
      backQueryString: '?back=users',
      lastSignedIn: '6 October 2022 at 10:00:00',
      pageTitle: 'User details',
      pageTitleCaption: user.username,
      permissions: 'None',
      roles: [],
      status: 'enabled'
    })
  })

  describe('the "lastSignedIn" property', () => {
    describe('when the lastLogin is set', () => {
      it('returns the last signed in date and time', () => {
        const result = DetailsPresenter.go(user, viewingUserScope, back)

        expect(result.lastSignedIn).to.equal('6 October 2022 at 10:00:00')
      })
    })

    describe('when the lastLogin is "null"', () => {
      beforeEach(() => {
        user.lastLogin = null
      })

      it('returns "Never signed in"', () => {
        const result = DetailsPresenter.go(user, viewingUserScope, back)

        expect(result.lastSignedIn).to.equal('Never signed in')
      })
    })
  })

  describe('the "roles" property', () => {
    describe('when the user is determined to have "Basic access" permissions', () => {
      beforeEach(() => {
        user = UsersFixture.external('none')
      })

      it('returns an empty array', () => {
        const result = DetailsPresenter.go(user, viewingUserScope, back)

        expect(result.roles).to.be.empty()
      })
    })

    describe('when the user is determined to have "Returns user" permissions', () => {
      beforeEach(() => {
        user = UsersFixture.external('user_returns')
      })

      it('returns the correct roles for a "Returns user"', () => {
        const result = DetailsPresenter.go(user, viewingUserScope, back)

        expect(result.roles).to.equal([
          {
            description: 'Submit returns for the linked licences',
            name: 'Returns user'
          }
        ])
      })
    })

    describe('when the user is determined to have "Primary user" permissions', () => {
      beforeEach(() => {
        user = UsersFixture.external('primary_user')
      })

      it('returns the correct roles for a "Primary user"', () => {
        const result = DetailsPresenter.go(user, viewingUserScope, back)

        expect(result.roles).to.equal([
          {
            description: 'Create and manage other external user accounts for the linked licences',
            name: 'Primary user'
          },
          {
            description: 'Submit returns for the linked licences',
            name: 'Returns user'
          }
        ])
      })
    })
  })
})
