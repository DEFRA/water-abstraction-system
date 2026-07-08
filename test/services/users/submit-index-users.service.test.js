// Test framework dependencies

// Test helpers
import * as UsersFixture from '../../support/fixtures/users.fixture.js'

// Things to stub
import FeatureFlagsConfig from '../../../config/feature-flags.config.js'
import FetchUsersDal from '../../../app/dal/users/fetch-users.dal.js'
import YarStub from '../../support/stubs/yar.stub.js'

// Thing under test
import SubmitIndexUsersService from '../../../app/services/users/submit-index-users.service.js'

describe('Users - Submit Index Users service', () => {
  let auth
  let payload
  let results
  let yarStub

  beforeEach(async () => {
    auth = {
      credentials: { scope: ['manage_accounts'] }
    }

    vi.replaceProperty(FeatureFlagsConfig, 'enableUsersManagement', true)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with the instruction to clear filters', () => {
      beforeEach(() => {
        payload = {
          clearFilters: 'reset'
        }
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexUsersService(payload, yarStub, auth)

        expect(result).toEqual({})
      })

      it('clears the "usersFilter" object from the session', async () => {
        await SubmitIndexUsersService(payload, yarStub, auth)

        expect(yarStub.clear).toHaveBeenCalled()
      })
    })

    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexUsersService(payload, yarStub, auth)

        expect(result).toEqual({})
      })

      it('saves a default "usersFilter" object in the session', async () => {
        await SubmitIndexUsersService(payload, yarStub, auth)

        const setArgs = yarStub.set.mock.calls[0]

        expect(setArgs[0]).toEqual('usersFilter')
        expect(setArgs[1]).toEqual({
          email: null,
          permissions: null,
          status: null,
          type: null
        })
      })
    })

    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          email: 'test@test.com',
          permissions: 'basic',
          status: 'enabled',
          type: 'water_admin'
        }
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexUsersService(payload, yarStub, auth)

        expect(result).toEqual({})
      })

      it('saves the submitted filters as the "usersFilter" object in the session', async () => {
        await SubmitIndexUsersService(payload, yarStub, auth)

        const setArgs = yarStub.set.mock.calls[0]

        expect(setArgs[0]).toEqual('usersFilter')
        expect(setArgs[1]).toEqual({
          email: 'test@test.com',
          permissions: 'basic',
          status: 'enabled',
          type: 'water_admin'
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {
          type: 'foo'
        }

        results = [UsersFixture.transformToFetchUsersResult(UsersFixture.basicAccess())]
      })

      describe('and the results are paginated', () => {
        beforeEach(() => {
          vi.mock('../../../app/dal/users/fetch-users.dal.js')
          FetchUsersDal.mockResolvedValue({ results, total: 70 })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexUsersService(payload, yarStub, auth, '2')

          expect(result).toEqual({
            error: {
              errorList: [
                {
                  href: '#type',
                  text: 'Select a valid type'
                }
              ],
              type: {
                text: 'Select a valid type'
              }
            },
            filters: {
              email: null,
              openFilter: true,
              permissions: null,
              status: null,
              type: 'foo'
            },
            links: {
              user: {
                href: '/system/users/internal/setup',
                text: 'Create a user'
              }
            },
            pageTitle: 'Users',
            users: [
              {
                email: results[0].username,
                link: `/system/users/internal/${results[0].id}/details`,
                permissions: 'Basic access',
                status: 'enabled',
                type: 'Internal'
              }
            ],
            pagination: {
              component: {
                items: [
                  {
                    current: false,
                    href: '/system/users?page=1',
                    number: 1,
                    visuallyHiddenText: 'Page 1'
                  },
                  {
                    current: true,
                    href: '/system/users?page=2',
                    number: 2,
                    visuallyHiddenText: 'Page 2'
                  },
                  {
                    current: false,
                    href: '/system/users?page=3',
                    number: 3,
                    visuallyHiddenText: 'Page 3'
                  }
                ],
                next: {
                  href: '/system/users?page=3'
                },
                previous: {
                  href: '/system/users?page=1'
                }
              },
              currentPageNumber: 2,
              numberOfPages: 3,
              showingMessage: 'Showing 1 of 70 users'
            }
          })
        })
      })

      describe('and the results are not paginated', () => {
        beforeEach(() => {
          vi.mock('../../../app/dal/users/fetch-users.dal.js')
          FetchUsersDal.mockResolvedValue({ results, total: 1 })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexUsersService(payload, yarStub, auth)

          expect(result).toEqual({
            error: {
              errorList: [
                {
                  href: '#type',
                  text: 'Select a valid type'
                }
              ],
              type: {
                text: 'Select a valid type'
              }
            },
            filters: {
              email: null,
              openFilter: true,
              permissions: null,
              status: null,
              type: 'foo'
            },
            links: {
              user: {
                href: '/system/users/internal/setup',
                text: 'Create a user'
              }
            },
            pageTitle: 'Users',
            users: [
              {
                email: results[0].username,
                link: `/system/users/internal/${results[0].id}/details`,
                permissions: 'Basic access',
                status: 'enabled',
                type: 'Internal'
              }
            ],
            pagination: { currentPageNumber: 1, numberOfPages: 1, showingMessage: 'Showing all 1 users' }
          })
        })
      })
    })
  })
})
