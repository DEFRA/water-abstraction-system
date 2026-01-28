'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Things to stub
const FetchUsersService = require('../../../app/services/users/fetch-users.service.js')

// Thing under test
const SubmitIndexUsersService = require('../../../app/services/users/submit-index-users.service.js')

describe('Users - Submit Index Users service', () => {
  let auth
  let payload
  let results
  let yarStub

  beforeEach(async () => {
    auth = {
      credentials: { scope: ['manage_accounts'] }
    }

    yarStub = {
      clear: Sinon.stub().returns(),
      get: Sinon.stub(),
      set: Sinon.stub().returns()
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with the instruction to clear filters', () => {
      beforeEach(() => {
        payload = {
          clearFilters: 'reset'
        }
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexUsersService.go(payload, yarStub, auth)

        expect(result).to.equal({})
      })

      it('clears the "usersFilter" object from the session', async () => {
        await SubmitIndexUsersService.go(payload, yarStub, auth)

        expect(yarStub.clear.called).to.be.true()
      })
    })

    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitIndexUsersService.go(payload, yarStub, auth)

        expect(result).to.equal({})
      })

      it('saves a default "usersFilter" object in the session', async () => {
        await SubmitIndexUsersService.go(payload, yarStub, auth)

        const setArgs = yarStub.set.args[0]

        expect(setArgs[0]).to.equal('usersFilter')
        expect(setArgs[1]).to.equal({
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
        const result = await SubmitIndexUsersService.go(payload, yarStub, auth)

        expect(result).to.equal({})
      })

      it('saves the submitted filters as the "usersFilter" object in the session', async () => {
        await SubmitIndexUsersService.go(payload, yarStub, auth)

        const setArgs = yarStub.set.args[0]

        expect(setArgs[0]).to.equal('usersFilter')
        expect(setArgs[1]).to.equal({
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
          Sinon.stub(FetchUsersService, 'go').resolves({ results, total: 70 })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexUsersService.go(payload, yarStub, auth, '2')

          expect(result).to.equal({
            activeNavBar: 'search',
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
                href: '/account/create-user',
                text: 'Create a user'
              }
            },
            pageTitle: 'Users',
            users: [
              {
                email: results[0].username,
                link: `/user/${results[0].id}/status`,
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
              numberOfPages: 3,
              showingMessage: 'Showing 1 of 70 users'
            }
          })
        })
      })

      describe('and the results are not paginated', () => {
        beforeEach(() => {
          Sinon.stub(FetchUsersService, 'go').resolves({ results, total: 1 })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitIndexUsersService.go(payload, yarStub, auth)

          expect(result).to.equal({
            activeNavBar: 'search',
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
                href: '/account/create-user',
                text: 'Create a user'
              }
            },
            pageTitle: 'Users',
            users: [
              {
                email: results[0].username,
                link: `/user/${results[0].id}/status`,
                permissions: 'Basic access',
                status: 'enabled',
                type: 'Internal'
              }
            ],
            pagination: { numberOfPages: 1, showingMessage: 'Showing all 1 users' }
          })
        })
      })
    })
  })
})
