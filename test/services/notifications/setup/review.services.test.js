'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const RecipientsService = require('../../../../app/services/notifications/setup/recipients.service.js')

// Thing under test
const ReviewService = require('../../../../app/services/notifications/setup/review.service.js')

describe('Notifications Setup - Review service', () => {
  let clock
  let session
  const year = 2025

  before(async () => {
    clock = Sinon.useFakeTimers(new Date(`${year}-01-01`))

    session = await SessionHelper.add({ data: { returnsPeriod: 'quarterFour' } })

    Sinon.stub(RecipientsService, 'go').resolves([])
  })

  afterEach(() => {
    clock.restore()
  })

  it('correctly presents the data', async () => {
    const result = await ReviewService.go(session.id)

    expect(result).to.equal({
      activeNavBar: 'manage',
      pageTitle: 'Send returns invitations',
      recipients: [],
      recipientsAmount: 0
    })
  })

  describe('when the returns period is not for summer', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({ data: { returnsPeriod: 'quarterFour' } })
    })

    it('should call the "ReviewService" with the returns period due date and summer "false"', async () => {
      await ReviewService.go(session.id)

      expect(RecipientsService.go.calledWith(new Date(`${year}-04-28`), 'false')).to.be.true()
    })
  })

  describe('when the returns period is for summer', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({ data: { returnsPeriod: 'summer' } })
    })

    it('should call the "ReviewService" with the returns period due date and summer "false"', async () => {
      await ReviewService.go(session.id)

      expect(RecipientsService.go.calledWith(new Date(`${year}-11-28`), 'true')).to.be.true()
    })
  })
})
