'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyContactHelper = require('../../support/helpers/company-contact.helper.js')
const CompanyContactModel = require('../../../app/models/company-contact.model.js')
const EventHelper = require('../../support/helpers/event.helper.js')
const NoticesFixture = require('../../support/fixtures/notices.fixture.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const DeleteCompanyContactService = require('../../../app/services/company-contacts/delete-company-contact.service.js')

describe('Company contact - Delete company contact service', () => {
  let clock
  let companyContact
  let email
  let notice
  let notification
  let today

  beforeEach(async () => {
    companyContact = await CompanyContactHelper.add()

    today = new Date('2020-06-06')

    clock = Sinon.useFakeTimers(today)

    email = `${generateUUID()}@test.com`
  })

  afterEach(async () => {
    clock.restore()

    await companyContact.$query().delete()
    await notice.$query().delete()
    await notification.$query().delete()
  })

  describe('when the company contact has notifications', () => {
    beforeEach(async () => {
      notice = await EventHelper.add(NoticesFixture.returnsInvitation())

      notification = await NotificationHelper.add({
        ...NotificationsFixture.returnsInvitationEmail(notice),
        recipient: email
      })
    })

    it('soft deletes the company contact', async () => {
      await DeleteCompanyContactService.go(companyContact.id, email)

      const exists = await CompanyContactModel.query().findById(companyContact.id)

      expect(exists).to.equal({
        ...companyContact,
        deletedAt: today
      })
    })
  })

  describe('when the company contact does not have notifications', () => {
    it('deletes the company contact', async () => {
      await DeleteCompanyContactService.go(companyContact.id, email)

      const exists = await CompanyContactModel.query().findById(companyContact.id)

      expect(exists).to.be.undefined()
    })
  })
})
