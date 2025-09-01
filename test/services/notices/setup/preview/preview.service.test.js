'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../../fixtures/recipients.fixtures.js')
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Things we need to stub
const DetermineRecipientsService = require('../../../../../app/services/notices/setup/determine-recipients.service.js')
const FetchAbstractionAlertRecipientsService = require('../../../../../app/services/notices/setup/fetch-abstraction-alert-recipients.service.js')
const FetchReturnsRecipientsService = require('../../../../../app/services/notices/setup/fetch-returns-recipients.service.js')
const GeneratePreviewRequest = require('../../../../../app/requests/notify/generate-preview.request.js')

// Thing under test
const PreviewService = require('../../../../../app/services/notices/setup/preview/preview.service.js')

describe('Notices Setup - Preview - Preview service', () => {
  let licenceMonitoringStationId
  let recipients
  let session
  let testRecipient
  let testRecipients

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the journey is a return journey', () => {
    beforeEach(async () => {
      recipients = RecipientsFixture.recipients()

      testRecipients = [recipients.primaryUser]
      testRecipient = testRecipients[0]

      session = await SessionHelper.add({
        data: {
          journey: 'standard',
          noticeType: 'invitations',
          returnsPeriod: 'quarterFour',
          determinedReturnsPeriod: {
            name: 'allYear',
            dueDate: '2025-04-28',
            endDate: '2023-03-31',
            summer: 'false',
            startDate: '2022-04-01'
          },
          referenceCode: 'RINV-0Q7AD8'
        }
      })

      Sinon.stub(DetermineRecipientsService, 'go').returns(testRecipients)
      Sinon.stub(FetchReturnsRecipientsService, 'go').resolves()

      // As the services presenter uses Notify to generate the template preview contents, we need to stub the request
      Sinon.stub(GeneratePreviewRequest, 'send').resolves({
        succeeded: true,
        response: {
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
      })
    })

    it('returns the page data for the view', async () => {
      const result = await PreviewService.go(testRecipient.contact_hash_id, session.id, licenceMonitoringStationId)

      expect(result).to.equal({
        activeNavBar: 'manage',
        address: 'primary.user@important.com',
        backLink: `/system/notices/setup/${session.id}/check`,
        caption: 'Notice RINV-0Q7AD8',
        contents: 'Dear licence holder,\r\n',
        messageType: 'email',
        pageTitle: 'Returns invitation primary user email',
        refreshPageLink: `/system/notices/setup/${session.id}/preview/${testRecipient.contact_hash_id}`
      })
    })
  })

  describe('when the journey is an abstraction alert journey', () => {
    beforeEach(async () => {
      licenceMonitoringStationId = '36cabf0a-c7a0-4ba3-89a8-79e0620fd2b8'
      recipients = RecipientsFixture.recipients()

      testRecipients = [recipients.primaryUser]
      testRecipient = testRecipients[0]

      session = await SessionHelper.add({
        data: {
          journey: 'alerts',
          alertType: 'warning',
          noticeType: 'abstractionAlerts',
          referenceCode: 'WAA-6KN0KF',
          alertEmailAddress: 'environment-officer@wrls.gov.uk',
          monitoringStationName: 'A monitoring station',
          monitoringStationRiverName: '',
          relevantLicenceMonitoringStations: [
            {
              id: '8c85d9ce-cfb9-4932-8da0-28de4d3dd3aa',
              notes: null,
              licence: {
                licenceRef: '99/999'
              },
              measureType: 'flow',
              thresholdUnit: 'Ml/d',
              thresholdValue: 400,
              restrictionType: 'stop_or_reduce'
            },
            {
              id: '36cabf0a-c7a0-4ba3-89a8-79e0620fd2b8',
              notes: null,
              licence: {
                licenceRef: testRecipient.licence_refs
              },
              measureType: 'flow',
              thresholdUnit: 'm3/s',
              thresholdValue: 300,
              restrictionType: 'reduce'
            }
          ]
        }
      })

      Sinon.stub(DetermineRecipientsService, 'go').returns(testRecipients)
      Sinon.stub(FetchAbstractionAlertRecipientsService, 'go').resolves()

      Sinon.stub(GeneratePreviewRequest, 'send').resolves({
        succeeded: true,
        response: {
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
      })
    })

    it('returns the page data for the view', async () => {
      const result = await PreviewService.go(testRecipient.contact_hash_id, session.id, licenceMonitoringStationId)

      expect(result).to.equal({
        activeNavBar: 'manage',
        address: 'primary.user@important.com',
        backLink: `/system/notices/setup/${session.id}/preview/${testRecipient.contact_hash_id}/check-alert`,
        caption: 'Notice WAA-6KN0KF',
        contents: 'Dear licence contact,\r\n',
        messageType: 'email',
        pageTitle: 'Water abstraction alert reduce warning email',
        refreshPageLink: `/system/notices/setup/${session.id}/preview/${testRecipient.contact_hash_id}/alert/${licenceMonitoringStationId}`
      })
    })
  })
})
