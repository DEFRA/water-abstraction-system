'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, before } = (exports.lab = Lab.script())
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

    Sinon.stub(RecipientsService, 'go').resolves([testRecipients.primaryUser])
  })

  afterEach(() => {
    clock.restore()
  })

  it('correctly presents the data', async () => {
    const result = await ReviewService.go(session.id)

    expect(result).to.equal({
      activeNavBar: 'manage',
      defaultPageSize: 25,
      links: {
        download: `/system/notifications/setup/${session.id}/download`,
        removeLicences: `/system/notifications/setup/${session.id}/remove-licences`
      },
      pageTitle: 'Send returns invitations',
      page: 1,
      pagination: {
        numberOfPages: 1
      },
      recipients: [
        {
          contact: ['primary.user@important.com'],
          licences: [`${testRecipients.primaryUser.licence_refs}`],
          method: 'Email - Primary user'
        }
      ],
      recipientsAmount: 1
    })
  })
})
