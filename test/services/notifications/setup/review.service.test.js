'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const RecipientsService = require('../../../../app/services/notifications/setup/fetch-recipients.service.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ReviewService = require('../../../../app/services/notifications/setup/review.service.js')

describe('Notifications Setup - Review service', () => {
  const year = 2025

  let clock
  let session
  let testRecipients

  before(async () => {
    clock = Sinon.useFakeTimers(new Date(`${year}-01-01`))

    session = await SessionHelper.add({ data: { returnsPeriod: 'quarterFour' } })

    testRecipients = RecipientsFixture.recipients()

    Sinon.stub(RecipientsService, 'go').resolves([
      {
        ...testRecipients.primaryUser,
        message: 'Email - primary user'
      }
    ])
  })

  afterEach(() => {
    clock.restore()
  })

  it('correctly presents the data', async () => {
    const result = await ReviewService.go(session.id)

    expect(result).to.equal({
      activeNavBar: 'manage',
      defaultPageSize: 25,
      pageTitle: 'Send returns invitations',
      page: 1,
      pagination: {
        numberOfPages: 1
      },
      recipients: [
        {
          contact: ['primary.user@important.com'],
          licences: [`${testRecipients.primaryUser.licence_refs}`],
          method: 'Email - primary user'
        }
      ],
      recipientsAmount: 1
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
