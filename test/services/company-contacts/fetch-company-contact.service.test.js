'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, after, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyContactHelper = require('../../support/helpers/company-contact.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')

// Thing under test
const FetchCompanyContactService = require('../../../app/services/company-contacts/fetch-company-contact.service.js')

describe('Company Contacts - Fetch Company Contact service', () => {
  let additionalCompanyContact
  let companyContact
  let contact

  before(async () => {
    contact = await ContactHelper.add()
  })

  afterEach(async () => {
    await companyContact.$query().delete()

    if (additionalCompanyContact) {
      await additionalCompanyContact.$query().delete()
    }
  })

  after(async () => {
    await contact.$query().delete()
  })

  describe('when there is a company contact', () => {
    describe('and it is the only "additional contact" for the company', () => {
      describe('and it is not marked for "abstractionAlerts"', () => {
        beforeEach(async () => {
          companyContact = await CompanyContactHelper.add({
            abstractionAlerts: false,
            contactId: contact.id
          })
        })

        it('returns the matching company contact with "abstractionAlertsCount" as 0', async () => {
          const result = await FetchCompanyContactService.go(companyContact.id)

          expect(result).to.equal(_transformToFetchResult(companyContact, contact, 0))
        })
      })

      describe('and it is marked for "abstractionAlerts"', () => {
        beforeEach(async () => {
          companyContact = await CompanyContactHelper.add({
            abstractionAlerts: true,
            contactId: contact.id
          })
        })

        it('returns the matching company contact with "abstractionAlertsCount" as 1', async () => {
          const result = await FetchCompanyContactService.go(companyContact.id)

          expect(result).to.equal(_transformToFetchResult(companyContact, contact, 1))
        })
      })
    })

    describe('and there are other "additional contacts" for the company', () => {
      describe('when it is not marked for "abstractionAlerts"', () => {
        beforeEach(async () => {
          companyContact = await CompanyContactHelper.add({
            contactId: contact.id
          })
        })

        describe('and nor are the other contacts', () => {
          beforeEach(async () => {
            additionalCompanyContact = await CompanyContactHelper.add({
              abstractionAlerts: false,
              companyId: companyContact.companyId,
              contactId: contact.id
            })
          })

          it('returns the matching company contact with "abstractionAlertsCount" as 0', async () => {
            const result = await FetchCompanyContactService.go(companyContact.id)

            expect(result).to.equal(_transformToFetchResult(companyContact, contact, 0))
          })
        })

        describe('but the other contacts are', () => {
          beforeEach(async () => {
            additionalCompanyContact = await CompanyContactHelper.add({
              abstractionAlerts: true,
              companyId: companyContact.companyId,
              contactId: contact.id
            })
          })

          it('returns the matching company contact with "abstractionAlertsCount" as 1', async () => {
            const result = await FetchCompanyContactService.go(companyContact.id)

            expect(result).to.equal(_transformToFetchResult(companyContact, contact, 1))
          })
        })
      })
    })
  })
})

function _transformToFetchResult(companyContact, contact, abstractionAlertsCount = 0) {
  return {
    id: companyContact.id,
    abstractionAlerts: companyContact.abstractionAlerts,
    abstractionAlertsCount,
    companyId: companyContact.companyId,
    contact: {
      id: contact.id,
      salutation: null,
      firstName: 'Amara',
      middleInitials: null,
      lastName: 'Gupta',
      initials: null,
      contactType: 'person',
      suffix: null,
      department: null,
      email: 'amara.gupta@example.com'
    }
  }
}
