// Test helpers
import { generateLicenceRef } from '../../support/helpers/licence.helper.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Thing under test
import * as BaseUsersPresenter from '../../../app/presenters/users/base-users.presenter.js'

describe('Users - Base Users presenter', () => {
  describe('#formatLicencesToUnlink', () => {
    let session

    beforeEach(() => {
      session = {
        allLicences: true,
        id: generateUUID(),
        licences: [
          {
            id: generateUUID(),
            licenceRef: generateLicenceRef()
          },
          {
            id: generateUUID(),
            licenceRef: generateLicenceRef()
          }
        ],
        selectedLicences: []
      }
    })

    describe('when the user selected "All licences"', () => {
      it('returns "All licences"', () => {
        const result = BaseUsersPresenter.formatLicencesToUnlink(session)

        expect(result).toEqual(['All licences'])
      })
    })

    describe('when the user selected specific licences', () => {
      beforeEach(() => {
        session.allLicences = false
        session.selectedLicences = [session.licences[0].id]
      })

      it('returns the selected licence references', () => {
        const result = BaseUsersPresenter.formatLicencesToUnlink(session)

        expect(result).toEqual([session.licences[0].licenceRef])
      })
    })
  })

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

          expect(result).toEqual({
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

          expect(result).toEqual({
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

          expect(result).toEqual({
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

          expect(result).toEqual({
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
