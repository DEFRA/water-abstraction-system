'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')

// Thing under test
const LicencesPresenter = require('../../../app/presenters/companies/licences.presenter.js')

describe('Companies - Licences presenter', () => {
  let company
  let licences

  beforeEach(() => {
    company = CustomersFixtures.company()
    licences = CustomersFixtures.licences()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = LicencesPresenter.go(company, licences)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        licenceVersions: [
          {
            count: 1,
            endDate: null,
            licenceId: licences[0].id,
            licenceRef: licences[0].licenceRef,
            link: {
              hiddenText: 'current licence version',
              href: `/system/licence-versions/${licences[0].licenceVersions[0].id}`
            },
            startDate: '1 January 2022',
            status: 'current'
          }
        ],
        pageTitle: 'Licences',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('the "licenceVersions" property', () => {
      describe('when the licence', () => {
        describe('does not have any end date details', () => {
          it('returns the "status" as "current"', () => {
            const result = LicencesPresenter.go(company, licences)

            expect(result.licenceVersions[0].status).to.equal('current')
          })
        })

        describe('has an end date end date detail', () => {
          beforeEach(() => {
            licences[0].revokedDate = new Date('2022-01-01')
          })

          it('returns the "status" based on the reason', () => {
            const result = LicencesPresenter.go(company, licences)

            expect(result.licenceVersions[0].status).to.equal('revoked')
          })
        })
      })

      describe('when the licence version', () => {
        describe('does not have an end date', () => {
          it('returns "current licence version"', () => {
            const result = LicencesPresenter.go(company, licences)

            expect(result.licenceVersions[0].link).to.equal({
              hiddenText: 'current licence version',
              href: `/system/licence-versions/${licences[0].licenceVersions[0].id}`
            })
          })
        })

        describe('has an end date', () => {
          beforeEach(() => {
            licences[0].licenceVersions[0].endDate = new Date('2022-01-01')
          })

          it('returns "current licence version ending on X"', () => {
            const result = LicencesPresenter.go(company, licences)

            expect(result.licenceVersions[0].link).to.equal({
              hiddenText: 'licence version ending on 1 January 2022',
              href: `/system/licence-versions/${licences[0].licenceVersions[0].id}`
            })
          })
        })
      })
    })
  })
})
