// Test helpers
import http2 from 'node:http2'
import { postRequestOptions } from '../support/general.js'

// Things we need to stub
import * as InitiateSessionService from '../../app/services/notices/setup/initiate-session.service.js'
import * as ProcessAddRecipientService from '../../app/services/notices/setup/process-add-recipient.service.js'
import * as ProcessDownloadRecipientsService from '../../app/services/notices/setup/process-download-recipients.service.js'
import * as ProcessPreviewPaperReturnService from '../../app/services/notices/setup/process-preview-paper-return.service.js'
import * as ProcessRemoveThresholdService from '../../app/services/notices/setup/abstraction-alerts/process-remove-threshold.service.js'
import * as SubmitAlertEmailAddressService from '../../app/services/notices/setup/abstraction-alerts/submit-alert-email-address.service.js'
import * as SubmitAlertThresholdsService from '../../app/services/notices/setup/abstraction-alerts/submit-alert-thresholds.service.js'
import * as SubmitAlertTypeService from '../../app/services/notices/setup/abstraction-alerts/submit-alert-type.service.js'
import * as SubmitCancelAlertsService from '../../app/services/notices/setup/abstraction-alerts/submit-cancel-alerts.service.js'
import * as SubmitCancelService from '../../app/services/notices/setup/submit-cancel.service.js'
import * as SubmitCheckLicenceMatchesService from '../../app/services/notices/setup/abstraction-alerts/submit-check-licence-matches.service.js'
import * as SubmitCheckNoticeTypeService from '../../app/services/notices/setup/submit-check-notice-type.service.js'
import * as SubmitCheckService from '../../app/services/notices/setup/submit-check.service.js'
import * as SubmitContactTypeService from '../../app/services/notices/setup/submit-contact-type.service.js'
import * as SubmitLicenceService from '../../app/services/notices/setup/submit-licence.service.js'
import * as SubmitNoticeTypeService from '../../app/services/notices/setup/submit-notice-type.service.js'
import * as SubmitPaperReturnService from '../../app/services/notices/setup/submit-paper-return.service.js'
import * as SubmitRecipientNameService from '../../app/services/notices/setup/submit-recipient-name.service.js'
import * as SubmitRemoveLicencesService from '../../app/services/notices/setup/submit-remove-licences.service.js'
import * as SubmitReturnsPeriodService from '../../app/services/notices/setup/submit-returns-period.service.js'
import * as SubmitSelectRecipientsService from '../../app/services/notices/setup/submit-select-recipients.service.js'
import * as ViewAlertEmailAddressService from '../../app/services/notices/setup/abstraction-alerts/view-alert-email-address.service.js'
import * as ViewAlertThresholdsService from '../../app/services/notices/setup/abstraction-alerts/view-alert-thresholds.service.js'
import * as ViewAlertTypeService from '../../app/services/notices/setup/abstraction-alerts/view-alert-type.service.js'
import * as ViewCancelAlertsService from '../../app/services/notices/setup/abstraction-alerts/view-cancel-alerts.service.js'
import * as ViewCancelService from '../../app/services/notices/setup/view-cancel.service.js'
import * as ViewCheckLicenceMatchesService from '../../app/services/notices/setup/abstraction-alerts/view-check-licence-matches.service.js'
import * as ViewCheckNoticeTypeService from '../../app/services/notices/setup/view-check-notice-type.service.js'
import * as ViewCheckService from '../../app/services/notices/setup/view-check.service.js'
import * as ViewConfirmationService from '../../app/services/notices/setup/view-confirmation.service.js'
import * as ViewContactTypeService from '../../app/services/notices/setup/view-contact-type.service.js'
import * as ViewLicenceService from '../../app/services/notices/setup/view-licence.service.js'
import * as ViewNoticeTypeService from '../../app/services/notices/setup/view-notice-type.service.js'
import * as ViewPaperReturnService from '../../app/services/notices/setup/view-paper-return.service.js'
import * as ViewPreviewCheckAlert from '../../app/services/notices/setup/preview/view-preview-check-alert.service.js'
import * as ViewPreviewCheckPaperReturnService from '../../app/services/notices/setup/preview/view-preview-check-paper-return.service.js'
import * as ViewPreviewService from '../../app/services/notices/setup/preview/view-preview.service.js'
import * as ViewRecipientNameService from '../../app/services/notices/setup/view-recipient-name.service.js'
import * as ViewRemoveLicencesService from '../../app/services/notices/setup/view-remove-licences.service.js'
import * as ViewReturnsPeriodService from '../../app/services/notices/setup/view-returns-period.service.js'
import * as ViewSelectRecipientsService from '../../app/services/notices/setup/view-select-recipients.service.js'

