'use strict'

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const LicencesPresenter = require('../../../../app/presenters/company-contacts/setup/licences.presenter.js')

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
