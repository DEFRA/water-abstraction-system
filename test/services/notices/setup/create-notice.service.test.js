// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import EventModel from 'water-abstraction-engine/models/event.model.js'
import RecipientsFixture from 'water-abstraction-engine/test/fixtures/recipients.fixture.js'
import { generateNoticeReferenceCode } from 'water-abstraction-engine/test/generators.js'

// Thing under test
import CreateNoticeService from '../../../../src/services/notices/setup/create-notice.service.js'

describe('Notices - Setup - Create Notice service', () => {
  const issuer = 'hello@world.com'

  let recipients
  let noticeData

  beforeEach(() => {
    const fixtureData = RecipientsFixture.recipients()

    recipients = [fixtureData.primaryUser, fixtureData.returnsUser]

    noticeData = {
      determinedReturnsPeriod: {
        dueDate: new Date(`2025-07-28`),
        endDate: new Date(`2025-06-30`),
        startDate: new Date(`2025-04-01`),
        summer: 'true'
      },
      journey: 'standard',
      name: 'Returns: invitation',
      noticeType: 'invitations',
      referenceCode: generateNoticeReferenceCode('RINV-'),
      removeLicences: [],
      returnsPeriod: 'quarterFour',
      subType: 'returnInvitation'
    }
  })

  it('creates the notice', async () => {
    const result = await CreateNoticeService(noticeData, recipients, issuer)

    expect(result).toBeInstanceOf(EventModel)
    expect(result).toMatchObject({
      issuer: 'hello@world.com',
      licences: [...recipients[0].licence_refs, ...recipients[1].licence_refs],
      metadata: {
        name: 'Returns: invitation',
        options: { excludeLicences: [] },
        recipients: 2,
        returnCycle: {
          dueDate: '2025-07-28',
          endDate: '2025-06-30',
          isSummer: true,
          startDate: '2025-04-01'
        }
      },
      overallStatus: 'pending',
      referenceCode: noticeData.referenceCode,
      status: 'completed',
      statusCounts: { cancelled: 0, error: 0, pending: 2, returned: 0, sent: 0 },
      subtype: 'returnInvitation',
      type: 'notification'
    })
  })
})
