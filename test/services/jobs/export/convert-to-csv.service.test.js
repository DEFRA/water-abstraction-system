'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ConvertToCSVService = require('../../../../app/services/jobs/export/convert-to-csv.service.js')

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

const csvHeaders =
  '"billingChargeCategoryId",' +
  '"reference",' +
  '"subsistenceCharge",' +
  '"description",' +
  '"shortDescription",' +
  '"dateCreated",' +
  '"dateUpdated",' +
  '"isTidal",' +
  '"lossFactor",' +
  '"modelTier",' +
  '"isRestrictedSource",' +
  '"minVolume",' +
  '"maxVolume"\n'

const csvValues =
  '"20146cdc-9b40-4769-aa78-b51c17080d56",' +
  '"4.1.1",9700,' +
  '"Low loss tidal abstraction of water up to and ""including"" 25,002 megalitres a year where no model applies",' +
  '"Low loss, tidal, up to and including 25,002 ML/yr",' +
  '2022-12-14T18:39:45.000Z,2022-12-14T18:39:45.000Z,' +
  'true,' +
  ',' +
  ',' +
  'false,' +
  ',' +
  '25002\n'

describe('Convert to CSV service', () => {
  describe('when given a row of data to convert', () => {
    it('convert the data to a CSV format', () => {
      const result = ConvertToCSVService.go(billingChargeCategoryRow)

      expect(result).to.equal(csvValues)
    })
  })

  describe('when given headers to convert', () => {
    it('converts the data to a CSV format', () => {
      const result = ConvertToCSVService.go(billingChargeCategoriesColumnInfo)

      expect(result).to.equal(csvHeaders)
    })
  })

  describe('when not given data to convert', () => {
    it('exports the table to CSV without any rows', () => {
      const result = ConvertToCSVService.go()

      expect(result).to.equal(undefined)
    })
  })
})
