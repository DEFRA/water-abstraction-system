// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import http2 from 'node:http2'

import FeatureFlagsConfig from '../../config/feature-flags.config.js'
import { generateUUID } from '../support/generators.js'
import { postRequestOptions } from '../support/general.js'
import { today } from '../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchLegacyIdDal from '../../app/dal/users/fetch-legacy-id.dal.js'
import * as IndexUsersService from '../../app/services/users/index-users.service.js'
import * as SubmitIndexUsersService from '../../app/services/users/submit-index-users.service.js'
import * as SubmitProfileDetailsService from '../../app/services/users/submit-profile-details.service.js'
import * as ViewExternalCommunicationsService from '../../app/services/users/external/view-communications.service.js'
import * as ViewExternalDetailsService from '../../app/services/users/external/view-details.service.js'
import * as ViewExternalLicencesService from '../../app/services/users/external/view-licences.service.js'
import * as ViewExternalVerificationsService from '../../app/services/users/external/view-verifications.service.js'
import * as ViewInternalCommunicationsService from '../../app/services/users/internal/view-communications.service.js'
import * as ViewInternalDetailsService from '../../app/services/users/internal/view-details.service.js'
import * as ViewNotificationService from '../../app/services/users/view-notification.service.js'
import * as ViewProfileDetailsService from '../../app/services/users/view-profile-details.service.js'

// For running our service
import { init } from '../../app/server.js'

