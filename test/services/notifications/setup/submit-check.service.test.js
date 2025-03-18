'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const BatchNotificationsService = require('../../../../app/services/notifications/setup/batch-notifications.service.js')
const CreateEventService = require('../../../../app/services/notifications/setup/create-event.service.js')
const DetermineRecipientsService = require('../../../../app/services/notifications/setup/determine-recipients.service.js')
const RecipientsService = require('../../../../app/services/notifications/setup/fetch-recipients.service.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/notifications/setup/submit-check.service.js')

describe('Notifications Setup - Submit Check service', () => {
  const eventId = 'c1cae668-3dad-4806-94e2-eb3f27222ed9'

  let auth
  let notifierStub
  let recipients
  let session
  let testRecipients

  beforeEach(async () => {
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    recipients = RecipientsFixture.recipients()

    testRecipients = [recipients.primaryUser]

    session = await SessionHelper.add({
      data: {
        journey: 'invitations',
        referenceCode: 'RINV-123',
        returnsPeriod: 'quarterFour',
        determinedReturnsPeriod: {
          name: 'allYear',
          dueDate: '2025-04-28',
          endDate: '2023-03-31',
          summer: 'false',
          startDate: '2022-04-01'
        }
      }
    })

    auth = {
      credentials: {
        user: {
          username: 'hello@world.com'
        }
      }
    }

    recipients = RecipientsFixture.recipients()

    Sinon.stub(BatchNotificationsService, 'go').resolves({ sent: 1, error: 0 })
    Sinon.stub(CreateEventService, 'go').resolves({ id: eventId })
    Sinon.stub(DetermineRecipientsService, 'go').returns(testRecipients)
    Sinon.stub(RecipientsService, 'go').resolves(testRecipients)
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  it('correctly returns the event id ', async () => {
    const result = await SubmitCheckService.go(session.id, auth)

    expect(result).to.equal(eventId)
  })

  it('correctly triggers the "DetermineRecipientsService"', async () => {
    await SubmitCheckService.go(session.id, auth)

    expect(DetermineRecipientsService.go.calledWith(testRecipients)).to.be.true()
  })

  it('correctly triggers the "CreateEventService"', async () => {
    await SubmitCheckService.go(session.id, auth)

    const expected = {
      issuer: 'hello@world.com',
      licences: `["${testRecipients[0].licence_refs}"]`,
      metadata: {
        name: 'Returns: invitation',
        options: {
          excludeLicences: []
        },
        recipients: 1,
        returnCycle: {
          dueDate: '2025-04-28',
          endDate: '2023-03-31',
          isSummer: false,
          startDate: '2022-04-01'
        }
      },
      referenceCode: 'RINV-123',
      status: 'completed',
      subtype: 'returnInvitation'
    }

    expect(CreateEventService.go.calledWith(expected)).to.be.true()
  })

  it('should not throw an error', async () => {
    await SubmitCheckService.go(session.id, auth)

    expect(notifierStub.omfg.called).to.be.false()
  })
})
