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
const DetermineRecipientsService = require('../../../../app/services/notifications/setup/determine-recipients.service.js')
const RecipientsService = require('../../../../app/services/notifications/setup/fetch-recipients.service.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/notifications/setup/submit-check.service.js')

describe('Notifications Setup - Submit Check service', () => {
  let notifierStub
  let recipients
  let session

  beforeEach(async () => {
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    recipients = RecipientsFixture.recipients()

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

    recipients = RecipientsFixture.recipients()

    Sinon.stub(DetermineRecipientsService, 'go').returns([recipients.primaryUser])
    Sinon.stub(RecipientsService, 'go').resolves([recipients.primaryUser])
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  it('correctly triggers the "DetermineRecipientsService"', async () => {
    await SubmitCheckService.go(session.id)

    expect(DetermineRecipientsService.go.calledWith([recipients.primaryUser])).to.be.true()
  })

  it('should not throw an error', async () => {
    await SubmitCheckService.go(session.id)

    expect(notifierStub.omfg.called).to.be.false()
  })
})
