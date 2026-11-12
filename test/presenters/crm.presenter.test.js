// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { generateUUID } from 'water-abstraction-engine/test/generators.js'
import LicenceFixture from '../support/fixtures/licence.fixture.js'

// Thing under test
import * as CRMPresenter from '../../src/presenters/crm.presenter.js'

describe('CRM presenter', () => {
  describe('#abstractionAlertsLabel()', () => {
    describe('when "abstractionAlerts" is "yes"', () => {
      it('returns "Yes, for all licences"', () => {
        const result = CRMPresenter.abstractionAlertsLabel('yes')

        expect(result).toEqual('Yes, for all licences')
      })
    })

    describe('when "abstractionAlerts" is "some"', () => {
      it('returns "Yes, for some licences"', () => {
        const result = CRMPresenter.abstractionAlertsLabel('some')

        expect(result).toEqual('Yes, for some licences')
      })
    })

    describe('when "abstractionAlerts" is "no"', () => {
      it('returns "No"', () => {
        const result = CRMPresenter.abstractionAlertsLabel('no')

        expect(result).toEqual('No')
      })
    })
  })

  describe('#formatContact()', () => {
    const billingQueryId = generateUUID()

    let billingQueryArgs

    describe('When there is a contact with the type', () => {
      let contact

      describe('"abstraction-alerts"', () => {
        beforeEach(() => {
          contact = {
            contactName: 'Rachael Tyrell',
            contactType: 'abstraction-alerts',
            id: generateUUID()
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).toEqual({
            link: `/system/company-contacts/${contact.id}/contact-details`,
            name: 'Rachael Tyrell',
            type: 'Abstraction alerts'
          })
        })
      })

      describe('"additional-contact"', () => {
        beforeEach(() => {
          contact = {
            contactName: 'Rachael Tyrell',
            contactType: 'additional-contact',
            id: generateUUID()
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).toEqual({
            link: `/system/company-contacts/${contact.id}/contact-details`,
            name: 'Rachael Tyrell',
            type: 'Additional contact'
          })
        })
      })

      describe('"billing"', () => {
        beforeEach(() => {
          billingQueryArgs = {
            'company-id': billingQueryId
          }

          contact = {
            contactName: 'Rachael Tyrell',
            contactType: 'billing',
            id: generateUUID()
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact, billingQueryArgs)

          expect(result).toEqual({
            link: `/system/billing-accounts/${contact.id}?company-id=${billingQueryId}`,
            name: 'Rachael Tyrell',
            type: 'Billing'
          })
        })
      })

      describe('"basic-user"', () => {
        beforeEach(() => {
          contact = {
            contactName: 'user@test.com',
            contactType: 'basic-user',
            id: generateUUID()
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).toEqual({
            link: `/system/users/external/${contact.id}/details?back=search`,
            name: 'user@test.com',
            type: 'Basic user'
          })
        })
      })

      describe('"primary-user"', () => {
        beforeEach(() => {
          contact = {
            contactName: 'user@test.com',
            contactType: 'primary-user',
            id: generateUUID()
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).toEqual({
            link: `/system/users/external/${contact.id}/details?back=search`,
            name: 'user@test.com',
            type: 'Primary user'
          })
        })
      })

      describe('"returns-user"', () => {
        beforeEach(() => {
          contact = {
            contactName: 'user@test.com',
            contactType: 'returns-user',
            id: generateUUID()
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).toEqual({
            link: `/system/users/external/${contact.id}/details?back=search`,
            name: 'user@test.com',
            type: 'Returns user'
          })
        })
      })

      describe('"licence-holder"', () => {
        beforeEach(() => {
          billingQueryArgs = {
            'licence-id': billingQueryId
          }

          contact = {
            contactName: 'Rachael Tyrell',
            contactType: 'licence-holder',
            id: generateUUID()
          }
        })

        describe('and it does not have an "addressId" property', () => {
          it('returns the correct contact', () => {
            const result = CRMPresenter.formatContact(contact, billingQueryArgs)

            expect(result).toEqual({
              link: `/system/companies/${contact.id}/licence-holder`,
              name: 'Rachael Tyrell',
              type: 'Licence holder'
            })
          })
        })

        describe('and it does have an "addressId" property', () => {
          beforeEach(() => {
            contact.addressId = generateUUID()
          })

          it('returns the correct contact', () => {
            const result = CRMPresenter.formatContact(contact, billingQueryArgs)

            expect(result).toEqual({
              link: `/system/companies/${contact.id}/address/${contact.addressId}/licence-holder?licence-id=${billingQueryId}`,
              name: 'Rachael Tyrell',
              type: 'Licence holder'
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
            contactName: 'Rachael Tyrell',
            contactType: 'returns-to',
            id: generateUUID()
          }
        })

        describe('and it does not have an "addressId" property', () => {
          it('returns the correct contact', () => {
            const result = CRMPresenter.formatContact(contact, billingQueryArgs)

            expect(result).toEqual({
              link: `/system/companies/${contact.id}/returns-to`,
              name: 'Rachael Tyrell',
              type: 'Returns to'
            })
          })
        })

        describe('and it does have an "addressId" property', () => {
          beforeEach(() => {
            contact.addressId = generateUUID()
          })

          it('returns the correct contact', () => {
            const result = CRMPresenter.formatContact(contact, billingQueryArgs)

            expect(result).toEqual({
              link: `/system/companies/${contact.id}/address/${contact.addressId}/returns-to?licence-id=${billingQueryId}`,
              name: 'Rachael Tyrell',
              type: 'Returns to'
            })
          })
        })
      })
    })
  })

  describe('#selectedLiveLicences()', () => {
    let liveLicences
    let noticeSetting
    let selectedLicences

    beforeEach(() => {
      selectedLicences = []
    })

    describe('when there are "liveLicences"', () => {
      beforeEach(() => {
        liveLicences = [LicenceFixture.licence()]
      })

      describe('and the user is set to receive "some" notices', () => {
        beforeEach(() => {
          noticeSetting = 'some'
        })

        it('returns an empty array', () => {
          const result = CRMPresenter.selectedLiveLicences(liveLicences, selectedLicences, noticeSetting)

          expect(result).toHaveLength(0)
        })

        describe('and there are existing "selectedLicences"', () => {
          describe('that match the "liveLicences"', () => {
            beforeEach(() => {
              selectedLicences = [liveLicences[0].id]
            })

            it('returns the matching licence references', () => {
              const result = CRMPresenter.selectedLiveLicences(liveLicences, selectedLicences, noticeSetting)

              expect(result).toEqual([liveLicences[0].licenceRef])
            })
          })

          describe('that do not match the "liveLicences"', () => {
            beforeEach(() => {
              selectedLicences = [generateUUID()]
            })

            it('returns the matching licence references (none)', () => {
              const result = CRMPresenter.selectedLiveLicences(liveLicences, selectedLicences, noticeSetting)

              expect(result).toEqual([])
            })
          })
        })
      })

      describe('and the user is set to receive something other than "some" notices', () => {
        beforeEach(() => {
          noticeSetting = 'yes'
        })

        it('returns an empty array', () => {
          const result = CRMPresenter.selectedLiveLicences(liveLicences, selectedLicences, noticeSetting)

          expect(result).toHaveLength(0)
        })
      })
    })

    describe('when there are no "liveLicences"', () => {
      beforeEach(() => {
        liveLicences = []
      })

      describe('and the user is set to receive "some" notices', () => {
        beforeEach(() => {
          noticeSetting = 'some'
        })

        it('returns an empty array', () => {
          const result = CRMPresenter.selectedLiveLicences(liveLicences, selectedLicences, noticeSetting)

          expect(result).toHaveLength(0)
        })

        describe('and there are existing "selectedLicences"', () => {
          beforeEach(() => {
            selectedLicences = [generateUUID()]
          })

          it('returns an empty array', () => {
            const result = CRMPresenter.selectedLiveLicences(liveLicences, selectedLicences, noticeSetting)

            expect(result).toHaveLength(0)
          })
        })
      })

      describe('and the user is set to receive something other than "some" notices', () => {
        beforeEach(() => {
          noticeSetting = 'yes'
        })

        it('returns an empty array', () => {
          const result = CRMPresenter.selectedLiveLicences(liveLicences, selectedLicences, noticeSetting)

          expect(result).toHaveLength(0)
        })
      })
    })
  })
})
