'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const RecipientsService = require('../../../../app/services/notifications/setup/fetch-recipients.service.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const CheckService = require('../../../../app/services/notifications/setup/check.service.js')

describe('Notifications Setup - Review service', () => {
  let removeLicences
  let session
  let testRecipients

  before(async () => {
    removeLicences = ''

    session = await SessionHelper.add({
      data: { returnsPeriod: 'quarterFour', removeLicences, journey: 'invitations', referenceCode: 'RINV-123' }
    })

    testRecipients = RecipientsFixture.recipients()

    Sinon.stub(RecipientsService, 'go').resolves([testRecipients.primaryUser])
  })

  it('correctly presents the data', async () => {
    const result = await CheckService.go(session.id)

    expect(result).to.equal({
      activeNavBar: 'manage',
      defaultPageSize: 25,
      links: {
        cancel: `/system/notifications/setup/${session.id}/cancel`,
        download: `/system/notifications/setup/${session.id}/download`,
        removeLicences: `/system/notifications/setup/${session.id}/remove-licences`
      },
      page: 1,
      pagination: {
        numberOfPages: 1
      },
      pageTitle: 'Check the recipients',
      readyToSend: 'Returns invitations are ready to send.',
      recipients: [
        {
          contact: ['primary.user@important.com'],
          licences: [`${testRecipients.primaryUser.licence_refs}`],
          method: 'Email - Primary user'
        }
      ],
      recipientsAmount: 1,
      referenceCode: 'RINV-123'
    })
  })
})
