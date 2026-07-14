// Test helpers
import EventModel from '../../../../app/models/event.model.js'
import * as NoticesFixture from '../../../support/fixtures/notices.fixture.js'
import NotificationModel from '../../../../app/models/notification.model.js'
import * as RecipientsFixture from '../../../support/fixtures/recipients.fixture.js'
import { NOTIFY_TEMPLATES } from '../../../../app/lib/notify-templates.lib.js'

// Things we need to stub
import * as FetchAlternateRenewalRecipientsService from '../../../../app/services/notices/setup/renewal-notice/fetch-alternate-renewal-recipients.service.js'

// Thing under test
import CreateAlternateRenewalNoticeService from '../../../../app/services/notices/setup/create-alternate-renewal-notice.service.js'

describe('Notices - Setup - Create Alternate Renewal Notice service', () => {
  let expiryDate
  let licenceRefs
  let notice
  let notificationId
  let recipient
  let renewalDate

  beforeEach(() => {
    expiryDate = new Date('2026-04-28')
    renewalDate = new Date('2026-01-28')

    notice = NoticesFixture.renewalInvitation()

    recipient = RecipientsFixture.renewalInvitationLicenceHolder()
    recipient.licence_refs = notice.licences

    licenceRefs = notice.licences

    vi.spyOn(FetchAlternateRenewalRecipientsService, 'default').mockResolvedValue([recipient])
  })

  afterEach(async () => {
    vi.restoreAllMocks()

    await NotificationModel.query().deleteById(notificationId)
    await EventModel.query().deleteById(notice.id)
  })

  it('creates and then returns the alternate notice and associated notifications ready for sending', async () => {
    const result = await CreateAlternateRenewalNoticeService(notice, licenceRefs, expiryDate, renewalDate)

    expect(result.notice).toMatchObject({
      issuer: notice.issuer,
      licences: notice.licences,
      metadata: {
        error: 0,
        expiryDate: '2026-04-28',
        name: 'Renewals: invitation',
        options: { excludedLicences: [] },
        recipients: 1,
        renewalDate: '2026-01-28'
      },
      overallStatus: 'pending',
      status: 'completed',
      statusCounts: { cancelled: 0, error: 0, pending: 1, sent: 0 },
      subtype: 'renewalInvitation',
      triggerNoticeId: notice.id,
      type: 'notification'
    })

    expect(result.notifications).toHaveLength(1)
    expect(result.notifications[0]).toMatchObject({
      contactType: 'licence holder',
      dueDate: null,
      eventId: result.notice.id,
      licences: recipient.licence_refs,
      licenceMonitoringStationId: null,
      messageType: 'letter',
      messageRef: 'renewal invitation',
      pdf: null,
      personalisation: {
        address_line_1: 'Renewal licence holder',
        address_line_2: '4',
        address_line_3: 'Privet Drive',
        address_line_4: 'Little Whinging',
        address_line_5: 'Surrey',
        address_line_6: 'WD25 7LR',
        expiryDate: '28 April 2026',
        licenceRef: notice.licences[0],
        name: 'Renewal licence holder',
        renewalDate: '28 January 2026'
      },
      recipient: null,
      returnLogIds: null,
      status: 'pending',
      templateId: NOTIFY_TEMPLATES.renewalInvitations.standard.letter['single licence']
    })

    // We record this here to allow us to clean up in the afterEach()
    notificationId = result.notifications[0].id
  })
})
