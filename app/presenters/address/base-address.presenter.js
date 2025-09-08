'use strict'

const { countries } = require('../../lib/static-lookups.lib.js')

/**
 * Generate a list of countries in a format suitable for a select box, with the specified country selected
 *
 * > Note: This is intended for use when adding an international address. Therefore 'United Kingdom' does not appear in
 * > our list.
 *
 * @param {string} [selectedCountry='select'] - Country to select in the list.
 *
 * @returns {object[]} List of countries in the format { value, selected, text }.
 */
function countryLookup(selectedCountry = 'select') {
  const displayCountries = [
    {
      selected: selectedCountry === 'select',
      text: 'Select a country',
      value: 'select'
    }
  ]

  for (const country of countries) {
    displayCountries.push({
      selected: selectedCountry === country,
      text: country,
      value: country
    })
  }

  return displayCountries
}

module.exports = {
  countryLookup
}
