'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = require('node:http2').constants
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const IndexUsersService = require('../../app/services/users/index-users.service.js')
const SubmitIndexUsersService = require('../../app/services/users/submit-index-users.service.js')
const SubmitProfileDetailsService = require('../../app/services/users/submit-profile-details.service.js')
const ViewProfileDetailsService = require('../../app/services/users/view-profile-details.service.js')
const ViewUserService = require('../../app/services/users/view-user.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Users controller', () => {
  let options
  let postOptions
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/users', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = _getOptions('/users', { scope: ['manage_accounts'] })
      })

      describe('with no pagination', () => {
        beforeEach(() => {
          const pageData = _usersPageData()

          Sinon.stub(IndexUsersService, 'go').returns(pageData)
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Users')
          expect(response.payload).to.contain('Showing all 1 users')
        })
      })

      describe('with pagination', () => {
        beforeEach(() => {
          options.url = '/users?page=2'

          const pageData = _usersPageData()

          pageData.pageTitle = 'Users'
          pageData.pagination.showingMessage = 'Showing 25 of 70 users'

          Sinon.stub(IndexUsersService, 'go').returns(pageData)
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Users')
          expect(response.payload).to.contain('Showing 25 of 70 users')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/users', {}, ['manage_accounts'])
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmitIndexUsersService, 'go').returns({})
        })

        it('redirects back to the index page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/users`)
        })
      })

      describe('when the request fails', () => {
        describe('with no pagination', () => {
          beforeEach(() => {
            const pageData = _usersPageData(true)

            Sinon.stub(SubmitIndexUsersService, 'go').returns(pageData)
          })

          it('re-renders the index page with no pagination and an error', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(HTTP_STATUS_OK)

            expect(response.payload).to.contain('There is a problem')
            expect(response.payload).to.contain('Users')
            expect(response.payload).to.contain('Showing all 1 users')
          })
        })

        describe('with pagination', () => {
          beforeEach(async () => {
            const pageData = _usersPageData(true)

            pageData.pageTitle = 'Users'
            pageData.pagination.showingMessage = 'Showing 25 of 70 users'

            Sinon.stub(SubmitIndexUsersService, 'go').returns(pageData)
          })

          it('re-renders the index page with pagination and an error', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(HTTP_STATUS_OK)

            expect(response.payload).to.contain('There is a problem')
            expect(response.payload).to.contain('Users')
            expect(response.payload).to.contain('Showing 25 of 70 users')
          })
        })
      })
    })
  })

  describe('/users/me/profile-details', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions('/users/me/profile-details', { scope: ['hof_notifications'], user: { id: 1000 } })

        Sinon.stub(ViewProfileDetailsService, 'go').resolves({
          pageTitle: 'Profile details'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Profile details')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/users/me/profile-details', {}, ['hof_notifications'])
      })

      describe('when the request succeeds', () => {
        describe('and is valid', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitProfileDetailsService, 'go').resolves({})
          })

          it('redirects to itself', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
            expect(response.headers.location).to.equal('/system/users/me/profile-details')
          })
        })

        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitProfileDetailsService, 'go').resolves({ error: { details: [] } })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(HTTP_STATUS_OK)
            expect(response.payload).to.contain('There is a problem')
          })
        })
      })
    })
  })

  describe('/users/{userId}', () => {
    describe('GET', () => {
      describe('when the user is an internal user', () => {
        beforeEach(async () => {
          options = _getOptions(`/users/123`, { scope: ['billing'], user: { id: 1000 } })
          Sinon.stub(ViewUserService, 'go').resolves({
            backLink: {
              href: '/',
              text: 'Go back to search'
            },
            id: 100010,
            lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
            pageTitle: 'User basic.access@wrls.gov.uk',
            pageTitleCaption: 'Internal',
            permissions: 'Basic access',
            status: 'enabled'
          })
        })

        it('returns the internal user page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Internal')
        })
      })

      describe('when the user is an external user', () => {
        beforeEach(async () => {
          options = _getOptions(`/users/456`, { scope: ['billing'], user: { id: 1000 } })
          Sinon.stub(ViewUserService, 'go').resolves({
            backLink: {
              href: '/',
              text: 'Go back to search'
            },
            companies: [],
            id: 100007,
            lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
            pageTitle: 'User external@example.co.uk',
            pageTitleCaption: 'External',
            status: 'enabled'
          })
        })

        it('returns the external user page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('External')
        })
      })
    })
  })
})

function _getOptions(url, credentials) {
  return {
    method: 'GET',
    url,
    auth: {
      strategy: 'session',
      credentials
    }
  }
}

function _usersPageData(error = false) {
  const pageData = {
    filters: {
      email: null,
      openFilter: true,
      permissions: null,
      status: null,
      type: null
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
        email: 'basic.access@wrls.gov.uk',
        link: '/user/10016/status',
        permissions: 'Basic access',
        status: 'enabled',
        type: 'Internal'
      }
    ],
    pagination: { numberOfPages: 1, showingMessage: 'Showing all 1 users' }
  }

  if (error) {
    pageData.filters.type = 'foo'
    pageData.error = {
      errorList: [
        {
          href: '#type',
          text: 'Select a valid type'
        }
      ],
      type: {
        text: 'Select a valid type'
      }
    }
  }

  return pageData
}
