// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
const { HTTP_STATUS_OK } = http2.constants

import * as RecipientsFixture from '../../../../support/fixtures/recipients.fixture.js'
import SessionModelStub from '../../../../support/stubs/session.stub.js'
import { generateLicenceRef } from '../../../../support/helpers/licence.helper.js'
import { generateNoticeReferenceCode, generateUUID } from '../../../../../app/lib/general.lib.js'

// Things we need to stub
import FetchRecipientsService from '../../../../../app/services/notices/setup/fetch-recipients.service.js'
import FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'
import * as GeneratePreviewRequest from '../../../../../app/requests/notify/generate-preview.request.js'

// Thing under test
import ViewPreviewService from '../../../../../app/services/notices/setup/preview/view-preview.service.js'

describe('Notices - Setup - Preview - View Preview service', () => {
  let licenceMonitoringStationId
  let recipients
  let session
  let sessionData

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when previewing an abstraction alert notification', () => {
    beforeEach(() => {
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

      sessionData = {
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

      session = SessionModelStub(sessionData)

      vi.mock('../../../../../app/dal/fetch-session.dal.js')
      FetchSessionDal.mockResolvedValue(session)

      licenceMonitoringStationId = licenceMonitoringStations[0].id

      vi.mock('../../../../../app/services/notices/setup/fetch-recipients.service.js')
      FetchRecipientsService.mockResolvedValue([{ ...recipients[0] }])

      // The Preview Presenter uses Notify to generate the template preview contents, so we need to stub the request.
      vi.spyOn(GeneratePreviewRequest, 'send').mockResolvedValue({
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
      const result = await ViewPreviewService(session.id, recipients[0].contact_hash_id, licenceMonitoringStationId)

      expect(result).toEqual({
        activeNavBar: 'notices',
        address: 'primary.user@important.com',
        backLink: {
          href: `/system/notices/setup/${session.id}/preview/${recipients[0].contact_hash_id}/check-alert`,
          text: 'Back'
        },
        contents: 'Dear licence holder,\r\n',
        messageType: 'email',
        pageTitle: 'Abstraction alert stop',
        pageTitleCaption: `Notice ${session.referenceCode}`,
        refreshPageLink: `/system/notices/setup/${session.id}/preview/${recipients[0].contact_hash_id}/alert/${licenceMonitoringStationId}`
      })
    })
  })

  describe('when previewing a returns invitation or reminder notification', () => {
    beforeEach(() => {
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
          returnId: `v1:3:${licenceRef}:10059610:2024-04-01:2025-03-31`,
          returnLogId: generateUUID(),
          returnReference: '10059610',
          returnsFrequency: 'month',
          siteDescription: 'BOREHOLE AT AVALON',
          startDate: '2024-04-01T00:00:00.000Z',
          twoPartTariff: false
        }
      ]

      sessionData = {
        id: sessionId,
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

      session = SessionModelStub(sessionData)

      vi.mock('../../../../../app/dal/fetch-session.dal.js')
      FetchSessionDal.mockResolvedValue(session)

      licenceMonitoringStationId = null

      vi.mock('../../../../../app/services/notices/setup/fetch-recipients.service.js')
      FetchRecipientsService.mockResolvedValue([{ ...recipients[0] }])

      // The Preview Presenter uses Notify to generate the template preview contents, so we need to stub the request.
      vi.spyOn(GeneratePreviewRequest, 'send').mockResolvedValue({
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
      const result = await ViewPreviewService(session.id, recipients[0].contact_hash_id, licenceMonitoringStationId)

      expect(result).toEqual({
        activeNavBar: 'notices',
        address: 'primary.user@important.com',
        backLink: {
          href: `/system/notices/setup/${session.id}/check`,
          text: 'Back'
        },
        contents: 'Dear licence holder,\r\n',
        messageType: 'email',
        pageTitle: 'Returns invitation ad-hoc',
        pageTitleCaption: `Notice ${session.referenceCode}`,
        refreshPageLink: `/system/notices/setup/${session.id}/preview/${recipients[0].contact_hash_id}`
      })
    })
  })

  describe('when previewing a renewal invitation notification', () => {
    beforeEach(() => {
      recipients = [RecipientsFixture.renewalInvitationPrimaryUser()]

      const referenceCode = generateNoticeReferenceCode('REIN-')
      const sessionId = generateUUID()

      sessionData = {
        id: sessionId,
        checkPageVisited: true,
        expiryDate: '2025-09-30T00:00:00.000Z',
        journey: 'adhoc',
        licenceRef: recipients[0].licence_refs[0],
        name: 'Renewals: invitation',
        noticeType: 'renewalInvitations',
        notificationType: 'Renewals invitation',
        referenceCode,
        renewalDate: '2025-07-31T00:00:00.000Z',
        subType: 'renewalInvitation'
      }

      session = SessionModelStub(sessionData)

      vi.mock('../../../../../app/dal/fetch-session.dal.js')
      FetchSessionDal.mockResolvedValue(session)

      licenceMonitoringStationId = null

      vi.mock('../../../../../app/services/notices/setup/fetch-recipients.service.js')
      FetchRecipientsService.mockResolvedValue([{ ...recipients[0] }])

      // The Preview Presenter uses Notify to generate the template preview contents, so we need to stub the request.
      vi.spyOn(GeneratePreviewRequest, 'send').mockResolvedValue({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_OK,
          body: {
            body: 'Dear licence holder,\r\n',
            html: '"<p style="Margin: 0 0 20px 0; font-size: 19px; line-height: 25px; color: #0B0C0C;">Dear licence holder,</p>',
            id: '53c34f21-4f2e-43f7-97c6-7a7828079665',
            postage: null,
            subject: 'Your water abstraction licence is due to expire',
            type: 'email',
            version: 40
          }
        }
      })
    })

    it('returns page data for the view', async () => {
      const result = await ViewPreviewService(session.id, recipients[0].contact_hash_id, licenceMonitoringStationId)

      expect(result).toEqual({
        activeNavBar: 'notices',
        address: recipients[0].email,
        backLink: {
          href: `/system/notices/setup/${session.id}/check`,
          text: 'Back'
        },
        contents: 'Dear licence holder,\r\n',
        messageType: 'email',
        pageTitle: 'Renewal invitation ad-hoc',
        pageTitleCaption: `Notice ${session.referenceCode}`,
        refreshPageLink: `/system/notices/setup/${session.id}/preview/${recipients[0].contact_hash_id}`
      })
    })
  })
})
