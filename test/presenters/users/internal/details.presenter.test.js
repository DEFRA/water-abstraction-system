// Test helpers
import * as UsersFixture from '../../../support/fixtures/users.fixture.js'

// Thing under test
import DetailsPresenter from '../../../../app/presenters/users/internal/details.presenter.js'

describe('Users - Internal - Details Presenter', () => {
  let auth
  let user

  beforeEach(() => {
    auth = { credentials: { user: { id: '367e5f4b-07d1-460b-842f-adf8f5dad7ef' } } }
    user = UsersFixture.basicAccess()
  })

  it('correctly presents the data', () => {
    const result = DetailsPresenter(auth, user)

    expect(result).toEqual({
      backLink: {
        href: '/system/users',
        text: 'Go back to users'
      },
      id: user.id,
      lastSignedIn: '6 October 2022 at 10:00:00',
      pageTitle: 'User details',
      pageTitleCaption: user.username,
      permissions: 'Basic access',
      roles: [],
      showEditButton: true,
      status: 'enabled'
    })
  })

  describe('the "lastSignedIn" property', () => {
    describe('when the lastLogin is not "null"', () => {
      it('returns the date and time of the last login', () => {
        const result = DetailsPresenter(auth, user)

        expect(result.lastSignedIn).toEqual('6 October 2022 at 10:00:00')
      })
    })

    describe('when the lastLogin is "null"', () => {
      beforeEach(() => {
        user.lastLogin = null
      })

      it('returns "Never signed in"', () => {
        const result = DetailsPresenter(auth, user)

        expect(result.lastSignedIn).toEqual('Never signed in')
      })
    })
  })

  describe('the "roles" property', () => {
    describe('when the user has no group or user roles', () => {
      it('returns an empty array', () => {
        const result = DetailsPresenter(auth, user)

        expect(result.roles).toEqual([])
      })
    })

    describe('when the user has only a group', () => {
      beforeEach(() => {
        user = UsersFixture.environmentOfficer()

        UsersFixture.transformToFetchUserInternalResult(user)
      })

      it('returns the "roles" for the group in sentence case, sorted by name', () => {
        const result = DetailsPresenter(auth, user)

        expect(result.roles).toEqual([
          {
            description: 'Send HoF notifications',
            name: 'HOF notifications'
          },
          {
            description: 'Manage linkages between gauging stations and licences',
            name: 'Manage gauging station licence links'
          }
        ])
      })
    })

    describe('when the user has a group and user roles', () => {
      beforeEach(() => {
        user = UsersFixture.digitiseApprover()

        UsersFixture.transformToFetchUserInternalResult(user)
      })

      it('returns all "roles" in sentence case, sorted by name', () => {
        const result = DetailsPresenter(auth, user)

        expect(result.roles).toEqual([
          {
            description: 'Approve licence data in Digitise! tool',
            name: 'AR approver'
          },
          {
            description: 'Manage linkages between gauging stations and licences',
            name: 'Manage gauging station licence links'
          },
          {
            description: 'Send renewal notifications',
            name: 'Renewal notifications'
          },
          {
            description: 'Unregister licences registered to users',
            name: 'Unregister licences'
          },
          {
            description: 'View charge information',
            name: 'View charge versions'
          }
        ])
      })
    })

    describe('when the user is part of a group linked to the role "unlink_licences"', () => {
      beforeEach(() => {
        user = UsersFixture.nationalPermittingService()

        UsersFixture.transformToFetchUserInternalResult(user)
      })

      it('returns the "roles" for the group in sentence case, sorted by name, with "unlink" mapped to "unregister"', () => {
        const result = DetailsPresenter(auth, user)

        expect(result.roles).toEqual([
          {
            description: 'Manage linkages between gauging stations and licences',
            name: 'Manage gauging station licence links'
          },
          {
            description: 'Send renewal notifications',
            name: 'Renewal notifications'
          },
          {
            description: 'Unregister licences registered to users',
            name: 'Unregister licences'
          },
          {
            description: 'View charge information',
            name: 'View charge versions'
          }
        ])
      })
    })
  })

  describe('the "showEditButton" property', () => {
    describe('when the authorised user is different to the one being edited', () => {
      it('returns "true"', () => {
        const result = DetailsPresenter(auth, user)

        expect(result.showEditButton).toBe(true)
      })
    })

    describe('when the authorised user is the same as the one being edited', () => {
      beforeEach(() => {
        auth = { credentials: { user: { id: user.id } } }
      })

      it('returns "false"', () => {
        const result = DetailsPresenter(auth, user)

        expect(result.showEditButton).toBe(false)
      })
    })
  })
})
