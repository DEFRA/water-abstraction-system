// Thing under test
import * as BaseAddressPresenter from '../../../app/presenters/address/base-address.presenter.js'

describe('Address - Base Address presenter', () => {
  describe('#countryLookup()', () => {
    it('returns a list where "Select a country" is always the first option', () => {
      const results = BaseAddressPresenter.countryLookup()

      expect(results[0]).toEqual({ selected: true, text: 'Select a country', value: 'select' })
    })

    it('returns the full list of countries we recognise', () => {
      const results = BaseAddressPresenter.countryLookup()

      expect(results).toHaveLength(207)

      expect(results[1]).toEqual({ selected: false, text: 'Afghanistan', value: 'Afghanistan' })
      expect(results[206]).toEqual({ selected: false, text: 'Zimbabwe', value: 'Zimbabwe' })
    })

    describe('when a "selected country" is not provided', () => {
      it('returns the first entry "Select a country" as selected', () => {
        const results = BaseAddressPresenter.countryLookup()

        expect(results[0].selected).toBe(true)
      })
    })

    describe('when a "selected country" is provided', () => {
      it('returns that country as selected', () => {
        const results = BaseAddressPresenter.countryLookup('Germany')

        const matchingResult = results.find((result) => {
          return result.selected
        })

        expect(matchingResult).toEqual({ selected: true, text: 'Germany', value: 'Germany' })
      })
    })
  })
})
