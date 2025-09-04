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
const FetchAbstractionAlertRecipientsService = require('../../../../app/services/notices/setup/fetch-abstraction-alert-recipients.service.js')
const FetchReturnsRecipientsService = require('../../../../app/services/notices/setup/fetch-returns-recipients.service.js')

// Thing under test
const CheckService = require('../../../../app/services/notices/setup/check.service.js')

describe('Notices - Setup - Check service', () => {
  let removeLicences
  let session
  let testRecipients
  let yarStub

  beforeEach(async () => {
    removeLicences = ''

    session = await SessionHelper.add({
      data: {
        returnsPeriod: 'quarterFour',
        removeLicences,
        journey: 'standard',
        noticeType: 'invitations',
        referenceCode: 'RINV-123'
      }
    })

    testRecipients = RecipientsFixture.recipients()

    yarStub = { flash: Sinon.stub().returns([{ title: 'Test', text: 'Notification' }]) }

    Sinon.stub(FetchReturnsRecipientsService, 'go').resolves([testRecipients.primaryUser])
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly presents the data', async () => {
    const result = await CheckService.go(session.id, yarStub)

    expect(result).to.equal({
      activeNavBar: 'manage',
      backLink: {
        href: `/system/notices/setup/${session.id}/returns-period`,
        text: 'Back'
      },
      defaultPageSize: 25,
      links: {
        cancel: `/system/notices/setup/${session.id}/cancel`,
        download: `/system/notices/setup/${session.id}/download`,
        removeLicences: `/system/notices/setup/${session.id}/remove-licences`
      },
      notification: {
        text: 'Notification',
        title: 'Test'
      },
      page: 1,
      pagination: {
        numberOfPages: 1
      },
      pageTitle: 'Check the recipients',
      pageTitleCaption: 'Notice RINV-123',
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
      warning: null
    })
  })

  describe('the "selectedRecipients" property', () => {
    describe('when there are no "selectedRecipients"', () => {
      it('adds the "selectedRecipients" array to the session', async () => {
        await CheckService.go(session.id, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession).to.equal({
          ...session,
          data: {
            ...session.data,
            selectedRecipients: [testRecipients.primaryUser.contact_hash_id]
          },
          selectedRecipients: [testRecipients.primaryUser.contact_hash_id]
        })
      })
    })

    describe('when there are "selectedRecipients"', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({
          data: {
            returnsPeriod: 'quarterFour',
            removeLicences,
            journey: 'standard',
            noticeType: 'invitations',
            referenceCode: 'RINV-123',
            selectedRecipients: [testRecipients.primaryUser.contact_hash_id]
          }
        })
      })

      it('does not affect the "selectedRecipients"', async () => {
        await CheckService.go(session.id, yarStub)

        const refreshedSession = await session.$query()
        expect(refreshedSession).to.equal(session)
      })
    })
  })
  describe('when the journey is "alerts"', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({
        data: {
          journey: 'alerts',
          monitoringStationId: '456',
          noticeType: 'abstractionAlerts',
          referenceCode: 'WAA-123'
        }
      })

      testRecipients = RecipientsFixture.alertsRecipients()

      Sinon.stub(FetchAbstractionAlertRecipientsService, 'go').resolves([testRecipients.additionalContact])
    })

    it('correctly presents the data', async () => {
      const result = await CheckService.go(session.id, yarStub)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: {
          href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-email-address`,
          text: 'Back'
        },
        defaultPageSize: 25,
        links: {
          cancel: `/system/notices/setup/${session.id}/cancel`,
          download: `/system/notices/setup/${session.id}/download`
        },
        notification: {
          text: 'Notification',
          title: 'Test'
        },
        page: 1,
        pagination: {
          numberOfPages: 1
        },
        pageTitle: 'Check the recipients',
        pageTitleCaption: 'Notice WAA-123',
        readyToSend: 'Abstraction alerts are ready to send.',
        recipients: [
          {
            contact: ['additional.contact@important.com'],
            licences: [`${testRecipients.additionalContact.licence_refs}`],
            method: 'Email - Additional contact',
            previewLink: `/system/notices/setup/${session.id}/preview/${testRecipients.additionalContact.contact_hash_id}/check-alert`
          }
        ],
        recipientsAmount: 1,
        warning: null
      })
    })
  })
})
