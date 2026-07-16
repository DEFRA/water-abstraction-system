// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import { generateLicenceRef, generateUUID } from '../../../support/generators.js'

// Thing under test
import LicencesPresenter from '../../../../app/presenters/company-contacts/setup/licences.presenter.js'

describe('Company Contacts - Setup - Licences Presenter', () => {
  let company
  let licence
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()

    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    session = { id: generateUUID(), company, licences: [licence] }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = LicencesPresenter(session)

      expect(result).toEqual({
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/abstraction-alerts`,
          text: 'Back'
        },
        licences: [
          {
            checked: false,
            text: licence.licenceRef,
            value: licence.id
          }
        ],
        pageTitle: 'Select the licences they should get water abstraction alerts emails for',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('the "licences" property', () => {
      describe('when there are existing "abstractionAlertLicences"', () => {
        beforeEach(() => {
          session.abstractionAlertLicences = [licence.id]
        })

        it('returns the matching licence as checked', () => {
          const result = LicencesPresenter(session)

          expect(result.licences).toEqual([
            {
              checked: true,
              text: licence.licenceRef,
              value: licence.id
            }
          ])
        })
      })
    })
  })
})
