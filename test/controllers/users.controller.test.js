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
      describe('with no pagination', () => {
        beforeEach(() => {
          options = {
            method: 'GET',
            url: '/users',
            auth: {
              strategy: 'session',
              credentials: { scope: ['returns'] }
            }
          }

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
          options = {
            method: 'GET',
            url: '/users?page=2',
            auth: {
              strategy: 'session',
              credentials: { scope: ['returns'] }
            }
          }

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
        postOptions = postRequestOptions('/users', {})
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
        Sinon.stub(ViewProfileDetailsService, 'go').resolves({
          pageTitle: 'Profile details'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions())

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Profile details')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and is valid', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitProfileDetailsService, 'go').resolves({})
          })

          it('redirects to itself', async () => {
            const response = await server.inject(_postOptions())

            expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
            expect(response.headers.location).to.equal('/system/users/me/profile-details')
          })
        })

        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitProfileDetailsService, 'go').resolves({ error: { details: [] } })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(_postOptions())

            expect(response.statusCode).to.equal(HTTP_STATUS_OK)
            expect(response.payload).to.contain('There is a problem')
          })
        })
      })
    })
  })
})

function _getOptions() {
  return {
    method: 'GET',
    url: '/users/me/profile-details',
    auth: {
      strategy: 'session',
      credentials: { scope: ['hof_notifications'], user: { id: 1000 } }
    }
  }
}

function _postOptions() {
  return postRequestOptions('/users/me/profile-details', {}, ['hof_notifications'])
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
