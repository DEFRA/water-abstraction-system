'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const AlertEmailAddressService = require('../../app/services/notices/setup/abstraction-alerts/alert-email-address.service.js')
const AlertThresholdsService = require('../../app/services/notices/setup/abstraction-alerts/alert-thresholds.service.js')
const AlertTypeService = require('../../app/services/notices/setup/abstraction-alerts/alert-type.service.js')
const CancelAlertsService = require('../../app/services/notices/setup/abstraction-alerts/cancel-alerts.service.js')
const CancelService = require('../../app/services/notices/setup/cancel.service.js')
const CheckAlert = require('../../app/services/notices/setup/preview/check-alert.service.js')
const CheckLicenceMatchesService = require('../../app/services/notices/setup/abstraction-alerts/check-licence-matches.service.js')
const CheckNoticeTypeService = require('../../app/services/notices/setup/check-notice-type.service.js')
const CheckService = require('../../app/services/notices/setup/check.service.js')
const ConfirmationService = require('../../app/services/notices/setup/confirmation.service.js')
const DownloadRecipientsService = require('../../app/services/notices/setup/download-recipients.service.js')
const InitiateSessionService = require('../../app/services/notices/setup/initiate-session.service.js')
const LicenceService = require('../../app/services/notices/setup/licence.service.js')
const NoticeTypeService = require('../../app/services/notices/setup/notice-type.service.js')
const PreviewService = require('../../app/services/notices/setup/preview/preview.service.js')
const RemoveLicencesService = require('../../app/services/notices/setup/remove-licences.service.js')
const RemoveThresholdService = require('../../app/services/notices/setup/abstraction-alerts/remove-threshold.service.js')
const ReturnFormsService = require('../../app/services/notices/setup/return-forms.service.js')
const ReturnsPeriodService = require('../../app/services/notices/setup/returns-period/returns-period.service.js')
const SubmitAlertEmailAddressService = require('../../app/services/notices/setup/abstraction-alerts/submit-alert-email-address.service.js')
const SubmitAlertThresholdsService = require('../../app/services/notices/setup/abstraction-alerts/submit-alert-thresholds.service.js')
const SubmitAlertTypeService = require('../../app/services/notices/setup/abstraction-alerts/submit-alert-type.service.js')
const SubmitCancelAlertsService = require('../../app/services/notices/setup/abstraction-alerts/submit-cancel-alerts.service.js')
const SubmitCancelService = require('../../app/services/notices/setup/submit-cancel.service.js')
const SubmitCheckLicenceMatchesService = require('../../app/services/notices/setup/abstraction-alerts/submit-check-licence-matches.service.js')
const SubmitCheckService = require('../../app/services/notices/setup/submit-check.service.js')
const SubmitLicenceService = require('../../app/services/notices/setup/submit-licence.service.js')
const SubmitNoticeTypeService = require('../../app/services/notices/setup/submit-notice-type.service.js')
const SubmitRemoveLicencesService = require('../../app/services/notices/setup/submit-remove-licences.service.js')
const SubmitReturnFormsService = require('../../app/services/notices/setup/submit-return-forms.service.js')
const SubmitReturnsPeriodService = require('../../app/services/notices/setup/returns-period/submit-returns-period.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Notices Setup controller', () => {
  const basePath = '/notices/setup'
  const session = { id: 'e0c77b74-7326-493d-be5e-0d1ad41594b5', data: {} }

  let getOptions
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

  describe('notices/setup', () => {
    describe('GET', () => {
      let response

      describe('when the journey is "standard"', () => {
        beforeEach(async () => {
          getOptions = {
            method: 'GET',
            url: '/notices/setup/standard',
            auth: {
              strategy: 'session',
              credentials: { scope: ['returns'] }
            }
          }

          response = { path: 'returns-period', sessionId: session.id }
        })

        describe('when a request is valid', () => {
          beforeEach(async () => {
            Sinon.stub(InitiateSessionService, 'go').resolves(response)
          })

          it('redirects successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/notices/setup/${session.id}/returns-period`)
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
              credentials: { scope: ['returns'] }
            }
          }

          response = { path: 'licence', sessionId: session.id }
        })

        describe('when a request is valid', () => {
          beforeEach(async () => {
            Sinon.stub(InitiateSessionService, 'go').resolves(response)
          })

          it('redirects successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/notices/setup/${session.id}/licence`)
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
            credentials: { scope: ['returns'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').resolves(session)
          Sinon.stub(CancelService, 'go').returns(_viewCancel())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const pageData = _viewCancel()
          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain(pageData.activeNavBar)
          expect(response.payload).to.contain(pageData.pageTitle)
          expect(response.payload).to.contain(pageData.referenceCode)
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitCancelService, 'go').returns('/manage')
          postOptions = postRequestOptions(basePath + `/${session.id}/cancel`, {})
        })

        it('redirects the to the next page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/manage')
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
            credentials: { scope: ['returns'] }
          }
        }
      })
      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').resolves(session)
          Sinon.stub(CheckService, 'go').returns(_viewCheck())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const pageData = _viewCheck()

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain(pageData.activeNavBar)
          expect(response.payload).to.contain(pageData.pageTitle)
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        let eventId

        beforeEach(async () => {
          eventId = '1233'

          Sinon.stub(SubmitCheckService, 'go').returns(eventId)
          postOptions = postRequestOptions(basePath + `/${session.id}/check`, {})
        })

        it('redirects the to the next page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/notices/setup/${eventId}/confirmation`)
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
            credentials: { scope: ['returns'] }
          }
        }
      })
      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').resolves(session)
          Sinon.stub(CheckNoticeTypeService, 'go').returns({
            pageTitle: 'Check the notice type'
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Check the notice type')
        })
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
            credentials: { scope: ['returns'] }
          }
        }
      })
      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').resolves(session)
          Sinon.stub(ConfirmationService, 'go').returns(_viewConfirmation())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const pageData = _viewConfirmation()

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain(pageData.activeNavBar)
          expect(response.payload).to.contain(pageData.pageTitle)
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
            credentials: { scope: ['returns'] }
          }
        }
      })
      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').resolves(session)
          Sinon.stub(DownloadRecipientsService, 'go').returns({ data: 'test', type: 'type/csv', filename: 'test.csv' })
        })

        it('returns the file successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.headers['content-type']).to.equal('type/csv')
          expect(response.headers['content-disposition']).to.equal('attachment; filename="test.csv"')
          expect(response.payload).to.equal('test')
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
              credentials: { scope: ['returns'] }
            }
          }

          Sinon.stub(AlertEmailAddressService, 'go').resolves({
            pageTitle: 'Email Address page'
          })
        })

        describe('when a request is valid', () => {
          it('returns the page successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Email Address page')
          })
        })
      })

      describe('POST', () => {
        describe('when a request is valid', () => {
          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/alert-email-address`, {})

            Sinon.stub(SubmitAlertEmailAddressService, 'go').resolves({})
          })

          it('redirects to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/notices/setup/${session.id}/check`)
          })
        })

        describe('when a request is invalid', () => {
          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/alert-email-address`, {})

            Sinon.stub(SubmitAlertEmailAddressService, 'go').resolves({
              error: { text: 'Select an option' },
              pageTitle: 'Email Address page'
            })
          })

          it('re-renders the page with an error message', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Email Address page')
            expect(response.payload).to.contain('There is a problem')
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
              credentials: { scope: ['returns'] }
            }
          }

          Sinon.stub(AlertThresholdsService, 'go').resolves({
            pageTitle: 'Threshold page'
          })
        })

        describe('when a request is valid', () => {
          it('returns the page successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Threshold page')
          })
        })
      })

      describe('POST', () => {
        describe('when a request is valid', () => {
          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/alert-thresholds`, {})

            Sinon.stub(SubmitAlertThresholdsService, 'go').resolves({})
          })

          it('redirects to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`
            )
          })
        })

        describe('when a request is invalid', () => {
          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/alert-type`, {})

            Sinon.stub(SubmitAlertTypeService, 'go').resolves({
              error: { text: 'Select an option' },
              pageTitle: 'Threshold page'
            })
          })

          it('re-renders the page with an error message', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Threshold page')
            expect(response.payload).to.contain('There is a problem')
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
              credentials: { scope: ['returns'] }
            }
          }

          Sinon.stub(AlertTypeService, 'go').resolves({
            pageTitle: 'Alert page'
          })
        })

        describe('when a request is valid', () => {
          it('returns the page successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Alert page')
          })
        })
      })

      describe('POST', () => {
        describe('when a request is valid', () => {
          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/alert-type`, {})

            Sinon.stub(SubmitAlertTypeService, 'go').resolves({})
          })

          it('redirects to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`
            )
          })
        })

        describe('when a request is invalid', () => {
          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/alert-type`, {})

            Sinon.stub(SubmitAlertTypeService, 'go').resolves({
              error: { text: 'Select an option' },
              pageTitle: 'Alert page'
            })
          })

          it('re-renders the page with an error message', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Alert page')
            expect(response.payload).to.contain('There is a problem')
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
              credentials: { scope: ['returns'] }
            }
          }

          Sinon.stub(CancelAlertsService, 'go').resolves({
            pageTitle: 'Cancel page'
          })
        })

        describe('when a request is valid', () => {
          it('returns the page successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Cancel page')
          })
        })
      })

      describe('POST', () => {
        describe('when a request is valid', () => {
          const monitoringStationId = '123'

          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/cancel`, {})

            Sinon.stub(SubmitCancelAlertsService, 'go').resolves({ monitoringStationId })
          })

          it('redirects to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/monitoring-stations/${monitoringStationId}`)
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
              credentials: { scope: ['returns'] }
            }
          }

          Sinon.stub(CheckLicenceMatchesService, 'go').resolves({
            pageTitle: 'Check licence page'
          })
        })

        describe('when a request is valid', () => {
          it('returns the page successfully', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Check licence page')
          })
        })
      })

      describe('POST', () => {
        describe('when a request is valid', () => {
          beforeEach(async () => {
            postOptions = postRequestOptions(basePath + `/${session.id}/abstraction-alerts/check-licence-matches`, {})

            Sinon.stub(SubmitCheckLicenceMatchesService, 'go').resolves()
          })

          it('redirects to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
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
              credentials: { scope: ['returns'] }
            }
          }

          Sinon.stub(RemoveThresholdService, 'go').resolves({})
        })

        describe('when a request is valid', () => {
          it('redirects the to the next page', async () => {
            const response = await server.inject(getOptions)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
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
            credentials: { scope: ['returns'] }
          }
        }

        Sinon.stub(LicenceService, 'go').resolves({
          pageTitle: 'Enter a licence number'
        })
      })

      describe('when a request is valid', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Enter a licence number')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(async () => {
          postOptions = postRequestOptions(basePath + `/${session.id}/licence`, { licenceRef: '01/115' })

          Sinon.stub(SubmitLicenceService, 'go').resolves({ redirectUrl: 'notice-type' })
        })

        it('returns the same page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/notices/setup/${session.id}/notice-type`)
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          postOptions = postRequestOptions(basePath + `/${session.id}/licence`, { licenceRef: '' })

          Sinon.stub(SubmitLicenceService, 'go').resolves({
            licenceRef: '01/115',
            error: { text: 'Enter a Licence number' }
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Enter a Licence number')
          expect(response.payload).to.contain('There is a problem')
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
            credentials: { scope: ['returns'] }
          }
        }

        Sinon.stub(PreviewService, 'go').resolves({
          pageTitle: 'Preview notice'
        })
      })

      describe('when a request is valid', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Preview notice')
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
            credentials: { scope: ['returns'] }
          }
        }

        Sinon.stub(PreviewService, 'go').resolves({
          pageTitle: 'Preview notice'
        })
      })

      describe('when a request is valid', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Preview notice')
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
            credentials: { scope: ['returns'] }
          }
        }

        Sinon.stub(CheckAlert, 'go').resolves({
          pageTitle: 'Check the recipient previews'
        })
      })

      describe('when a request is valid', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Check the recipient previews')
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
            credentials: { scope: ['returns'] }
          }
        }

        Sinon.stub(NoticeTypeService, 'go').resolves({
          pageTitle: 'Select the notice type'
        })
      })

      describe('when a request is valid', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the notice type')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(async () => {
          postOptions = postRequestOptions(basePath + `/${session.id}/notice-type`, { noticeType: 'returns' })

          Sinon.stub(SubmitNoticeTypeService, 'go').resolves({ redirectUrl: 'check-notice-type' })
        })

        it('returns the same page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/notices/setup/${session.id}/check-notice-type`)
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          postOptions = postRequestOptions(basePath + `/${session.id}/notice-type`, { noticeType: '' })

          Sinon.stub(SubmitNoticeTypeService, 'go').resolves({
            error: { text: 'Select the notice type' },
            pageTitle: 'Select the notice type'
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the notice type')
          expect(response.payload).to.contain('There is a problem')
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
            credentials: { scope: ['returns'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').resolves(session)
          Sinon.stub(RemoveLicencesService, 'go').returns(_viewRemoveLicence())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const pageData = _viewRemoveLicence()

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain(pageData.activeNavBar)
          expect(response.payload).to.contain(pageData.pageTitle)
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(InitiateSessionService, 'go').resolves(session)
            Sinon.stub(SubmitRemoveLicencesService, 'go').returns({
              ..._viewRemoveLicence(),
              error: 'Something went wrong'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/remove-licences`, {})
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the validation succeeds', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitRemoveLicencesService, 'go').returns({ redirect: 'check' })
            postOptions = postRequestOptions(basePath + `/${session.id}/remove-licences`, {})
          })

          it('redirects the to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/notices/setup/check')
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
            credentials: { scope: ['returns'] }
          }
        }
      })
      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').resolves(session)
          Sinon.stub(ReturnsPeriodService, 'go').returns(_viewReturnsPeriod())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          const pageData = _viewReturnsPeriod()

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain(pageData.activeNavBar)
          expect(response.payload).to.contain(pageData.pageTitle)
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(InitiateSessionService, 'go').resolves(session)
            Sinon.stub(SubmitReturnsPeriodService, 'go').returns({
              ..._viewReturnsPeriod(),
              error: 'Something went wrong'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/returns-period`, {})
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the validation succeeds', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitReturnsPeriodService, 'go').returns({ redirect: 'send-notice' })
            postOptions = postRequestOptions(basePath + `/${session.id}/returns-period`, {})
          })

          it('redirects the to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/notices/setup/send-notice')
          })
        })
      })
    })
  })

  describe('notices/setup/return-forms', () => {
    describe('GET', () => {
      beforeEach(async () => {
        getOptions = {
          method: 'GET',
          url: basePath + `/${session.id}/return-forms`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['returns'] }
          }
        }
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').resolves(session)
          Sinon.stub(ReturnFormsService, 'go').returns({ pageTitle: 'Select the returns for the paper forms' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(getOptions)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the returns for the paper forms')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(InitiateSessionService, 'go').resolves(session)
            Sinon.stub(SubmitReturnFormsService, 'go').returns({
              error: 'Something went wrong'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/return-forms`, {})
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('There is a problem')
          })
        })

        describe('and the validation succeeds', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitReturnFormsService, 'go').returns({
              pageTile: 'Select the returns for the paper forms'
            })
            postOptions = postRequestOptions(basePath + `/${session.id}/return-forms`, {})
          })

          it('redirects the to the next page', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(`/system/notices/setup/${session.id}/check-notice-type`)
          })
        })
      })
    })
  })
})

function _viewCancel() {
  return {
    activeNavBar: 'manage',
    pageTitle: 'You are about to cancel this notification',
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
    backLink: '/manage',
    activeNavBar: 'manage',
    returnsPeriod: []
  }
}

function _viewRemoveLicence() {
  return {
    pageTitle: 'Remove licences',
    hint: 'hint to remove',
    activeNavBar: 'manage'
  }
}

function _viewCheck() {
  return {
    pageTitle: 'Check the recipients',
    activeNavBar: 'manage'
  }
}

function _viewConfirmation() {
  return {
    activeNavBar: 'manage',
    forwardLink: '/notifications/report',
    pageTitle: `Returns invitations sent`,
    referenceCode: 'RINV-CPFRQ4'
  }
}
