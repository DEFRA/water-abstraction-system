'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventModel = require('../../../../app/models/event.model.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Thing under test
const CreateNoticeService = require('../../../../app/services/notices/setup/create-notice.service.js')

describe('Notices - Setup - Create Notice service', () => {
  const issuer = 'hello@world.com'

  let recipients
  let session

  beforeEach(() => {
    const fixtureData = RecipientsFixture.recipients()

    recipients = [fixtureData.primaryUser, fixtureData.returnsAgent]

    session = {
      returnsPeriod: 'quarterFour',
      removeLicences: [],
      journey: 'invitations',
      referenceCode: generateReferenceCode(),
      determinedReturnsPeriod: {
        dueDate: new Date(`2025-07-28`),
        endDate: new Date(`2025-06-30`),
        startDate: new Date(`2025-04-01`),
        summer: 'true'
      },
      subType: 'returnInvitation',
      name: 'Returns: invitation'
    }
  })

  it('creates the notice', async () => {
    const result = await CreateNoticeService.go(session, recipients, issuer)

    expect(result).to.be.instanceOf(EventModel)
    expect(result).equal(
      {
        issuer: 'hello@world.com',
        licences: [...recipients[0].licence_refs, ...recipients[1].licence_refs],
        metadata: {
          name: 'Returns: invitation',
          recipients: 2,
          options: { excludeLicences: [] },
          returnCycle: {
            dueDate: '2025-07-28',
            endDate: '2025-06-30',
            startDate: '2025-04-01',
            isSummer: true
          }
        },
        overallStatus: 'pending',
        referenceCode: session.referenceCode,
        status: 'completed',
        statusCounts: { cancelled: 0, error: 0, pending: 2, returned: 0, sent: 0 },
        subtype: 'returnInvitation',
        type: 'notification'
      },
      {
        skip: ['createdAt', 'id', 'updatedAt']
      }
    )
  })
})
