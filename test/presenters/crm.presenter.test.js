'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../app/lib/general.lib.js')

// Thing under test
const CRMPresenter = require('../../app/presenters/crm.presenter.js')

describe('CRM presenter', () => {
  describe('#formatContact()', () => {
    const billingQueryId = generateUUID()

    let billingQueryArgs

    describe('When there is a contact with the type', () => {
      let contact

      describe('"abstraction-alerts"', () => {
        beforeEach(() => {
          contact = {
            id: generateUUID(),
            contactType: 'abstraction-alerts',
            contactName: 'Rachael Tyrell'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).to.equal({
            link: `/system/company-contacts/${contact.id}/contact-details`,
            type: 'Abstraction alerts',
            name: 'Rachael Tyrell'
          })
        })
      })

      describe('"additional-contact"', () => {
        beforeEach(() => {
          contact = {
            id: generateUUID(),
            contactType: 'additional-contact',
            contactName: 'Rachael Tyrell'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).to.equal({
            link: `/system/company-contacts/${contact.id}/contact-details`,
            type: 'Additional contact',
            name: 'Rachael Tyrell'
          })
        })
      })

      describe('"billing"', () => {
        beforeEach(() => {
          billingQueryArgs = {
            'company-id': billingQueryId
          }

          contact = {
            id: generateUUID(),
            contactType: 'billing',
            contactName: 'Rachael Tyrell'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact, billingQueryArgs)

          expect(result).to.equal({
            link: `/system/billing-accounts/${contact.id}?company-id=${billingQueryId}`,
            type: 'Billing',
            name: 'Rachael Tyrell'
          })
        })
      })

      describe('"basic-user"', () => {
        beforeEach(() => {
          contact = {
            id: generateUUID(),
            contactType: 'basic-user',
            contactName: 'user@test.com'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).to.equal({
            link: `/system/users/external/${contact.id}`,
            type: 'Basic user',
            name: 'user@test.com'
          })
        })
      })

      describe('"primary-user"', () => {
        beforeEach(() => {
          contact = {
            id: generateUUID(),
            contactType: 'primary-user',
            contactName: 'user@test.com'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).to.equal({
            link: `/system/users/external/${contact.id}`,
            type: 'Primary user',
            name: 'user@test.com'
          })
        })
      })

      describe('"returns-user"', () => {
        beforeEach(() => {
          contact = {
            id: generateUUID(),
            contactType: 'returns-user',
            contactName: 'user@test.com'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).to.equal({
            link: `/system/users/external/${contact.id}`,
            type: 'Returns user',
            name: 'user@test.com'
          })
        })
      })

      describe('"licence-holder"', () => {
        beforeEach(() => {
          billingQueryArgs = {
            'licence-id': billingQueryId
          }

          contact = {
            id: generateUUID(),
            contactType: 'licence-holder',
            contactName: 'Rachael Tyrell'
          }
        })

        describe('and it does not have an "addressId" property', () => {
          it('returns the correct contact', () => {
            const result = CRMPresenter.formatContact(contact, billingQueryArgs)

            expect(result).to.equal({
              link: `/system/companies/${contact.id}/licence-holder`,
              type: 'Licence holder',
              name: 'Rachael Tyrell'
            })
          })
        })

        describe('and it does have an "addressId" property', () => {
          beforeEach(() => {
            contact.addressId = generateUUID()
          })

          it('returns the correct contact', () => {
            const result = CRMPresenter.formatContact(contact, billingQueryArgs)

            expect(result).to.equal({
              link: `/system/companies/${contact.id}/address/${contact.addressId}/licence-holder?licence-id=${billingQueryId}`,
              type: 'Licence holder',
              name: 'Rachael Tyrell'
            })
          })
        })
      })

      describe('"returns-to"', () => {
        beforeEach(() => {
          billingQueryArgs = {
            'licence-id': billingQueryId
          }

          contact = {
            id: generateUUID(),
            contactType: 'returns-to',
            contactName: 'Rachael Tyrell'
          }
        })

        describe('and it does not have an "addressId" property', () => {
          it('returns the correct contact', () => {
            const result = CRMPresenter.formatContact(contact, billingQueryArgs)

            expect(result).to.equal({
              link: `/system/companies/${contact.id}/returns-to`,
              type: 'Returns to',
              name: 'Rachael Tyrell'
            })
          })
        })

        describe('and it does have an "addressId" property', () => {
          beforeEach(() => {
            contact.addressId = generateUUID()
          })

          it('returns the correct contact', () => {
            const result = CRMPresenter.formatContact(contact, billingQueryArgs)

            expect(result).to.equal({
              link: `/system/companies/${contact.id}/address/${contact.addressId}/returns-to?licence-id=${billingQueryId}`,
              type: 'Returns to',
              name: 'Rachael Tyrell'
            })
          })
        })
      })
    })
  })
})
