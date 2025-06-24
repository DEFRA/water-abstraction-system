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
})
