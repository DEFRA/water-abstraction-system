'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventModel = require('../../../../app/models/event.model.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const BatchNotificationsService = require('../../../../app/services/notifications/setup/batch-notifications.service.js')
const DetermineRecipientsService = require('../../../../app/services/notifications/setup/determine-recipients.service.js')
const RecipientsService = require('../../../../app/services/notifications/setup/fetch-recipients.service.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/notifications/setup/submit-check.service.js')

describe('Notifications Setup - Submit Check service', () => {
  let auth
  let notifierStub
  let referenceCode
  let session
  let recipients
  let testRecipients

  beforeEach(async () => {
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    referenceCode = `RINV-${Math.floor(1000 + Math.random() * 9000).toString()}`

    session = await SessionHelper.add({
      data: {
        journey: 'invitations',
        referenceCode,
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

    testRecipients = [recipients.primaryUser]

    Sinon.stub(BatchNotificationsService, 'go').resolves({ sent: 1, error: 0 })
    Sinon.stub(DetermineRecipientsService, 'go').returns(testRecipients)
    Sinon.stub(RecipientsService, 'go').resolves(testRecipients)
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  it('correctly returns the event id', async () => {
    const result = await SubmitCheckService.go(session.id, auth)

    const event = await EventModel.query().where('reference_code', referenceCode).first()

    expect(result).to.equal(event.id)
  })

  it('should call the batch notification service', async () => {
    const result = await SubmitCheckService.go(session.id, auth)

    expect(
      BatchNotificationsService.go.calledWith(
        testRecipients,
        session.data.determinedReturnsPeriod,
        referenceCode,
        session.data.journey,
        result
      )
    ).to.be.true()
  })

  it('should not throw an error', async () => {
    await SubmitCheckService.go(session.id, auth)

    expect(notifierStub.omfg.called).to.be.false()
  })
})
