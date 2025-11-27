'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const BaseLicencesPresenter = require('../../../app/presenters/licences/base-licences.presenter.js')

describe('Licences - Base Licences presenter', () => {
  describe('#formatAbstractionAmounts()', () => {
    let licenceVersionPurpose

    describe('when the "licenceVersionPurpose" contains all abstraction amounts', () => {
      beforeEach(() => {
        licenceVersionPurpose = {
          annualQuantity: 109300000,
          dailyQuantity: 299452.05,
          hourlyQuantity: 47486,
          instantQuantity: 13190.976
        }
      })

      it('returns them formatted to two decimal places with their measure as an array', () => {
        const result = BaseLicencesPresenter.formatAbstractionAmounts(licenceVersionPurpose)

        expect(result).to.equal([
          '109,300,000.00 cubic metres per year',
          '299,452.05 cubic metres per day',
          '47,486.00 cubic metres per hour',
          '13,190.98 litres per second'
        ])
      })
    })

    describe('when the "licenceVersionPurpose" contains only some of the abstraction amounts', () => {
      beforeEach(() => {
        licenceVersionPurpose = {
          dailyQuantity: 299452.05,
          instantQuantity: 13190.976
        }
      })

      it('returns only those formatted to two decimal places with their measure as an array', () => {
        const result = BaseLicencesPresenter.formatAbstractionAmounts(licenceVersionPurpose)

        expect(result).to.equal(['299,452.05 cubic metres per day', '13,190.98 litres per second'])
      })
    })

    describe('when the "licenceVersionPurpose" contains only one of the abstraction amounts', () => {
      beforeEach(() => {
        licenceVersionPurpose = {
          annualQuantity: 109300000
        }
      })

      it('returns it formatted to two decimal places with its measure as an array', () => {
        const result = BaseLicencesPresenter.formatAbstractionAmounts(licenceVersionPurpose)

        expect(result).to.equal(['109,300,000.00 cubic metres per year'])
      })
    })

    describe('when the "licenceVersionPurpose" has no abstraction amounts', () => {
      beforeEach(() => {
        licenceVersionPurpose = {}
      })

      it('returns an empty array', () => {
        const result = BaseLicencesPresenter.formatAbstractionAmounts(licenceVersionPurpose)

        expect(result).to.be.empty()
      })
    })
  })

  describe('#supplementaryBillingNotification()', () => {
    let licence

    beforeEach(() => {
      licence = {
        includeInTwoPartTariffBilling: false
      }
    })

    describe('when the licence has NOT been flagged for any supplementary bill runs', () => {
      it('returns "null"', () => {
        const result = BaseLicencesPresenter.supplementaryBillingNotification(licence)

        expect(result).to.be.null()
      })
    })

    describe('when the licence has been flagged just for the next PRESROC supplementary bill run', () => {
      beforeEach(() => {
        licence.includeInPresrocBilling = 'yes'
      })

      it('returns a notification just for the "old charge scheme"', () => {
        const result = BaseLicencesPresenter.supplementaryBillingNotification(licence)

        expect(result).to.equal({
          text: 'This licence has been marked for the next supplementary bill run for the old charge scheme.',
          titleText: 'Important'
        })
      })
    })

    describe('when the licence has been flagged just for the next SROC supplementary bill run', () => {
      beforeEach(() => {
        licence.includeInSrocBilling = true
      })

      it('returns a notification just for the current charge scheme', () => {
        const result = BaseLicencesPresenter.supplementaryBillingNotification(licence)

        expect(result).to.equal({
          text: 'This licence has been marked for the next supplementary bill run.',
          titleText: 'Important'
        })
      })
    })

    describe('when the licence has been flagged for the next PRESROC & SROC supplementary bill runs', () => {
      beforeEach(() => {
        licence.includeInPresrocBilling = 'yes'
        licence.includeInSrocBilling = true
      })

      it('returns a notification just for both charge schemes', () => {
        const result = BaseLicencesPresenter.supplementaryBillingNotification(licence)

        expect(result).to.equal({
          text: 'This licence has been marked for the next supplementary bill runs for the current and old charge schemes.',
          titleText: 'Important'
        })
      })
    })

    describe('when the licence has been flagged just for the next TPT supplementary bill run', () => {
      beforeEach(() => {
        licence.includeInTwoPartTariffBilling = true
      })

      it('returns a notification just for TPT supplementary', () => {
        const result = BaseLicencesPresenter.supplementaryBillingNotification(licence)

        expect(result).to.equal({
          text: 'This licence has been marked for the next two-part tariff supplementary bill run.',
          titleText: 'Important'
        })
      })
    })

    describe('when the licence has been flagged for the next TPT & PRESROC supplementary bill runs', () => {
      beforeEach(() => {
        licence.includeInTwoPartTariffBilling = true
        licence.includeInPresrocBilling = 'yes'
      })

      it('returns a notification for TPT & PRESROC supplementary', () => {
        const result = BaseLicencesPresenter.supplementaryBillingNotification(licence)

        expect(result).to.equal({
          text: 'This licence has been marked for the next two-part tariff supplementary bill run and the supplementary bill run for the old charge scheme.',
          titleText: 'Important'
        })
      })
    })

    describe('when the licence has been flagged for the next TPT & SROC supplementary bill runs', () => {
      beforeEach(() => {
        licence.includeInTwoPartTariffBilling = true
        licence.includeInSrocBilling = true
      })

      it('returns a notification for TPT & SROC supplementary', () => {
        const result = BaseLicencesPresenter.supplementaryBillingNotification(licence)

        expect(result).to.equal({
          text: 'This licence has been marked for the next two-part tariff supplementary bill run and the supplementary bill run.',
          titleText: 'Important'
        })
      })
    })

    describe('when the licence has been flagged for the next TPT, PRESROC & SROC supplementary bill runs', () => {
      beforeEach(() => {
        licence.includeInTwoPartTariffBilling = true
        licence.includeInPresrocBilling = 'yes'
        licence.includeInSrocBilling = true
      })

      it('returns a notification for TPT, PRESROC & SROC supplementary', () => {
        const result = BaseLicencesPresenter.supplementaryBillingNotification(licence)

        expect(result).to.equal({
          text: 'This licence has been marked for the next two-part tariff supplementary bill run and supplementary bill runs for the current and old charge schemes.',
          titleText: 'Important'
        })
      })
    })
  })

  describe('#pluralise()', () => {
    describe('when the count is 1', () => {
      it('returns the word unchanged', () => {
        const result = BaseLicencesPresenter.pluralise('point', 1)

        expect(result).to.equal('point')
      })
    })

    describe('when the count is greater than 1', () => {
      it('returns the word pluralised', () => {
        const result = BaseLicencesPresenter.pluralise('point', 2)

        expect(result).to.equal('points')
      })
    })
  })

  describe('#userRoles()', () => {
    let auth

    beforeEach(() => {
      auth = {
        credentials: {
          roles: [
            {
              id: '123',
              role: 'role1'
            },
            {
              id: '456',
              role: 'role2'
            }
          ]
        }
      }
    })

    describe('when the user has roles', () => {
      it('should return the roles', () => {
        const result = BaseLicencesPresenter.userRoles(auth)

        expect(result).to.equal(['role1', 'role2'])
      })
    })

    describe('when the user has no roles', () => {
      beforeEach(() => {
        auth.credentials.roles = []
      })

      it('should return an empty array', () => {
        const result = BaseLicencesPresenter.userRoles(auth)

        expect(result).to.be.empty()
      })
    })
  })
})
