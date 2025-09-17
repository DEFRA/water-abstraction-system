'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const BaseAddressPresenter = require('../../../app/presenters/address/base-address.presenter.js')

describe('Address - Base Address presenter', () => {
  describe('#countryLookup()', () => {
    it('returns a list where "Select a country" is always the first option', () => {
      const results = BaseAddressPresenter.countryLookup()

      expect(results[0]).to.equal({ selected: true, text: 'Select a country', value: 'select' })
    })

    it('returns the full list of countries we recognise', () => {
      const results = BaseAddressPresenter.countryLookup()

      expect(results).to.have.length(207)

      expect(results[1]).to.equal({ selected: false, text: 'Afghanistan', value: 'Afghanistan' })
      expect(results[206]).to.equal({ selected: false, text: 'Zimbabwe', value: 'Zimbabwe' })
    })

    describe('when a "selected country" is not provided', () => {
      it('returns the first entry "Select a country" as selected', () => {
        const results = BaseAddressPresenter.countryLookup()

        expect(results[0].selected).to.be.true()
      })
    })

    describe('when a "selected country" is provided', () => {
      it('returns that country as selected', () => {
        const results = BaseAddressPresenter.countryLookup('Germany')

        const matchingResult = results.find((result) => {
          return result.selected
        })

        expect(matchingResult).to.equal({ selected: true, text: 'Germany', value: 'Germany' })
      })
    })
  })
})
