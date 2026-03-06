'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const IndexUsersPresenter = require('../../../app/presenters/users/index-users.presenter.js')

describe('Users - Index Users presenter', () => {
  let auth
  let users

  beforeEach(() => {
    users = [
      UsersFixture.transformToFetchUsersResult(UsersFixture.basicAccess()),
      UsersFixture.transformToFetchUsersResult(UsersFixture.jonLee('user_returns')),
      UsersFixture.transformToFetchUsersResult(UsersFixture.rachelStevens('none')),
      UsersFixture.transformToFetchUsersResult(UsersFixture.superUser()),
      UsersFixture.transformToFetchUsersResult(UsersFixture.tinaBarrett('user'))
    ]

    auth = {
      credentials: { scope: ['manage_accounts'] }
    }
  })

  it('correctly presents the data', () => {
    const result = IndexUsersPresenter.go(users, auth)

    expect(result).to.equal({
      links: {
        user: {
          href: '/account/create-user',
          text: 'Create a user'
        }
      },
      pageTitle: 'Users',
      users: [
        {
          email: users[0].username,
          link: `/user/${users[0].userId}/status`,
          permissions: 'Basic access',
          status: 'enabled',
          type: 'Internal'
        },
        {
          email: users[1].username,
          link: `/user/${users[1].userId}/status`,
          permissions: 'Returns user',
          status: 'disabled',
          type: 'External'
        },
        {
          email: users[2].username,
          link: `/user/${users[2].userId}/status`,
          permissions: 'None',
          status: 'awaiting',
          type: 'External'
        },
        {
          email: users[3].username,
          link: `/user/${users[3].userId}/status`,
          permissions: 'Super user',
          status: 'enabled',
          type: 'Internal'
        },
        {
          email: users[4].username,
          link: `/user/${users[4].userId}/status`,
          permissions: 'Basic access',
          status: 'locked',
          type: 'External'
        }
      ]
    })
  })

  describe('the "links" property', () => {
    describe('when the user has the "manage_accounts" role', () => {
      it('returns all of the links', () => {
        const result = IndexUsersPresenter.go(users, auth)

        expect(result.links).to.equal({
          user: {
            href: '/account/create-user',
            text: 'Create a user'
          }
        })
      })
    })

    describe('when the user does not have the "manage_accounts" role', () => {
      beforeEach(() => {
        auth.credentials.scope = ['bulk_return_notifications']
      })

      it('returns an empty object', () => {
        const result = IndexUsersPresenter.go(users, auth)

        expect(result.links).to.equal({})
      })
    })
  })

  describe('the "users" property', () => {
    describe('the "permissions" property', () => {
      describe('when the user is external', () => {
        describe('and has been linked to a licence at some point', () => {
          it('returns an empty string', () => {
            const result = IndexUsersPresenter.go(users, auth)

            expect(result.users[1].permissions).to.equal('Returns user')
            expect(result.users[2].permissions).to.equal('None')
            expect(result.users[4].permissions).to.equal('Basic access')
          })
        })

        describe('and has not been linked to a licence yet, has been unlinked, or the licence has been deleted', () => {
          beforeEach(() => {
            users[1].licenceEntity = null
            users[2].licenceEntity = null
            users[4].licenceEntity = null
          })

          it('returns their permissions', () => {
            const result = IndexUsersPresenter.go(users, auth)

            expect(result.users[1].permissions).to.equal('None')
            expect(result.users[2].permissions).to.equal('None')
            expect(result.users[4].permissions).to.equal('None')
          })
        })
      })

      describe('when the user is internal', () => {
        it('returns their permissions', () => {
          const result = IndexUsersPresenter.go(users, auth)

          expect(result.users[0].permissions).to.equal('Basic access')
          expect(result.users[3].permissions).to.equal('Super user')
        })
      })
    })

    describe('the "type" property', () => {
      describe('when the user is external', () => {
        it('returns "External"', () => {
          const result = IndexUsersPresenter.go(users, auth)

          expect(result.users[1].type).to.equal('External')
          expect(result.users[2].type).to.equal('External')
        })
      })

      describe('when the user is internal', () => {
        it('returns "Internal"', () => {
          const result = IndexUsersPresenter.go(users, auth)

          expect(result.users[0].type).to.equal('Internal')
          expect(result.users[3].type).to.equal('Internal')
        })
      })
    })
  })
})
