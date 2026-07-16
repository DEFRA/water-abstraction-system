// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import LicenceFixture from '../support/fixtures/licence.fixture.js'
import { generateUUID } from '../support/generators.js'

// Thing under test
import * as CRMPresenter from '../../app/presenters/crm.presenter.js'

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
            id: generateUUID(),
            contactType: 'abstraction-alerts',
            contactName: 'Rachael Tyrell'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).toEqual({
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

          expect(result).toEqual({
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

          expect(result).toEqual({
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

          expect(result).toEqual({
            link: `/system/users/external/${contact.id}/details?back=search`,
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

          expect(result).toEqual({
            link: `/system/users/external/${contact.id}/details?back=search`,
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

          expect(result).toEqual({
            link: `/system/users/external/${contact.id}/details?back=search`,
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

            expect(result).toEqual({
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

            expect(result).toEqual({
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

            expect(result).toEqual({
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

            expect(result).toEqual({
              link: `/system/companies/${contact.id}/address/${contact.addressId}/returns-to?licence-id=${billingQueryId}`,
              type: 'Returns to',
              name: 'Rachael Tyrell'
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
