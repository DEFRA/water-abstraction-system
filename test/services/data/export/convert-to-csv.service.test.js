'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ConvertToCSVService = require('../../../../app/services/data/export/convert-to-csv.service.js')

/**
 * billingChargeCategoriesTable has all data types we are testing for
 * objects{Date} - dateCreated
 * String - description
 * String (with added quotes)- shortDescription
 * Integer - maxVolume
 * Null - lossFactor
 * Undefined - modelTier
 */
const billingChargeCategoryRow = [
  '20146cdc-9b40-4769-aa78-b51c17080d56',
  '4.1.1',
  9700,
  'Low loss tidal abstraction of water up to and "including" 25,002 megalitres a year where no model applies',
  'Low loss, tidal, up to and including 25,002 ML/yr',
  new Date(2022, 11, 14, 18, 39, 45),
  new Date(2022, 11, 14, 18, 39, 45),
  true,
  null,
  undefined,
  false,
  '',
  25002
]

const billingChargeCategoriesColumnInfo = [
  'billingChargeCategoryId',
  'reference',
  'subsistenceCharge',
  'description',
  'shortDescription',
  'dateCreated',
  'dateUpdated',
  'isTidal',
  'lossFactor',
  'modelTier',
  'isRestrictedSource',
  'minVolume',
  'maxVolume'
]

const csvHeaders = [
  '"billingChargeCategoryId"',
  '"reference"',
  '"subsistenceCharge"',
  '"description"',
  '"shortDescription"',
  '"dateCreated"',
  '"dateUpdated"',
  '"isTidal"',
  '"lossFactor"',
  '"modelTier"',
  '"isRestrictedSource"',
  '"minVolume"',
  '"maxVolume"'
]

const csvValues = [
  '"20146cdc-9b40-4769-aa78-b51c17080d56"',
  '"4.1.1"',
  '9700',
  '"Low loss tidal abstraction of water up to and ""including"" 25,002 megalitres a year where no model applies"',
  '"Low loss, tidal, up to and including 25,002 ML/yr"',
  '2022-12-14T18:39:45.000Z',
  '2022-12-14T18:39:45.000Z',
  'true',
  '',
  '',
  'false',
  '',
  '25002'
]

describe('Convert to CSV service', () => {
  describe('when given data to convert', () => {
    describe('that only has one row of data', () => {
      it('has the table columns as headers', () => {
        const result = ConvertToCSVService.go(billingChargeCategoriesColumnInfo, [billingChargeCategoryRow])
        const resultLines = result.split(/\r?\n/)

        expect(resultLines[0]).to.equal(csvHeaders.join(','))
      })

      it('converts the data to a CSV format', () => {
        const result = ConvertToCSVService.go(billingChargeCategoriesColumnInfo, [billingChargeCategoryRow])
        const resultLines = result.split(/\r?\n/)

        expect(resultLines[1]).to.equal(csvValues.join(','))
      })
    })

    describe('that has multiple rows of data', () => {
      it('transforms all the rows to CSV', () => {
        const result = ConvertToCSVService.go(billingChargeCategoriesColumnInfo, [billingChargeCategoryRow, billingChargeCategoryRow])
        const resultLines = result.split(/\r?\n/)

        expect(resultLines[1]).to.equal(csvValues.join(','))
        expect(resultLines[2]).to.equal(csvValues.join(','))
      })
    })
  })

  describe('when not given data to convert', () => {
    describe('that has no rows of data', () => {
      it('exports the table to CSV without any rows', () => {
        const result = ConvertToCSVService.go(billingChargeCategoriesColumnInfo, [])

        expect(result).to.equal(csvHeaders.toString())
      })
    })
  })
})
