// Test helpers
import * as UsersFixture from '../../../support/fixtures/users.fixture.js'

// Thing under test
import DetailsPresenter from '../../../../app/presenters/users/external/details.presenter.js'

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
    const result = DetailsPresenter(user, viewingUserScope, back)

    expect(result).toEqual({
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
        const result = DetailsPresenter(user, viewingUserScope, back)

        expect(result.lastSignedIn).toEqual('6 October 2022 at 10:00:00')
      })
    })

    describe('when the lastLogin is "null"', () => {
      beforeEach(() => {
        user.lastLogin = null
      })

      it('returns "Never signed in"', () => {
        const result = DetailsPresenter(user, viewingUserScope, back)

        expect(result.lastSignedIn).toEqual('Never signed in')
      })
    })
  })

  describe('the "roles" property', () => {
    describe('when the user is determined to have "Basic access" permissions', () => {
      beforeEach(() => {
        user = UsersFixture.external('none')
      })

      it('returns an empty array', () => {
        const result = DetailsPresenter(user, viewingUserScope, back)

        expect(result.roles).toHaveLength(0)
      })
    })

    describe('when the user is determined to have "Returns user" permissions', () => {
      beforeEach(() => {
        user = UsersFixture.external('user_returns')
      })

      it('returns the correct roles for a "Returns user"', () => {
        const result = DetailsPresenter(user, viewingUserScope, back)

        expect(result.roles).toEqual([
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
        const result = DetailsPresenter(user, viewingUserScope, back)

        expect(result.roles).toEqual([
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
