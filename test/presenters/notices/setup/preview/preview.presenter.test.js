'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const GeneratePreviewRequest = require('../../../../../app/requests/notify/generate-preview.request.js')

// Thing under test
const PreviewPresenter = require('../../../../../app/presenters/notices/setup/preview/preview.presenter.js')

describe('Notices - Setup - Preview - Preview presenter', () => {
  const contactHashId = '9df5923f179a0ed55c13173c16651ed9'
  const licenceMonitoringStationId = 'a4d15f69-5005-4b6e-ab50-3fbae2deec9c'
  const sessionId = '7334a25e-9723-4732-a6e1-8e30c5f3732e'

  let noticeType
  let notification
  let response

  afterEach(() => {
    Sinon.restore()
  })

  describe('when previewing the notification succeeds', () => {
    describe('and the notice type is "invitations"', () => {
      beforeEach(() => {
        noticeType = 'invitations'
      })

      describe('and the notification is a letter', () => {
        beforeEach(() => {
          notification = {
            licences: '["11/1111"]',
            messageRef: 'returns_invitation_licence_holder_letter',
            messageType: 'letter',
            personalisation: {
              address_line_1: 'Clean Water Limited',
              address_line_2: 'c/o Bob Bobbles',
              address_line_3: 'Water Lane',
              address_line_4: 'Swampy Heath',
              address_line_5: 'Marshton',
              address_line_6: 'CAMBRIDGESHIRE',
              address_line_7: 'CB23 1ZZ',
              name: 'Clean Water Limited',
              periodEndDate: '28th January 2025',
              periodStartDate: '1st January 2025',
              returnDueDate: '28th April 2025'
            },
            reference: 'RINV-0Q7AD8',
            templateId: '4fe80aed-c5dd-44c3-9044-d0289d635019'
          }

          response = {
            statusCode: 200,
            body: {
              body: 'Dear Clean Water Limited,\r\n',
              html: null,
              id: '0f864b1c-eddf-463e-9df6-035e1e83b550',
              postage: 'first',
              subject: 'Submit your water abstraction returns by 28th April 2025',
              type: 'letter',
              version: 32
            }
          }

          Sinon.stub(GeneratePreviewRequest, 'send').resolves({
            succeeded: true,
            response
          })
        })

        it('correctly presents the data', async () => {
          const result = await PreviewPresenter.go(
            contactHashId,
            noticeType,
            notification,
            sessionId,
            licenceMonitoringStationId
          )

          expect(result).to.equal({
            address: [
              'Clean Water Limited',
              'c/o Bob Bobbles',
              'Water Lane',
              'Swampy Heath',
              'Marshton',
              'CAMBRIDGESHIRE',
              'CB23 1ZZ'
            ],
            backLink: `/system/notices/setup/${sessionId}/check`,
            caption: 'Notice RINV-0Q7AD8',
            contents: 'Dear Clean Water Limited,\r\n',
            messageType: 'letter',
            pageTitle: 'Returns invitation licence holder letter',
            refreshPageLink: `/system/notices/setup/${sessionId}/preview/${contactHashId}`
          })
        })
      })

      describe('and the notification is an email', () => {
        beforeEach(() => {
          notification = {
            licences: '["11/1111"]',
            messageRef: 'returns_invitation_primary_user_email',
            messageType: 'email',
            personalisation: {
              periodEndDate: '28th January 2025',
              periodStartDate: '1st January 2025',
              returnDueDate: '28th April 2025'
            },
            recipient: 'hello@example.com',
            reference: 'RINV-H1EZR5',
            templateId: '4fe80aed-c5dd-44c3-9044-d0289d635019'
          }

          response = {
            statusCode: 200,
            body: {
              body: 'Dear licence holder,\r\n',
              html: '"<p style="Margin: 0 0 20px 0; font-size: 19px; line-height: 25px; color: #0B0C0C;">Dear licence holder,</p>',
              id: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f',
              postage: null,
              subject: 'Submit your water abstraction returns by 28th April 2025',
              type: 'email',
              version: 40
            }
          }

          Sinon.stub(GeneratePreviewRequest, 'send').resolves({
            succeeded: true,
            response
          })
        })

        it('correctly presents the data', async () => {
          const result = await PreviewPresenter.go(
            contactHashId,
            noticeType,
            notification,
            sessionId,
            licenceMonitoringStationId
          )

          expect(result).to.equal({
            address: 'hello@example.com',
            backLink: `/system/notices/setup/${sessionId}/check`,
            caption: 'Notice RINV-H1EZR5',
            contents: 'Dear licence holder,\r\n',
            messageType: 'email',
            pageTitle: 'Returns invitation primary user email',
            refreshPageLink: `/system/notices/setup/${sessionId}/preview/${contactHashId}`
          })
        })
      })
    })

    describe('and the notice type is "abstractionAlerts"', () => {
      beforeEach(() => {
        noticeType = 'abstractionAlerts'
      })

      describe('and the notification is a letter', () => {
        beforeEach(() => {
          notification = {
            licences: '["11/1111"]',
            messageRef: 'water_abstraction_alert_stop_warning',
            messageType: 'letter',
            personalisation: {
              address_line_1: 'Clean Water Limited',
              address_line_2: 'c/o Bob Bobbles',
              address_line_3: 'Water Lane',
              address_line_4: 'Swampy Heath',
              address_line_5: 'CAMBRIDGESHIRE',
              address_line_6: 'CB23 1ZZ',
              alertType: 'warning',
              condition_text: 'Effect of restriction: 9.2 (ii) No abstraction shall take place when we say so',
              flow_or_level: 'flow',
              issuer_email_address: 'admin-internal@wrls.gov.uk',
              licence_ref: '11/1111',
              licenceMonitoringStationId,
              name: 'Clean Water Limited',
              monitoring_station_name: 'FRENCHAY',
              source: '',
              threshold_unit: 'm3/s',
              threshold_value: 100
            },
            reference: 'WAA-DLT1YN',
            templateId: '7ab10c86-2c23-4376-8c72-9419e7f982bb'
          }

          response = {
            statusCode: 200,
            body: {
              body: 'Dear licence contact,\r\n',
              html: null,
              id: '7ab10c86-2c23-4376-8c72-9419e7f982bb',
              postage: null,
              subject: 'Water abstraction alert: You may need to stop water abstraction soon',
              type: 'letter',
              version: 7
            }
          }

          Sinon.stub(GeneratePreviewRequest, 'send').resolves({
            succeeded: true,
            response
          })
        })

        it('correctly presents the data', async () => {
          const result = await PreviewPresenter.go(
            contactHashId,
            noticeType,
            notification,
            sessionId,
            licenceMonitoringStationId
          )

          expect(result).to.equal({
            address: [
              'Clean Water Limited',
              'c/o Bob Bobbles',
              'Water Lane',
              'Swampy Heath',
              'CAMBRIDGESHIRE',
              'CB23 1ZZ'
            ],
            backLink: `/system/notices/setup/${sessionId}/preview/${contactHashId}/check-alert`,
            caption: 'Notice WAA-DLT1YN',
            contents: 'Dear licence contact,\r\n',
            messageType: 'letter',
            pageTitle: 'Water abstraction alert stop warning',
            refreshPageLink: `/system/notices/setup/${sessionId}/preview/${contactHashId}/alert/${licenceMonitoringStationId}`
          })
        })
      })

      describe('and the notification is an email', () => {
        beforeEach(() => {
          notification = {
            licences: '["11/1111"]',
            messageRef: 'water_abstraction_alert_reduce_or_stop_warning_email',
            messageType: 'email',
            personalisation: {
              alertType: 'warning',
              condition_text: '',
              flow_or_level: 'flow',
              issuer_email_address: 'admin-internal@wrls.gov.uk',
              licence_ref: '11/1111',
              licenceMonitoringStationId,
              monitoring_station_name: 'FRENCHAY',
              source: '',
              threshold_unit: 'm3/s',
              threshold_value: 100
            },
            recipient: 'hello@example.com',
            reference: 'WAA-WFB4LB',
            templateId: 'bf32327a-f170-4854-8abb-3068aee9cdec'
          }

          response = {
            statusCode: 200,
            body: {
              body: 'Dear licence contact,\r\n',
              html: '"<p style="Margin: 0 0 20px 0; font-size: 19px; line-height: 25px; color: #0B0C0C;">Dear licence contact,</p>',
              id: 'bf32327a-f170-4854-8abb-3068aee9cdec',
              postage: null,
              subject: 'Water abstraction alert: You may need to reduce or stop water abstraction soon',
              type: 'email',
              version: 1
            }
          }

          Sinon.stub(GeneratePreviewRequest, 'send').resolves({
            succeeded: true,
            response
          })
        })

        it('correctly presents the data', async () => {
          const result = await PreviewPresenter.go(
            contactHashId,
            noticeType,
            notification,
            sessionId,
            licenceMonitoringStationId
          )

          expect(result).to.equal({
            address: 'hello@example.com',
            backLink: `/system/notices/setup/${sessionId}/preview/${contactHashId}/check-alert`,
            caption: 'Notice WAA-WFB4LB',
            contents: 'Dear licence contact,\r\n',
            messageType: 'email',
            pageTitle: 'Water abstraction alert reduce or stop warning email',
            refreshPageLink: `/system/notices/setup/${sessionId}/preview/${contactHashId}/alert/${licenceMonitoringStationId}`
          })
        })
      })
    })
  })

  describe('when previewing the notification fails', () => {
    beforeEach(() => {
      noticeType = 'invitations'

      notification = {
        licences: '["11/1111"]',
        messageRef: 'returns_invitation_primary_user_email',
        messageType: 'email',
        personalisation: {
          periodEndDate: '28th January 2025',
          periodStartDate: '1st January 2025',
          returnDueDate: '28th April 2025'
        },
        recipient: 'hello@example.com',
        reference: 'RINV-H1EZR5',
        templateId: '4fe80aed-c5dd-44c3-9044-d0289d635019'
      }

      response = {
        statusCode: 400,
        body: {
          errors: [
            {
              error: 'BadRequestError',
              message: 'Missing personalisation: returnDueDate'
            }
          ],
          status_code: 400
        }
      }

      Sinon.stub(GeneratePreviewRequest, 'send').resolves({
        succeeded: false,
        response
      })
    })

    it('correctly presents the data', async () => {
      const result = await PreviewPresenter.go(
        contactHashId,
        noticeType,
        notification,
        sessionId,
        licenceMonitoringStationId
      )

      expect(result).to.equal({
        address: 'hello@example.com',
        backLink: `/system/notices/setup/${sessionId}/check`,
        caption: 'Notice RINV-H1EZR5',
        contents: 'error',
        messageType: 'email',
        pageTitle: 'Returns invitation primary user email',
        refreshPageLink: `/system/notices/setup/${sessionId}/preview/${contactHashId}`
      })
    })
  })
})