// For running our service
import { init } from '../../app/server.js'
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Notices Setup controller', () => {
  const basePath = '/notices/setup'
  const session = { id: 'e0c77b74-7326-493d-be5e-0d1ad41594b5', data: {} }

  let getOptions
  let postOptions
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(async () => {
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

  describe('notices/setup', () => {
    describe('GET', () => {
      let response

      describe('when the journey is "alerts"', () => {
        beforeEach(async () => {
          getOptions = {
            method: 'GET',
            url: '/notices/setup/alerts?monitoringStationId=24d8ed70-e474-45bc-83db-90e34d5c34cf',
            auth: {
              strategy: 'session',
              credentials: { scope: ['hof_notifications'] }
            }
          }

          response = { path: 'abstraction-alerts/alert-type', sessionId: session.id }
        })

        describe('and a request is valid', () => {
          beforeEach(async () => {
            vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(response)
          })

          it('redirects successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`
            )
          })
        })
      })

      describe('when the journey is "standard"', () => {
        beforeEach(async () => {
          getOptions = {
            method: 'GET',
            url: '/notices/setup/standard',
            auth: {
              strategy: 'session',
              credentials: { scope: ['bulk_return_notifications'] }
            }
          }

          response = { path: 'returns-period', sessionId: session.id }
        })

        describe('and a request is valid', () => {
          beforeEach(async () => {
            vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(response)
          })

          it('redirects successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/notices/setup/${session.id}/returns-period`)
          })
        })
      })

      describe('when the journey is "adhoc"', () => {
        beforeEach(async () => {
          getOptions = {
            method: 'GET',
            url: '/notices/setup/adhoc',
            auth: {
              strategy: 'session',
              credentials: { scope: ['bulk_return_notifications'] }
            }
          }

          response = { path: 'licence', sessionId: session.id }
        })

        describe('and a request is valid', () => {
          beforeEach(async () => {
            vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(response)
          })

          it('redirects successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/notices/setup/${session.id}/licence`)
          })
        })
      })
    })
  })

  describe('notices/setup/cancel', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/cancel`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
          vi.spyOn(ViewCancelService, 'default').mockReturnValue(_viewCancel())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const pageData = _viewCancel()
          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain(pageData.pageTitle)
          expect(response.payload).toContain(pageData.referenceCode)
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(async () => {
          vi.spyOn(SubmitCancelService, 'default').mockReturnValue('/system/notices')
          postOptions = postRequestOptions(basePath + `/${session.id}/cancel`, {}, ['bulk_return_notifications'])
        })

        it('redirects the to the next page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual('/system/notices')
        })
      })
    })
  })

  describe('notices/setup/check', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/check`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }
      })
      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
          vi.spyOn(ViewCheckService, 'default').mockReturnValue(_viewCheck())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const pageData = _viewCheck()

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain(pageData.pageTitle)
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        let eventId

        beforeEach(async () => {
          eventId = '1233'

          vi.spyOn(SubmitCheckService, 'default').mockReturnValue(eventId)
          postOptions = postRequestOptions(basePath + `/${session.id}/check`, {}, ['bulk_return_notifications'])
        })

        it('redirects the to the next page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/notices/setup/${eventId}/confirmation`)
        })
      })
    })
  })

  describe('notices/setup/check-notice-type', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/check-notice-type`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }
      })
      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
          vi.spyOn(ViewCheckNoticeTypeService, 'default').mockReturnValue({
            pageTitle: 'Check the notice type'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Check the notice type')
        })
      })
    })

    describe('POST', () => {
      beforeEach(async () => {
        postOptions = postRequestOptions(basePath + `/${session.id}/check-notice-type`, {}, [
          'bulk_return_notifications'
        ])

        vi.spyOn(SubmitCheckNoticeTypeService, 'default').mockResolvedValue({ redirectUrl: 'check' })
      })

      it('redirects to the "check" page', async () => {
        const response = await server.inject(postOptions)

        expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
        expect(response.headers.location).toEqual(`/system/notices/setup/${session.id}/check`)
      })
    })
  })

  describe('notices/setup/confirmation', () => {
    describe('GET', () => {
      let eventId

      beforeEach(async () => {
        eventId = '123'

        getOptions = {
          method: 'GET',
          url: basePath + `/${eventId}/confirmation`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }
      })
      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
          vi.spyOn(ViewConfirmationService, 'default').mockReturnValue(_viewConfirmation())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const pageData = _viewConfirmation()

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain(pageData.pageTitle)
        })
      })
    })
  })

  describe('notices/setup/download', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/download`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }
      })
      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
          vi.spyOn(ProcessDownloadRecipientsService, 'default').mockReturnValue({
            data: 'test',
            type: 'type/csv',
            filename: 'test.csv'
          })
        })

        it('returns the file successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.headers['content-type']).toEqual('type/csv')
          expect(response.headers['content-disposition']).toEqual('attachment; filename="test.csv"')
          expect(response.payload).toEqual('test')
        })
      })
    })
  })

  describe('/notices/setup/{sessionId}/abstraction-alerts', () => {
    describe('/alert-email-address', () => {
      describe('GET', () => {
        beforeEach(async () => {
          getOptions = {
            method: 'GET',
            url: basePath + `/${session.id}/abstraction-alerts/alert-email-address`,
            auth: {
              strategy: 'session',
              credentials: { scope: ['hof_notifications'] }
            }
          }

          vi.spyOn(ViewAlertEmailAddressService, 'default').mockResolvedValue({
            pageTitle: 'Email Address page'
          })
        })

        describe('when a request is valid', () => {
          it('returns the page successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Email Address page')
          })
        })
      })

      describe('POST', () => {
        describe('when a request is valid', () => {
          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/alert-email-address`, {}, [
              'hof_notifications'
            ])

            vi.spyOn(SubmitAlertEmailAddressService, 'default').mockResolvedValue({})
          })

          it('redirects to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/notices/setup/${session.id}/check`)
          })
        })

        describe('when a request is invalid', () => {
          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/alert-email-address`, {}, [
              'hof_notifications'
            ])

            vi.spyOn(SubmitAlertEmailAddressService, 'default').mockResolvedValue({
              error: { text: 'Select an option' },
              pageTitle: 'Email Address page'
            })
          })

          it('re-renders the page with an error message', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Email Address page')
            expect(response.payload).toContain('There is a problem')
          })
        })
      })
    })

    describe('/alert-thresholds', () => {
      describe('GET', () => {
        beforeEach(async () => {
          getOptions = {
            method: 'GET',
            url: basePath + `/${session.id}/abstraction-alerts/alert-thresholds`,
            auth: {
              strategy: 'session',
              credentials: { scope: ['hof_notifications'] }
            }
          }

          vi.spyOn(ViewAlertThresholdsService, 'default').mockResolvedValue({
            pageTitle: 'Threshold page'
          })
        })

        describe('when a request is valid', () => {
          it('returns the page successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Threshold page')
          })
        })
      })

      describe('POST', () => {
        describe('when a request is valid', () => {
          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/alert-thresholds`, {}, [
              'hof_notifications'
            ])

            vi.spyOn(SubmitAlertThresholdsService, 'default').mockResolvedValue({})
          })

          it('redirects to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`
            )
          })
        })

        describe('when a request is invalid', () => {
          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/alert-type`, {}, [
              'hof_notifications'
            ])

            vi.spyOn(SubmitAlertTypeService, 'default').mockResolvedValue({
              error: { text: 'Select an option' },
              pageTitle: 'Threshold page'
            })
          })

          it('re-renders the page with an error message', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Threshold page')
            expect(response.payload).toContain('There is a problem')
          })
        })
      })
    })

    describe('/alert-type', () => {
      describe('GET', () => {
        beforeEach(async () => {
          getOptions = {
            method: 'GET',
            url: basePath + `/${session.id}/abstraction-alerts/alert-type`,
            auth: {
              strategy: 'session',
              credentials: { scope: ['hof_notifications'] }
            }
          }

          vi.spyOn(ViewAlertTypeService, 'default').mockResolvedValue({
            pageTitle: 'Alert page'
          })
        })

        describe('when a request is valid', () => {
          it('returns the page successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Alert page')
          })
        })
      })

      describe('POST', () => {
        describe('when a request is valid', () => {
          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/alert-type`, {}, [
              'hof_notifications'
            ])

            vi.spyOn(SubmitAlertTypeService, 'default').mockResolvedValue({})
          })

          it('redirects to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`
            )
          })
        })

        describe('when a request is invalid', () => {
          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/alert-type`, {}, [
              'hof_notifications'
            ])

            vi.spyOn(SubmitAlertTypeService, 'default').mockResolvedValue({
              error: { text: 'Select an option' },
              pageTitle: 'Alert page'
            })
          })

          it('re-renders the page with an error message', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Alert page')
            expect(response.payload).toContain('There is a problem')
          })
        })
      })
    })

    describe('/cancel', () => {
      describe('GET', () => {
        beforeEach(async () => {
          getOptions = {
            method: 'GET',
            url: basePath + `/${session.id}/abstraction-alerts/cancel`,
            auth: {
              strategy: 'session',
              credentials: { scope: ['hof_notifications'] }
            }
          }

          vi.spyOn(ViewCancelAlertsService, 'default').mockResolvedValue({
            pageTitle: 'Cancel page'
          })
        })

        describe('when a request is valid', () => {
          it('returns the page successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Cancel page')
          })
        })
      })

      describe('POST', () => {
        describe('when a request is valid', () => {
          const monitoringStationId = '123'

          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/cancel`, {}, [
              'hof_notifications'
            ])

            vi.spyOn(SubmitCancelAlertsService, 'default').mockResolvedValue({ monitoringStationId })
          })

          it('redirects to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/monitoring-stations/${monitoringStationId}`)
          })
        })
      })
    })

    describe('/check-licence-matches', () => {
      describe('GET', () => {
        beforeEach(async () => {
          getOptions = {
            method: 'GET',
            url: basePath + `/${session.id}/abstraction-alerts/check-licence-matches`,
            auth: {
              strategy: 'session',
              credentials: { scope: ['hof_notifications'] }
            }
          }

          vi.spyOn(ViewCheckLicenceMatchesService, 'default').mockResolvedValue({
            pageTitle: 'Check licence page'
          })
        })

        describe('when a request is valid', () => {
          it('returns the page successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('Check licence page')
          })
        })
      })

      describe('POST', () => {
        describe('when a request is valid', () => {
          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/check-licence-matches`, {}, [
              'hof_notifications'
            ])

            vi.spyOn(SubmitCheckLicenceMatchesService, 'default').mockResolvedValue()
          })

          it('redirects to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              `/system/notices/setup/${session.id}/abstraction-alerts/alert-email-address`
            )
          })
        })
      })
    })

    describe('/remove-threshold/{licenceMonitoringStationId}', () => {
      describe('GET', () => {
        const licenceMonitoringStationId = '123'

        beforeEach(async () => {
          getOptions = {
            method: 'GET',
            url: basePath + `/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStationId}`,
            auth: {
              strategy: 'session',
              credentials: { scope: ['hof_notifications'] }
            }
          }

          vi.spyOn(ProcessRemoveThresholdService, 'default').mockResolvedValue({})
        })

        describe('when a request is valid', () => {
          it('redirects the to the next page', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(
              `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`
            )
          })
        })
      })
    })
  })

  describe('notices/setup/{sessionId}/licence', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/licence`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }

        vi.spyOn(ViewLicenceService, 'default').mockResolvedValue({
          pageTitle: 'Enter a licence number'
        })
      })

      describe('when a request is valid', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Enter a licence number')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(async () => {
          postOptions = postRequestOptions(basePath + `/${session.id}/licence`, { licenceRef: '01/115' }, [
            'bulk_return_notifications'
          ])

          vi.spyOn(SubmitLicenceService, 'default').mockResolvedValue({ redirectUrl: 'notice-type' })
        })

        it('returns the same page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/notices/setup/${session.id}/notice-type`)
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          postOptions = postRequestOptions(basePath + `/${session.id}/licence`, { licenceRef: '' }, [
            'bulk_return_notifications'
          ])

          vi.spyOn(SubmitLicenceService, 'default').mockResolvedValue({
            licenceRef: null,
            error: {
              errorList: [
                {
                  href: '#licenceRef',
                  text: 'Enter a licence number'
                }
              ],
              licenceRef: {
                text: 'Enter a licence number'
              }
            }
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Enter a licence number')
          expect(response.payload).toContain('There is a problem')
        })
      })
    })
  })

  describe('notices/setup/{sessionId}/preview/{contactHashId}', () => {
    describe('GET', () => {
      const contactHashId = '28da6d3a09af3794959b6906de5ec81a'

      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/preview/${contactHashId}`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }

        vi.spyOn(ViewPreviewService, 'default').mockResolvedValue({
          pageTitle: 'Preview notice'
        })
      })

      describe('when a request is valid', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Preview notice')
        })
      })
    })
  })

  describe('notices/setup/{sessionId}/preview/{contactHashId}/alert/{licenceMonitoringStationId}', () => {
    describe('GET', () => {
      const contactHashId = '28da6d3a09af3794959b6906de5ec81a'
      const licenceMonitoringStationId = '551087bc-68b4-42a8-9e04-ac173eaec3f8'

      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/preview/${contactHashId}/alert/${licenceMonitoringStationId}`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['hof_notifications'] }
          }
        }

        vi.spyOn(ViewPreviewService, 'default').mockResolvedValue({
          pageTitle: 'Preview notice'
        })
      })

      describe('when a request is valid', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Preview notice')
        })
      })
    })
  })

  describe('notices/setup/{sessionId}/preview/{contactHashId}/check-alert', () => {
    describe('GET', () => {
      const contactHashId = '28da6d3a09af3794959b6906de5ec81a'

      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/preview/${contactHashId}/check-alert`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['hof_notifications'] }
          }
        }

        vi.spyOn(ViewPreviewCheckAlert, 'default').mockResolvedValue({
          pageTitle: 'Check the recipient previews'
        })
      })

      describe('when a request is valid', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Check the recipient previews')
        })
      })
    })
  })

  describe('notices/setup/{sessionId}/preview/{contactHashId}/check-paper-return', () => {
    describe('GET', () => {
      const contactHashId = '28da6d3a09af3794959b6906de5ec81a'

      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/preview/${contactHashId}/check-paper-return`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }

        vi.spyOn(ViewPreviewCheckPaperReturnService, 'default').mockResolvedValue({
          pageTitle: 'Preview notice'
        })
      })

      describe('when a request is valid', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Preview notice')
        })
      })
    })
  })

  describe('/notices/setup/{sessionId}/preview/{contactHashId}/paper-return/{returnLogId}', () => {
    describe('GET', () => {
      let buffer

      beforeEach(() => {
        getOptions = {
          method: 'GET',
          url:
            basePath +
            `/${session.id}/preview/938c2cc0dcc05f2b68c4287040cfcf71/paper-return/95b54f97-fefb-46e7-aae8-ebf40ecb8b50`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }

        buffer = Buffer.from('mock file')

        vi.spyOn(ProcessPreviewPaperReturnService, 'default').mockResolvedValue(buffer)
      })

      describe('when a request is valid', () => {
        it('returns the PDF successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.headers['content-type']).toEqual('application/pdf')
          expect(response.headers['content-disposition']).toContain('inline; filename="example.pdf"')

          // Check that the payload matches the buffer we stubbed
          expect(response.payload).toEqual(buffer.toString())
        })
      })
    })
  })

  describe('notices/setup/{sessionId}/notice-type', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/notice-type`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }

        vi.spyOn(ViewNoticeTypeService, 'default').mockResolvedValue({
          pageTitle: 'Select the notice type'
        })
      })

      describe('when a request is valid', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select the notice type')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(async () => {
          postOptions = postRequestOptions(basePath + `/${session.id}/notice-type`, { noticeType: 'returns' }, [
            'bulk_return_notifications'
          ])

          vi.spyOn(SubmitNoticeTypeService, 'default').mockResolvedValue({ redirectUrl: 'check-notice-type' })
        })

        it('returns the same page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/notices/setup/${session.id}/check-notice-type`)
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          postOptions = postRequestOptions(basePath + `/${session.id}/notice-type`, { noticeType: '' }, [
            'bulk_return_notifications'
          ])

          vi.spyOn(SubmitNoticeTypeService, 'default').mockResolvedValue({
            error: { text: 'Select the notice type' },
            pageTitle: 'Select the notice type'
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select the notice type')
          expect(response.payload).toContain('There is a problem')
        })
      })
    })
  })

  describe('notices/setup/recipient-name', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/recipient-name`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(ViewRecipientNameService, 'default').mockReturnValue({ pageTitle: 'Recipients name' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Recipients name')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitRecipientNameService, 'default').mockReturnValue({
              error: 'Something went wrong'
            })

            postOptions = postRequestOptions(basePath + `/${session.id}/recipient-name`, {}, [
              'bulk_return_notifications'
            ])
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the validation succeeds', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitRecipientNameService, 'default').mockReturnValue({
              pageTile: 'Select recipients'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/recipient-name`, {}, [
              'bulk_return_notifications'
            ])
          })

          it('redirects the to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/address/${session.id}/postcode`)
          })
        })
      })
    })
  })

  describe('notices/setup/remove-licences', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/remove-licences`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
          vi.spyOn(ViewRemoveLicencesService, 'default').mockReturnValue(_viewRemoveLicence())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const pageData = _viewRemoveLicence()

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain(pageData.pageTitle)
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
            vi.spyOn(SubmitRemoveLicencesService, 'default').mockReturnValue({
              ..._viewRemoveLicence(),
              error: 'Something went wrong'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/remove-licences`, {}, [
              'bulk_return_notifications'
            ])
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the validation succeeds', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitRemoveLicencesService, 'default').mockReturnValue({ redirect: 'check' })
            postOptions = postRequestOptions(basePath + `/${session.id}/remove-licences`, {}, [
              'bulk_return_notifications'
            ])
          })

          it('redirects the to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/notices/setup/check')
          })
        })
      })
    })
  })

  describe('notices/setup/returns-period', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/returns-period`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }
      })
      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
          vi.spyOn(ViewReturnsPeriodService, 'default').mockReturnValue(_viewReturnsPeriod())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const pageData = _viewReturnsPeriod()

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain(pageData.pageTitle)
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
            vi.spyOn(SubmitReturnsPeriodService, 'default').mockReturnValue({
              ..._viewReturnsPeriod(),
              error: 'Something went wrong'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/returns-period`, {}, [
              'bulk_return_notifications'
            ])
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the validation succeeds', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitReturnsPeriodService, 'default').mockReturnValue({ redirect: 'send-notice' })
            postOptions = postRequestOptions(basePath + `/${session.id}/returns-period`, {}, [
              'bulk_return_notifications'
            ])
          })

          it('redirects the to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/notices/setup/send-notice')
          })
        })
      })
    })
  })

  describe('notices/setup/paper-return', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/paper-return`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
          vi.spyOn(ViewPaperReturnService, 'default').mockReturnValue({
            pageTitle: 'Select the returns for the paper forms'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select the returns for the paper forms')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
            vi.spyOn(SubmitPaperReturnService, 'default').mockReturnValue({
              error: 'Something went wrong'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/paper-return`, {}, [
              'bulk_return_notifications'
            ])
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the validation succeeds', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitPaperReturnService, 'default').mockReturnValue({
              pageTile: 'Select the returns for the paper forms'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/paper-return`, {}, [
              'bulk_return_notifications'
            ])
          })

          it('redirects the to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/notices/setup/${session.id}/check-notice-type`)
          })
        })
      })
    })
  })

  describe('notices/setup/select-recipients', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/select-recipients`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(ViewSelectRecipientsService, 'default').mockReturnValue({ pageTitle: 'Select recipients' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select recipients')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitSelectRecipientsService, 'default').mockReturnValue({
              error: 'Something went wrong'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/select-recipients`, {}, [
              'bulk_return_notifications'
            ])
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the validation succeeds', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitSelectRecipientsService, 'default').mockReturnValue({
              pageTile: 'Select recipients'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/select-recipients`, {}, [
              'bulk_return_notifications'
            ])
          })

          it('redirects the to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/notices/setup/${session.id}/check`)
          })
        })
      })
    })
  })

  describe('notices/setup/contact-type', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/contact-type`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
          vi.spyOn(ViewContactTypeService, 'default').mockReturnValue({
            pageTitle: 'Select how to contact the recipient'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Select how to contact the recipient')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            vi.spyOn(InitiateSessionService, 'default').mockResolvedValue(session)
            vi.spyOn(SubmitContactTypeService, 'default').mockReturnValue({
              error: 'Something went wrong'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/contact-type`, {}, [
              'bulk_return_notifications'
            ])
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)
            expect(response.payload).toContain('There is a problem')
          })
        })

        describe('and the validation succeeds and they chose the post option', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitContactTypeService, 'default').mockReturnValue({
              contactType: 'post',
              pageTile: 'Select how to contact the recipient'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/contact-type`, {}, [
              'bulk_return_notifications'
            ])
          })

          it('redirects the to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/address/${session.id}/postcode`)
          })
        })

        describe('and the validation succeeds and they chose the email option', () => {
          beforeEach(async () => {
            vi.spyOn(SubmitContactTypeService, 'default').mockReturnValue({
              contactType: 'email',
              pageTile: 'Select how to contact the recipient'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/contact-type`, {}, [
              'bulk_return_notifications'
            ])
          })

          it('redirects the to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual(`/system/notices/setup/${session.id}/check`)
          })
        })
      })
    })
  })

  describe('notices/setup/add-recipient', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/add-recipient`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['bulk_return_notifications'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          vi.spyOn(ProcessAddRecipientService, 'default').mockResolvedValue()
        })

        it('redirects to the check recipient page', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/notices/setup/${session.id}/check`)
        })
      })
    })
  })
})

function _viewCancel() {
  return {
    activeNavBar: 'notices',
    pageTitle: 'You are about to cancel this notice',
    referenceCode: '123',
    summaryList: {
      text: 'Licence number',
      value: '67856'
    }
  }
}

function _viewReturnsPeriod() {
  return {
    pageTitle: 'Select the returns periods for the invitations',
    backLink: '/system/manage',
    activeNavBar: 'notices',
    returnsPeriod: []
  }
}

function _viewRemoveLicence() {
  return {
    pageTitle: 'Remove licences',
    hint: 'hint to remove',
    activeNavBar: 'notices'
  }
}

function _viewCheck() {
  return {
    pageTitle: 'Check the recipients',
    activeNavBar: 'notices'
  }
}

function _viewConfirmation() {
  return {
    activeNavBar: 'notices',
    forwardLink: '/notifications/report',
    pageTitle: `Returns invitations sent`,
    referenceCode: 'RINV-CPFRQ4'
  }
}
