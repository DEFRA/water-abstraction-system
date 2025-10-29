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
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')
const { generateReferenceCode } = require('../../../../support/helpers/notification.helper.js')

describe('Notices Setup - Preview - Preview service', () => {
  let licenceMonitoringStationId
  let recipients
  let referenceCode
  let session
  let testRecipient
  let testRecipients

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the journey is a return journey', () => {
    beforeEach(async () => {
      referenceCode = generateReferenceCode()

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
          referenceCode
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
        activeNavBar: 'notices',
        address: 'primary.user@important.com',
        backLink: `/system/notices/setup/${session.id}/check`,
        caption: `Notice ${referenceCode}`,
        contents: 'Dear licence holder,\r\n',
        messageType: 'email',
        pageTitle: 'Returns invitation primary user email',
        refreshPageLink: `/system/notices/setup/${session.id}/preview/${testRecipient.contact_hash_id}`
      })
    })
  })

  describe('when the journey is an abstraction alert journey', () => {
    beforeEach(async () => {
      referenceCode = generateReferenceCode('WAA')
      licenceMonitoringStationId = generateUUID()
      recipients = RecipientsFixture.recipients()

      testRecipients = [recipients.primaryUser]
      testRecipient = testRecipients[0]

      session = await SessionHelper.add({
        data: {
          journey: 'alerts',
          alertType: 'warning',
          noticeType: 'abstractionAlerts',
          referenceCode,
          alertEmailAddress: 'environment-officer@wrls.gov.uk',
          monitoringStationName: 'A monitoring station',
          monitoringStationRiverName: '',
          relevantLicenceMonitoringStations: [
            {
              alertType: 'reduce',
              id: generateUUID(),
              licence: {
                licenceRef: generateLicenceRef()
              },
              measureType: 'flow',
              notes: null,
              restrictionType: 'stop_or_reduce',
              thresholdUnit: 'Ml/d',
              thresholdValue: 400
            },
            {
              alertType: 'reduce',
              id: licenceMonitoringStationId,
              licence: {
                licenceRef: testRecipient.licence_refs[0]
              },
              measureType: 'flow',
              notes: null,
              restrictionType: 'reduce',
              thresholdUnit: 'm3/s',
              thresholdValue: 300
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
        activeNavBar: 'notices',
        address: 'primary.user@important.com',
        backLink: `/system/notices/setup/${session.id}/preview/${testRecipient.contact_hash_id}/check-alert`,
        caption: `Notice ${referenceCode}`,
        contents: 'Dear licence contact,\r\n',
        messageType: 'email',
        pageTitle: 'Water abstraction alert reduce warning email',
        refreshPageLink: `/system/notices/setup/${session.id}/preview/${testRecipient.contact_hash_id}/alert/${licenceMonitoringStationId}`
      })
    })
  })
})