const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Users controller', () => {
  let id
  let options
  let notificationId
  let pageData
  let postOptions
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(async () => {
    vi.replaceProperty(FeatureFlagsConfig, 'enableUsersManagement', true)

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    vi.spyOn(server.logger, 'error').mockImplementation(() => {})

    // We silence sending a notification to our Errbit instance using Airbrake
    vi.spyOn(server.app.airbrake, 'notify').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await server.stop()
  })

  describe('/users', () => {
    beforeEach(() => {
      pageData = {
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
        users: [],
        pagination: { currentPageNumber: 1, numberOfPages: 1, showingMessage: 'Showing all 0 users' }
      }
    })

    describe('GET', () => {
      beforeEach(() => {
        options = _getOptions('/users', { scope: ['manage_accounts'] })
      })

      describe('with no results', () => {
        beforeEach(async () => {
          vi.spyOn(IndexUsersService, 'default').mockResolvedValue(pageData)
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Users')
          expect(response.payload).toContain('No users found.')
        })
      })

      describe('with results', () => {
        beforeEach(async () => {
          pageData.users = [
            {
              email: 'basic.access@wrls.gov.uk',
              link: '/user/10016/status',
              permissions: 'Basic access',
              status: 'enabled',
              type: 'Internal'
            }
          ]
        })

        describe('and no pagination', () => {
          beforeEach(() => {
            pageData.pagination.showingMessage = 'Showing all 1 users'

            vi.spyOn(IndexUsersService, 'default').mockReturnValue(pageData)
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Users')
            expect(response.payload).toContain('Showing all 1 users')
          })
        })

        describe('and pagination', () => {
          beforeEach(() => {
            options.url = `${options.url}?page=2`

            pageData.pagination.currentPageNumber = 2
            pageData.pagination.numberOfPages = 3
            pageData.pagination.showingMessage = 'Showing 25 of 70 users'

            vi.spyOn(IndexUsersService, 'default').mockReturnValue(pageData)
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Users')
            expect(response.payload).toContain('Showing 25 of 70 users')
          })
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/users', {}, ['manage_accounts'])
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          pageData = {}

          vi.spyOn(SubmitIndexUsersService, 'default').mockReturnValue(pageData)
        })

        it('redirects back to the index page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/users`)
        })
      })

      describe('when the request fails', () => {
        beforeEach(() => {
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
        })

        describe('with no results', () => {
          beforeEach(() => {
            vi.spyOn(SubmitIndexUsersService, 'default').mockReturnValue(pageData)
          })

          it('re-renders the index page with no pagination and an error', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)

            expect(response.payload).toContain('There is a problem')
            expect(response.payload).toContain('Users')
            expect(response.payload).toContain('No users found.')
          })
        })

        describe('with results', () => {
          beforeEach(async () => {
            pageData.users = [
              {
                email: 'basic.access@wrls.gov.uk',
                link: '/user/10016/status',
                permissions: 'Basic access',
                status: 'enabled',
                type: 'Internal'
              }
            ]
          })

          describe('and no pagination', () => {
            beforeEach(() => {
              pageData.pagination.showingMessage = 'Showing all 1 users'

              vi.spyOn(SubmitIndexUsersService, 'default').mockReturnValue(pageData)
            })

            it('re-renders the index page with no pagination and an error', async () => {
              const response = await server.inject(postOptions)

              expect(response.statusCode).toEqual(HTTP_STATUS_OK)

              expect(response.payload).toContain('There is a problem')
              expect(response.payload).toContain('Users')
              expect(response.payload).toContain('Showing all 1 users')
            })
          })

          describe('and pagination', () => {
            beforeEach(async () => {
              options.url = `${options.url}?page=2`

              pageData.pagination.currentPageNumber = 2
              pageData.pagination.numberOfPages = 3
              pageData.pagination.showingMessage = 'Showing 25 of 70 users'

              vi.spyOn(SubmitIndexUsersService, 'default').mockReturnValue(pageData)
            })

            it('re-renders the index page with pagination and an error', async () => {
              const response = await server.inject(postOptions)

              expect(response.statusCode).toEqual(HTTP_STATUS_OK)

              expect(response.payload).toContain('There is a problem')
              expect(response.payload).toContain('Users')
              expect(response.payload).toContain('Showing 25 of 70 users')
            })
          })
        })
      })
    })
  })

  describe('/users/external/{id}/communications', () => {
    describe('GET', () => {
      beforeEach(() => {
        id = generateUUID()
        options = _getOptions(`/users/external/${id}/communications`, { scope: [], user: { id } })

        pageData = {
          activeNavBar: 'users',
          activeSecondaryNav: 'communications',
          pagination: {
            currentPageNumber: 1,
            numberOfPages: 0,
            showingMessage: 'Showing all 0 communications'
          },
          backLink: {
            href: '/system/users',
            text: 'Go back to users'
          },
          backQueryString: '?back=users',
          notifications: [],
          pageTitle: 'Communications',
          pageTitleCaption: 'external@example.co.uk'
        }
      })

      describe('with no results', () => {
        beforeEach(async () => {
          vi.spyOn(ViewExternalCommunicationsService, 'default').mockResolvedValue(pageData)
        })

        it('returns the external user page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Communications')
          expect(response.payload).toContain('This user has no associated communications.')
        })
      })

      describe('with results', () => {
        beforeEach(async () => {
          pageData.notifications = [
            {
              createdAt: today(),
              id: generateUUID(),
              messageRef: 'password_reset_email',
              messageType: 'email',
              status: 'sent'
            }
          ]
        })

        describe('and no pagination', () => {
          beforeEach(async () => {
            pageData.pagination.showingMessage = 'Showing all 1 communications'

            vi.spyOn(ViewExternalCommunicationsService, 'default').mockResolvedValue(pageData)
          })

          it('returns the external user page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Communications')
            expect(response.payload).toContain('Showing all 1 communications')
          })
        })

        describe('and pagination', () => {
          beforeEach(async () => {
            options.url = `${options.url}?page=2`

            pageData.pagination.currentPageNumber = 2
            pageData.pagination.numberOfPages = 3
            pageData.pagination.showingMessage = 'Showing 25 of 70 communications'

            vi.spyOn(ViewExternalCommunicationsService, 'default').mockResolvedValue(pageData)
          })

          it('returns the external user page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Communications')
            expect(response.payload).toContain('Showing 25 of 70 communications')
          })
        })
      })
    })
  })

  describe('/users/external/{id}/details', () => {
    describe('GET', () => {
      beforeEach(async () => {
        id = generateUUID()
        options = _getOptions(`/users/external/${id}/details`, { scope: [], user: { id } })

        vi.spyOn(ViewExternalDetailsService, 'default').mockResolvedValue({
          activeNavBar: 'users',
          activeSecondaryNav: 'details',
          backLink: {
            href: '/system/users',
            text: 'Go back to users'
          },
          backQueryString: '?back=users',
          lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
          pageTitle: 'User details',
          pageTitleCaption: 'external@example.co.uk',
          permissions: 'None',
          roles: [],
          status: 'enabled'
        })
      })

      it('returns the external user page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('User details')
      })
    })
  })

  describe('/users/external/{id}/licences', () => {
    describe('GET', () => {
      beforeEach(async () => {
        id = generateUUID()
        options = _getOptions(`/users/external/${id}/licences`, { scope: [], user: { id } })

        pageData = {
          activeNavBar: 'users',
          activeSecondaryNav: 'licences',
          pagination: {
            currentPageNumber: 1,
            numberOfPages: 0,
            showingMessage: 'Showing all 0 licences'
          },
          backLink: {
            href: '/system/users',
            text: 'Go back to users'
          },
          backQueryString: '?back=users',
          displayLicenceEndedMessage: false,
          pageTitle: 'Licences',
          pageTitleCaption: 'external@example.co.uk',
          licences: [],
          showUnlinkButton: false
        }
      })

      describe('with no results', () => {
        beforeEach(async () => {
          vi.spyOn(ViewExternalLicencesService, 'default').mockResolvedValue(pageData)
        })

        it('returns the external user page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Licences')
          expect(response.payload).toContain('This user has no linked licences.')
        })
      })

      describe('with results', () => {
        beforeEach(async () => {
          pageData.licences = [
            {
              expiredDate: null,
              id: generateUUID(),
              lapsedDate: null,
              licenceRef: '01/123',
              revokedDate: null,
              licenceDocumentHeader: {
                id: generateUUID(),
                licenceRef: '01/123',
                licenceEntityRoles: [
                  {
                    id: generateUUID(),
                    role: 'primary_user'
                  }
                ]
              },
              licenceVersions: [
                {
                  id: generateUUID(),
                  licenceId: generateUUID(),
                  licenceVersionHolder: {
                    derivedName: 'Between Two Ferns Surfacing Limited',
                    id: generateUUID(),
                    licenceVersionId: generateUUID()
                  }
                }
              ]
            }
          ]
        })

        describe('and no pagination', () => {
          beforeEach(async () => {
            pageData.pagination.showingMessage = 'Showing all 1 licences'

            vi.spyOn(ViewExternalLicencesService, 'default').mockResolvedValue(pageData)
          })

          it('returns the external user page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Licences')
            expect(response.payload).toContain('Showing all 1 licences')
          })
        })

        describe('and pagination', () => {
          beforeEach(async () => {
            options.url = `${options.url}?page=2`

            pageData.pagination.currentPageNumber = 2
            pageData.pagination.numberOfPages = 3
            pageData.pagination.showingMessage = 'Showing 25 of 70 licences'

            vi.spyOn(ViewExternalLicencesService, 'default').mockResolvedValue(pageData)
          })

          it('returns the external user page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Licences')
            expect(response.payload).toContain('Showing 25 of 70 licences')
          })
        })
      })
    })
  })

  describe('/users/external/{id}/verifications', () => {
    describe('GET', () => {
      beforeEach(async () => {
        id = generateUUID()
        options = _getOptions(`/users/external/${id}/verifications`, { scope: [], user: { id } })

        pageData = {
          activeNavBar: 'users',
          activeSecondaryNav: 'verifications',
          pagination: {
            currentPageNumber: 1,
            numberOfPages: 0,
            showingMessage: 'Showing all 0 verifications'
          },
          backLink: {
            href: '/system/users',
            text: 'Go back to users'
          },
          backQueryString: '?back=users',
          pageTitle: 'Verifications',
          pageTitleCaption: 'external@example.co.uk',
          verifications: []
        }
      })

      describe('with no results', () => {
        beforeEach(async () => {
          vi.spyOn(ViewExternalVerificationsService, 'default').mockResolvedValue(pageData)
        })

        it('returns the external user page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Verifications')
          expect(response.payload).toContain('This user has no associated verifications.')
        })
      })

      describe('with results', () => {
        beforeEach(async () => {
          pageData.verifications = [
            {
              createdAt: new Date('2025-07-02T19:22:46.000Z'),
              id: generateUUID(),
              verifiedAt: new Date('2025-07-02T19:22:51.000Z'),
              verificationCode: 'A7vdJ',
              licenceDocumentHeaders: [
                {
                  id: generateUUID(),
                  licenceRef: 'AN/033/0053/130',
                  licence: {
                    id: generateUUID(),
                    licenceRef: 'AN/033/0053/130',
                    licenceVersions: [
                      {
                        id: generateUUID(),
                        issueDate: new Date('2013-04-01'),
                        licenceId: generateUUID(),
                        startDate: new Date('2025-04-01'),
                        status: 'current',
                        company: {
                          id: generateUUID(),
                          name: 'Rochester Farm Limited',
                          type: 'organisation'
                        }
                      }
                    ]
                  }
                }
              ]
            }
          ]
        })

        describe('and no pagination', () => {
          beforeEach(async () => {
            pageData.pagination.showingMessage = 'Showing all 1 verifications'

            vi.spyOn(ViewExternalVerificationsService, 'default').mockResolvedValue(pageData)
          })

          it('returns the external user page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Verifications')
            expect(response.payload).toContain('Showing all 1 verifications')
          })
        })

        describe('and pagination', () => {
          beforeEach(async () => {
            options.url = `${options.url}?page=2`

            pageData.pagination.currentPageNumber = 2
            pageData.pagination.numberOfPages = 3
            pageData.pagination.showingMessage = 'Showing 25 of 70 verifications'

            vi.spyOn(ViewExternalVerificationsService, 'default').mockResolvedValue(pageData)
          })

          it('returns the external user page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Verifications')
            expect(response.payload).toContain('Showing 25 of 70 verifications')
          })
        })
      })
    })
  })

  describe('/users/internal/{id}/communications', () => {
    describe('GET', () => {
      beforeEach(async () => {
        id = generateUUID()
        options = _getOptions(`/users/internal/${id}/communications`, { scope: ['manage_accounts'], user: { id } })

        pageData = {
          activeNavBar: 'users',
          activeSecondaryNav: 'communications',
          pagination: {
            currentPageNumber: 1,
            numberOfPages: 0,
            showingMessage: 'Showing all 0 communications'
          },
          backLink: {
            href: `/system/users`,
            text: 'Go back to users'
          },
          notifications: [],
          pageTitle: 'Communications',
          pageTitleCaption: 'carol.shaw@wrls.gov.uk'
        }
      })

      describe('with no results', () => {
        beforeEach(async () => {
          vi.spyOn(ViewInternalCommunicationsService, 'default').mockResolvedValue(pageData)
        })

        it('returns the internal user page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Communications')
          expect(response.payload).toContain('This user has no associated communications.')
        })
      })

      describe('with results', () => {
        beforeEach(async () => {
          pageData.notifications = [
            {
              createdAt: today(),
              id: generateUUID(),
              messageRef: 'password_reset_email',
              messageType: 'email',
              status: 'sent'
            }
          ]
        })

        describe('and no pagination', () => {
          beforeEach(async () => {
            pageData.pagination.showingMessage = 'Showing all 1 communications'

            vi.spyOn(ViewInternalCommunicationsService, 'default').mockResolvedValue(pageData)
          })

          it('returns the internal user page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Communications')
            expect(response.payload).toContain('Showing all 1 communications')
          })
        })

        describe('and pagination', () => {
          beforeEach(async () => {
            options.url = `${options.url}?page=2`

            pageData.pagination.currentPageNumber = 2
            pageData.pagination.numberOfPages = 3
            pageData.pagination.showingMessage = 'Showing 25 of 70 communications'

            vi.spyOn(ViewInternalCommunicationsService, 'default').mockResolvedValue(pageData)
          })

          it('returns the internal user page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Communications')
            expect(response.payload).toContain('Showing 25 of 70 communications')
          })
        })
      })
    })
  })

  describe('/users/internal/{id}/details', () => {
    describe('GET', () => {
      beforeEach(async () => {
        id = generateUUID()
        options = _getOptions(`/users/internal/${id}/details`, { scope: ['manage_accounts'], user: { id } })

        vi.spyOn(ViewInternalDetailsService, 'default').mockResolvedValue({
          activeNavBar: 'users',
          activeSecondaryNav: 'details',
          backLink: {
            href: '/system/users',
            text: 'Go back to users'
          },
          id,
          lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
          pageTitle: 'User details',
          pageTitleCaption: 'basic.access@wrls.gov.uk',
          permissions: 'Basic access',
          roles: [],
          showEditButton: true,
          status: 'enabled'
        })
      })

      it('returns the internal user page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('User details')
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        id = generateUUID()
        postOptions = postRequestOptions(`/users/internal/${id}/details`, {}, ['manage_accounts'])
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(FetchLegacyIdDal, 'default').mockReturnValue(456)
        })

        it('redirects to the internal initiate edit session url', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/users/internal/setup/${id}/edit`)
        })
      })
    })
  })

  describe('/users/internal/{id}/notifications/{notificationId}', () => {
    describe('GET', () => {
      beforeEach(async () => {
        id = generateUUID()
        notificationId = generateUUID()
        options = _getOptions(`/users/internal/${id}/notifications/${notificationId}`, {
          scope: ['manage_accounts'],
          user: { id }
        })

        vi.spyOn(ViewNotificationService, 'default').mockResolvedValue({
          activeNavBar: 'users',
          backLink: {
            href: `/system/users/internal/${id}/communications`,
            text: 'Go back to user'
          },
          contents: '## This content is protected.',
          errorDetails: null,
          messageType: 'email',
          pageTitle: 'Password reset',
          pageTitleCaption: 'carol.shaw@wrls.gov.uk',
          sentDate: '18 April 2025',
          sentTo: 'carol.shaw@wrls.gov.uk',
          status: 'sent'
        })
      })

      it('returns the internal user page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        expect(response.payload).toContain('Password reset')
      })
    })
  })

  describe('/users/me/profile-details', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions('/users/me/profile-details', { scope: ['hof_notifications'], user: { id: 1000 } })

        vi.spyOn(ViewProfileDetailsService, 'default').mockResolvedValue({
          pageTitle: 'Profile details'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Profile details')
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
            vi.spyOn(SubmitProfileDetailsService, 'default').mockResolvedValue({})
          })

          it('redirects to itself', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/users/me/profile-details')
          })
        })

        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitProfileDetailsService, 'default').mockResolvedValue({ error: { details: [] } })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
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
