'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { HTTP_STATUS_OK } = require('node:http2').constants

const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateNoticeReferenceCode, generateUUID } = require('../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchRecipientsService = require('../../../../app/services/notices/setup/fetch-recipients.service.js')
const GeneratePreviewRequest = require('../../../../app/requests/notify/generate-preview.request.js')

// Thing under test
const ViewPreviewService = require('../../../../app/services/notices/setup/view-preview.service.js')

describe('Notices - Setup - View Preview service', () => {
  let licenceMonitoringStationId
  let recipients
  let session

  afterEach(() => {
    Sinon.restore()
  })

  describe('when previewing an abstraction alert notification', () => {
    beforeEach(async () => {
      const fixtureData = RecipientsFixture.alertsRecipients()

      recipients = [fixtureData.primaryUser]

      const licenceMonitoringStations = [
        {
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 10,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          id: generateUUID(),
          latestNotification: null,
          licence: {
            id: generateUUID(),
            licenceRef: recipients[0].licence_refs[0]
          },
          measureType: 'flow',
          notes: null,
          restrictionType: 'stop',
          thresholdGroup: 'flow-50-m3/s',
          thresholdValue: 50,
          thresholdUnit: 'm3/s'
        }
      ]

      session = await SessionHelper.add({
        data: {
          alertEmailAddress: 'admin-internal@wrls.gov.uk',
          alertEmailAddressType: 'username',
          alertThresholds: ['flow-50-m3/s'],
          alertType: 'stop',
          licenceRefs: [...recipients[0].licence_refs],
          licenceMonitoringStations,
          journey: 'alerts',
          monitoringStationId: generateUUID(),
          monitoringStationName: 'DEATH STAR',
          monitoringStationRiverName: '',
          name: 'Water abstraction alert',
          noticeType: 'abstractionAlerts',
          notificationType: 'Abstraction alert',
          referenceCode: generateNoticeReferenceCode('WAA-'),
          relevantLicenceMonitoringStations: [...licenceMonitoringStations],
          removedThresholds: [],
          selectedRecipients: [recipients[0].contact_hash_id],
          subType: 'waterAbstractionAlerts'
        }
      })

      licenceMonitoringStationId = licenceMonitoringStations[0].id

      Sinon.stub(FetchRecipientsService, 'go').resolves([{ ...recipients[0] }])

      // The Preview Presenter uses Notify to generate the template preview contents, so we need to stub the request.
      Sinon.stub(GeneratePreviewRequest, 'send').resolves({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_OK,
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

    it('returns page data for the view', async () => {
      const result = await ViewPreviewService.go(session.id, recipients[0].contact_hash_id, licenceMonitoringStationId)

      expect(result).to.equal({
        activeNavBar: 'notices',
        address: 'primary.user@important.com',
        backLink: {
          href: `/system/notices/setup/${session.id}/preview/${recipients[0].contact_hash_id}/check-alert`,
          text: 'Back'
        },
        contents: 'Dear licence holder,\r\n',
        messageType: 'email',
        pageTitle: 'Water abstraction alert stop email',
        pageTitleCaption: `Notice ${session.referenceCode}`,
        refreshPageLink: `/system/notices/setup/${session.id}/preview/${recipients[0].contact_hash_id}/alert/${licenceMonitoringStationId}`
      })
    })
  })

  describe('when previewing a returns invitation or reminder notification', () => {
    beforeEach(async () => {
      const fixtureData = RecipientsFixture.recipients()

      recipients = [fixtureData.primaryUser]

      const licenceRef = generateLicenceRef()
      const referenceCode = generateNoticeReferenceCode('RINV-')
      const sessionId = generateUUID()
      const dueReturns = [
        {
          dueDate: '2025-04-28T00:00:00.000Z',
          endDate: '2025-03-31T00:00:00.000Z',
          naldAreaCode: 'RIDIN',
          purpose: 'Spray Irrigation - Direct',
          regionCode: 3,
          regionName: 'North East',
          returnId: generateUUID(),
          returnLogId: `v1:3:${licenceRef}:10059610:2024-04-01:2025-03-31`,
          returnReference: '10059610',
          returnsFrequency: 'month',
          siteDescription: 'BOREHOLE AT AVALON',
          startDate: '2024-04-01T00:00:00.000Z',
          twoPartTariff: false
        }
      ]

      session = await SessionHelper.add({
        id: sessionId,
        data: {
          addressJourney: {
            address: {},
            backLink: {
              href: `/system/notices/setup/${sessionId}/recipient-name`,
              text: 'Back'
            },
            redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`,
            activeNavBar: 'notices',
            pageTitleCaption: `Notice ${referenceCode}`
          },
          checkPageVisited: true,
          dueReturns,
          licenceRef,
          journey: 'adhoc',
          name: 'Returns: invitation',
          notificationType: 'Returns invitation',
          noticeType: 'invitations',
          referenceCode,
          selectedRecipients: [recipients[0].contact_hash_id],
          subType: 'returnInvitation'
        }
      })

      licenceMonitoringStationId = null

      Sinon.stub(FetchRecipientsService, 'go').resolves([{ ...recipients[0] }])

      // The Preview Presenter uses Notify to generate the template preview contents, so we need to stub the request.
      Sinon.stub(GeneratePreviewRequest, 'send').resolves({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_OK,
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

    it('returns page data for the view', async () => {
      const result = await ViewPreviewService.go(session.id, recipients[0].contact_hash_id, licenceMonitoringStationId)

      expect(result).to.equal({
        activeNavBar: 'notices',
        address: 'primary.user@important.com',
        backLink: {
          href: `/system/notices/setup/${session.id}/check`,
          text: 'Back'
        },
        contents: 'Dear licence holder,\r\n',
        messageType: 'email',
        pageTitle: 'Returns invitation primary user email',
        pageTitleCaption: `Notice ${session.referenceCode}`,
        refreshPageLink: `/system/notices/setup/${session.id}/preview/${recipients[0].contact_hash_id}`
      })
    })
  })
})
