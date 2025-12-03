'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../../support/helpers/event.helper.js')
const NoticesFixture = require('../../../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../../../fixtures/notifications.fixture.js')
const NotificationHelper = require('../../../../support/helpers/notification.helper.js')
const { today } = require('../../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')

// Thing under test
const FetchFailedReturnsInvitationsService = require('../../../../../app/services/notices/setup/returns-notice/fetch-failed-returns-invitations.service.js')

describe('Notices - Setup - Returns Notice - Fetch Failed Returns Invitations service', () => {
  let failedInvitationAlternateSet
  let failedInvitationFirstRecipient
  let failedInvitationSecondRecipient
  let licences
  let returnsInvitationNotice
  let returnsInvitationNotificationSent

  describe('when there is a matching notice with multiple licences and return logs', () => {
    before(async () => {
      licences = [
        generateLicenceRef(),
        generateLicenceRef(),
        generateLicenceRef(),
        generateLicenceRef(),
        generateLicenceRef()
      ]
      returnsInvitationNotice = await EventHelper.add({
        ...NoticesFixture.returnsInvitation(),
        createdAt: new Date('2025-07-01T15:01:47.023Z'),
        issuer: 'billing.data@wrls.gov.uk'
      })

      failedInvitationFirstRecipient = await NotificationHelper.add({
        ...NotificationsFixture.returnsInvitationEmail(returnsInvitationNotice),
        createdAt: today(),
        licences: [licences[0], licences[1]],
        recipient: 'error@example.com',
        returnLogIds: ['18998ffd-feaf-4e24-b998-7e7af026ba14', 'c06708f5-195a-43b1-9f2e-d4f72ee7bd76'],
        status: 'error'
      })

      failedInvitationSecondRecipient = await NotificationHelper.add({
        ...NotificationsFixture.returnsInvitationEmail(returnsInvitationNotice),
        createdAt: today(),
        licences: [licences[1], licences[2]],
        recipient: 'error-duplicate-licence-ref@example.com',
        returnLogIds: [
          '0f760d21-0f05-49e7-b226-21ad02dd22b4',
          '6917b4bb-4b68-480f-ae19-3f525dc7c67b',
          'e6bc04bc-1899-4b3c-b733-6f4be6aa8e07'
        ],
        status: 'error'
      })

      failedInvitationAlternateSet = await NotificationHelper.add({
        ...NotificationsFixture.returnsInvitationEmail(returnsInvitationNotice),
        alternateNoticeId: 'db649e8c-d38d-4d7a-92ce-bc681c645124',
        createdAt: today(),
        licences: [licences[4]],
        recipient: 'already-processed@example.com',
        returnLogIds: ['38ed8bf6-2979-4e7a-83b8-77a46f1b64e6'],
        status: 'error'
      })

      returnsInvitationNotificationSent = await NotificationHelper.add({
        ...NotificationsFixture.returnsInvitationEmail(returnsInvitationNotice),
        createdAt: today(),
        licences: [licences[4]],
        recipient: 'already-processed@example.com',
        returnLogIds: ['38ed8bf6-2979-4e7a-83b8-77a46f1b64e6'],
        status: 'sent'
      })
    })

    after(async () => {
      await failedInvitationAlternateSet.$query().delete()
      await failedInvitationFirstRecipient.$query().delete()
      await failedInvitationSecondRecipient.$query().delete()
      await returnsInvitationNotice.$query().delete()
      await returnsInvitationNotificationSent.$query().delete()
    })

    it('returns an array of licence references and return log ids that have been depuplicated', async () => {
      const result = await FetchFailedReturnsInvitationsService.go(returnsInvitationNotice.id)

      expect(result).to.equal({
        failedLicenceRefs: [licences[0], licences[1], licences[2]],
        failedReturnIds: [
          '18998ffd-feaf-4e24-b998-7e7af026ba14',
          'c06708f5-195a-43b1-9f2e-d4f72ee7bd76',
          '0f760d21-0f05-49e7-b226-21ad02dd22b4',
          '6917b4bb-4b68-480f-ae19-3f525dc7c67b',
          'e6bc04bc-1899-4b3c-b733-6f4be6aa8e07'
        ]
      })
    })
  })

  describe('when the notice has no matching failed notifications', () => {
    it('returns an object with two empty arrays', async () => {
      const result = await FetchFailedReturnsInvitationsService.go('1f0e0086-7bc4-4ef2-a696-35ea1e79d224')

      expect(result).to.equal({
        failedLicenceRefs: [],
        failedReturnIds: []
      })
    })
  })
})
