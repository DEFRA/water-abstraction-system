'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const BaseUsersPresenter = require('../../../app/presenters/users/base-users.presenter.js')

describe('Users - Base Users presenter', () => {
  describe('#sourceNavigation()', () => {
    let canManageAccounts
    let requestedQueryValue

    describe('when the user does not have the "manage_accounts" role', () => {
      beforeEach(() => {
        canManageAccounts = false
      })

      describe('then it does not matter what the requested query value is', () => {
        beforeEach(() => {
          requestedQueryValue = 'foo'
        })

        it('returns the details for navigating back to "search"', () => {
          const result = BaseUsersPresenter.sourceNavigation(requestedQueryValue, canManageAccounts)

          expect(result).to.equal({
            activeNavBar: 'search',
            backLink: {
              href: '/',
              text: 'Go back to search'
            },
            backQueryString: '?back=search'
          })
        })
      })
    })

    describe('when the user does have the "manage_accounts" role', () => {
      beforeEach(() => {
        canManageAccounts = true
      })

      describe('and the requested query value is "search"', () => {
        beforeEach(() => {
          requestedQueryValue = 'search'
        })

        it('returns the details for navigating back to "search"', () => {
          const result = BaseUsersPresenter.sourceNavigation(requestedQueryValue, canManageAccounts)

          expect(result).to.equal({
            activeNavBar: 'search',
            backLink: {
              href: '/',
              text: 'Go back to search'
            },
            backQueryString: '?back=search'
          })
        })
      })

      describe('and the requested query value is "users"', () => {
        beforeEach(() => {
          requestedQueryValue = 'users'
        })

        it('returns the details for navigating back to "users"', () => {
          const result = BaseUsersPresenter.sourceNavigation(requestedQueryValue, canManageAccounts)

          expect(result).to.equal({
            activeNavBar: 'users',
            backLink: {
              href: '/system/users',
              text: 'Go back to users'
            },
            backQueryString: '?back=users'
          })
        })
      })

      describe('and the requested query value is something else', () => {
        beforeEach(() => {
          requestedQueryValue = 'something-else'
        })

        it('returns the details for navigating back to "users"', () => {
          const result = BaseUsersPresenter.sourceNavigation(requestedQueryValue, canManageAccounts)

          expect(result).to.equal({
            activeNavBar: 'users',
            backLink: {
              href: '/system/users',
              text: 'Go back to users'
            },
            backQueryString: '?back=users'
          })
        })
      })
    })
  })
})
