'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const FetchAbstractionAlertRecipientsService = require('../../../../app/services/notices/setup/fetch-abstraction-alert-recipients.service.js')
const FetchRecipientsService = require('../../../../app/services/notices/setup/fetch-recipients.service.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const CheckService = require('../../../../app/services/notices/setup/check.service.js')

describe('Notices - Setup - Check service', () => {
  let removeLicences
  let session
  let testRecipients

  beforeEach(async () => {
    removeLicences = ''

    session = await SessionHelper.add({
      data: { returnsPeriod: 'quarterFour', removeLicences, journey: 'invitations', referenceCode: 'RINV-123' }
    })

    testRecipients = RecipientsFixture.recipients()

    Sinon.stub(FetchRecipientsService, 'go').resolves([testRecipients.primaryUser])
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
        back: `/system/notices/setup/${session.id}/returns-period`,
        cancel: `/system/notices/setup/${session.id}/cancel`,
        download: `/system/notices/setup/${session.id}/download`,
        removeLicences: `/system/notices/setup/${session.id}/remove-licences`
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
          method: 'Email - Primary user',
          previewLink: `/system/notices/setup/${session.id}/preview/${testRecipients.primaryUser.contact_hash_id}`
        }
      ],
      recipientsAmount: 1,
      referenceCode: 'RINV-123'
    })
  })

  describe('when the journey is "abstraction-alert"', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({
        data: { journey: 'abstraction-alert', referenceCode: 'WAA-123', monitoringStationId: '456' }
      })

      testRecipients = RecipientsFixture.alertsRecipients()

      Sinon.stub(FetchAbstractionAlertRecipientsService, 'go').resolves([testRecipients.additionalContact])
    })

    it('correctly presents the data', async () => {
      const result = await CheckService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        defaultPageSize: 25,
        links: {
          back: `/system/notices/setup/${session.id}/abstraction-alerts/alert-email-address`,
          cancel: `/system/notices/setup/${session.id}/cancel`,
          download: `/system/notices/setup/${session.id}/download`,
          removeLicences: ``
        },
        page: 1,
        pagination: {
          numberOfPages: 1
        },
        pageTitle: 'Check the recipients',
        readyToSend: 'Abstraction alerts are ready to send.',
        recipients: [
          {
            contact: ['additional.contact@important.com'],
            licences: [`${testRecipients.additionalContact.licence_refs}`],
            method: 'Email - Additional contact',
            previewLink: `/system/notices/setup/${session.id}/preview/${testRecipients.additionalContact.contact_hash_id}`
          }
        ],
        recipientsAmount: 1,
        referenceCode: 'WAA-123'
      })
    })
  })
})
