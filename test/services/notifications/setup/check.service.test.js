'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const RecipientsService = require('../../../../app/services/notifications/setup/fetch-recipients.service.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const CheckService = require('../../../../app/services/notifications/setup/check.service.js')

describe('Notifications Setup - Check service', () => {
  let removeLicences
  let session
  let testRecipients

  beforeEach(async () => {
    removeLicences = ''

    session = await SessionHelper.add({
      data: { returnsPeriod: 'quarterFour', removeLicences, journey: 'invitations', referenceCode: 'RINV-123' }
    })

    testRecipients = RecipientsFixture.recipients()

    Sinon.stub(RecipientsService, 'go').resolves([testRecipients.primaryUser])
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly presents the data', async () => {
    const result = await CheckService.go(session.id)

    expect(result).to.equal({
      activeNavBar: 'manage',
      defaultPageSize: 25,
      links: {
        back: `/system/notifications/setup/${session.id}/returns-period`,
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

  it('correctly persists the data to the session', async () => {
    await CheckService.go(session.id)

    const refreshedSession = await session.$query()

    expect(refreshedSession).to.equal({
      createdAt: session.createdAt,
      data: {
        journey: 'invitations',
        recipients: [
          {
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            email: 'primary.user@important.com',
            licence_refs: testRecipients.primaryUser.licence_refs,
            message_type: 'Email'
          }
        ],
        referenceCode: 'RINV-123',
        removeLicences: '',
        returnsPeriod: 'quarterFour'
      },
      id: session.id,
      journey: 'invitations',
      recipients: [
        {
          contact: null,
          contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
          contact_type: 'Primary user',
          email: 'primary.user@important.com',
          licence_refs: testRecipients.primaryUser.licence_refs,
          message_type: 'Email'
        }
      ],
      referenceCode: 'RINV-123',
      removeLicences: '',
      returnsPeriod: 'quarterFour',
      updatedAt: session.updatedAt
    })
  })
})
