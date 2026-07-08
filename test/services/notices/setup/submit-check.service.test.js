// Test framework dependencies

// Test helpers
import * as NoticesFixture from '../../../support/fixtures/notices.fixture.js'
import * as NotificationsFixture from '../../../support/fixtures/notifications.fixture.js'
import * as RecipientsFixture from '../../../support/fixtures/recipients.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateLicenceRef } from '../../../support/helpers/licence.helper.js'
import { generateNoticeReferenceCode, generateUUID } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as CreateNoticeService from '../../../../app/services/notices/setup/create-notice.service.js'
import * as CreateNotificationsService from '../../../../app/services/notices/setup/create-notifications.service.js'
import * as DeleteSessionDal from '../../../../app/dal/delete-session.dal.js'
import * as FetchRecipientsService from '../../../../app/services/notices/setup/fetch-recipients.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'
import * as SendNoticeService from '../../../../app/services/notices/setup/send/send-notice.service.js'

// Thing under test
import SubmitCheckService from '../../../../app/services/notices/setup/submit-check.service.js'

describe('Notices - Setup - Submit Check service', () => {
  const auth = {
    credentials: {
      user: {
        username: 'hello@world.com'
      }
    }
  }
  let recipients
  let referenceCode
  let session
  let sessionData

  beforeEach(() => {
    const fixtureData = RecipientsFixture.recipients()
    const sessionId = generateUUID()
    const licenceRef = generateLicenceRef()
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

    recipients = [
      {
        ...fixtureData.primaryUser,
        licence_refs: [licenceRef],
        return_log_ids: [dueReturns[0].returnLogId]
      }
    ]
    vi.spyOn(FetchRecipientsService, 'default').mockResolvedValue(recipients)

    referenceCode = generateNoticeReferenceCode('RINV-')

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
      selectedRecipients: [...recipients[0].contact_hash_id],
      subType: 'returnInvitation'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    vi.spyOn(DeleteSessionDal, 'default').mockResolvedValue()

    const notice = NoticesFixture.returnsInvitation()

    notice.referenceCode = session.referenceCode
    notice.metadata.recipients = 1
    vi.spyOn(CreateNoticeService, 'default').mockResolvedValue(notice)

    const notification = NotificationsFixture.returnsInvitationEmail(notice)

    vi.spyOn(CreateNotificationsService, 'default').mockResolvedValue([notification])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    beforeEach(() => {
      vi.spyOn(SendNoticeService, 'default').mockResolvedValue()
    })

    it('creates a notice record', async () => {
      await SubmitCheckService(session.id, auth)

      expect(CreateNoticeService.default).toHaveBeenCalled()
    })

    it('creates notification records', async () => {
      await SubmitCheckService(session.id, auth)

      expect(CreateNotificationsService.default).toHaveBeenCalled()
    })

    it('deletes the session record', async () => {
      await SubmitCheckService(session.id, auth)

      expect(DeleteSessionDal.default).toHaveBeenCalledWith(session.id)
    })

    it('sends the notice', async () => {
      await SubmitCheckService(session.id, auth)

      expect(SendNoticeService.default).toHaveBeenCalled()
    })
  })
})
