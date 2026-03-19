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

// Thing under test
const DeleteCompanyContactService = require('../../../app/services/company-contacts/delete-company-contact.service.js')

describe('Company contact - Delete company contact service', () => {
  let clock
  let companyContact
  let notified
  let today

  beforeEach(async () => {
    companyContact = await CompanyContactHelper.add()

    today = new Date('2020-06-06')

    clock = Sinon.useFakeTimers(today)
  })

  afterEach(async () => {
    clock.restore()

    await companyContact.$query().delete()
  })

  describe('when the company contact been notified', () => {
    beforeEach(() => {
      notified = true
    })

    it('soft deletes the company contact', async () => {
      await DeleteCompanyContactService.go(companyContact.id, notified)

      const exists = await CompanyContactModel.query().findById(companyContact.id)

      expect(exists).to.equal({
        ...companyContact,
        deletedAt: today
      })
    })
  })

  describe('when the company contact has not been notified', () => {
    beforeEach(() => {
      notified = false
    })

    it('deletes the company contact', async () => {
      await DeleteCompanyContactService.go(companyContact.id, notified)

      const exists = await CompanyContactModel.query().findById(companyContact.id)

      expect(exists).to.be.undefined()
    })
  })
})
