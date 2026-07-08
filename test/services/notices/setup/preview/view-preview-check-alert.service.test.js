// Test framework dependencies

// Test helpers
import * as AbstractionAlertSessionDataFixture from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'
import * as RecipientsFixture from '../../../../support/fixtures/recipients.fixture.js'
import SessionModelStub from '../../../../support/stubs/session.stub.js'
import { generateNoticeReferenceCode } from '../../../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchAbstractionAlertRecipientsDal from '../../../../../app/dal/notices/setup/abstraction-alerts/fetch-abstraction-alert-recipients.dal.js'
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewPreviewCheckAlertService from '../../../../../app/services/notices/setup/preview/view-preview-check-alert.service.js'

describe('Notices - Setup - Preview - View Preview Check Alert service', () => {
  let licenceMonitoringStations
  let recipients
  let session
  let testRecipient
  let testRecipients

  beforeEach(() => {
    // Populate the session with abstraction alert data
    licenceMonitoringStations = AbstractionAlertSessionDataFixture.licenceMonitoringStations()

    const abstractionAlertSessionData = AbstractionAlertSessionDataFixture.get(licenceMonitoringStations)
    const sessionData = {
      ...abstractionAlertSessionData,
      alertThresholds: [
        licenceMonitoringStations.one.thresholdGroup,
        licenceMonitoringStations.two.thresholdGroup,
        licenceMonitoringStations.three.thresholdGroup
      ],
      referenceCode: generateNoticeReferenceCode('WAA-')
    }

    session = SessionModelStub(sessionData)

    // Create the recipients data
    recipients = RecipientsFixture.recipients()
    testRecipients = [recipients.primaryUser]
    // Assign the licence ref to the recipient of the alert to be displayed
    testRecipients[0].licence_refs = licenceMonitoringStations.two.licence.licenceRef
    testRecipient = testRecipients[0]

    vi.spyOn(FetchAbstractionAlertRecipientsDal, 'default').mockResolvedValue(testRecipients)
    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns the page data for the view', async () => {
      const result = await ViewPreviewCheckAlertService(testRecipient.contact_hash_id, session.id)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/check`,
          text: 'Back'
        },
        pageTitle: 'Check the recipient previews',
        pageTitleCaption: `Notice ${session.referenceCode}`,
        restrictionHeading: 'Flow restriction type and threshold',
        restrictions: [
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: `/system/notices/setup/${session.id}/preview/${testRecipient.contact_hash_id}/alert/${licenceMonitoringStations.two.id}`,
              text: 'Preview'
            },
            alert: '',
            alertDate: '',
            licenceId: licenceMonitoringStations.two.licence.id,
            licenceRef: licenceMonitoringStations.two.licence.licenceRef,
            restriction: 'Stop',
            restrictionCount: 1,
            threshold: '100m3/s'
          }
        ]
      })
    })
  })
})
