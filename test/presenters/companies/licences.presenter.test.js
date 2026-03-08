'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { yesterday } = require('../../support/general.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Thing under test
const LicencesPresenter = require('../../../app/presenters/companies/licences.presenter.js')

describe('Companies - Licences presenter', () => {
  let company
  let licences

  beforeEach(() => {
    company = CustomersFixtures.company()
    licences = [
      LicenceModel.fromJson({
        expiredDate: null,
        id: generateUUID(),
        lapsedDate: null,
        licenceRef: generateLicenceRef(),
        revokedDate: null,
        startDate: new Date('2022-01-01'),
        currentLicenceHolderId: company.id,
        currentLicenceHolder: company.name
      })
    ]
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = LicencesPresenter.go(company, licences)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        licences: [
          {
            currentLicenceHolder: {
              id: null,
              name: company.name
            },
            id: licences[0].id,
            licenceRef: licences[0].licenceRef,
            startDate: '1 January 2022',
            status: null
          }
        ],
        pageTitle: 'Licences',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })

  describe('the "licences" property', () => {
    describe('the "currentLicenceHolder" property', () => {
      describe('when the current licence holder for the licence is the selected company', () => {
        it('returns the selected company name and a null id', () => {
          const result = LicencesPresenter.go(company, licences)

          expect(result.licences[0].currentLicenceHolder).to.equal({
            id: null,
            name: company.name
          })
        })
      })

      describe('when the current licence holder for the licence is a different company', () => {
        beforeEach(() => {
          licences[0].currentLicenceHolderId = generateUUID()
          licences[0].currentLicenceHolder = 'Wallace Corporation'
        })

        it('returns the current licence holder name and id for the licence', () => {
          const result = LicencesPresenter.go(company, licences)

          expect(result.licences[0].currentLicenceHolder).to.equal({
            id: licences[0].currentLicenceHolderId,
            name: 'Wallace Corporation'
          })
        })
      })
    })

    describe('the "status" property', () => {
      describe('when the licence does not have an end date', () => {
        it('returns null', () => {
          const result = LicencesPresenter.go(company, licences)

          expect(result.licences[0].status).to.equal(null)
        })
      })

      describe('when the licence has an end date in the past', () => {
        beforeEach(() => {
          licences[0].expiredDate = yesterday()
        })

        it('returns the reason for the licence end', () => {
          const result = LicencesPresenter.go(company, licences)

          expect(result.licences[0].status).to.equal('expired')
        })
      })

      describe('when the licence has an end date in the future', () => {
        beforeEach(() => {
          licences[0].expiredDate = new Date('2049-01-01')
        })

        it('returns null', () => {
          const result = LicencesPresenter.go(company, licences)

          expect(result.licences[0].status).to.equal(null)
        })
      })
    })
  })
})
