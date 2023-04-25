'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ConvertToCSVService = require('../../../app/services/db-export/convert-to-csv.service')

/**
 * billingChargeCategoriesTable has all data types we are testing for
 * objects{Date} - dateCreated
 * String - description
 * String (with added quotes)- shortDescription
 * Integer - maxVolume
 * Null - lossFactor
 * Undefined - modelTier
 */
const billingChargeCategoryRow = {
  billingChargeCategoryId: '20146cdc-9b40-4769-aa78-b51c17080d56',
  reference: '4.1.1',
  subsistenceCharge: 9700,
  description: 'Low loss tidal abstraction of water up to and "including" 25,002 megalitres a year where no model applies',
  shortDescription: 'Low loss, tidal, up to and including 25,002 ML/yr',
  dateCreated: new Date(2022, 11, 14, 18, 39, 45),
  dateUpdated: new Date(2022, 11, 14, 18, 39, 45),
  isTidal: true,
  lossFactor: null,
  modelTier: undefined,
  isRestrictedSource: false,
  minVolume: '',
  maxVolume: 25002
}

const billingChargeCategoriescolumnInfo = {
  billingChargeCategoryId:
    {
      type: 'uuid',
      maxLength: null,
      nullable: false,
      defaultValue: 'gen_random_uuid()'
    },
  reference:
  {
    type: 'character varying',
    maxLength: 255,
    nullable: true,
    defaultValue: null
  },
  subsistenceCharge:
  {
    type: 'integer',
    maxLength: null,
    nullable: true,
    defaultValue: null
  },
  description:
  {
    type: 'character varying',
    maxLength: 255,
    nullable: true,
    defaultValue: null
  },
  shortDescription:
  {
    type: 'character varying',
    maxLength: 255,
    nullable: true,
    defaultValue: null
  },
  dateCreated:
  {
    type: 'timestamp without time zone',
    maxLength: null,
    nullable: false,
    defaultValue: null
  },
  dateUpdated:
  {
    type: 'timestamp without time zone',
    maxLength: null,
    nullable: true,
    defaultValue: null
  },
  isTidal:
  {
    type: 'boolean',
    maxLength: null,
    nullable: true,
    defaultValue: null
  },
  lossFactor:
  {
    type: 'character varying',
    maxLength: 255,
    nullable: true,
    defaultValue: null
  },
  modelTier:
  {
    type: 'character varying',
    maxLength: 255,
    nullable: true,
    defaultValue: null
  },
  isRestrictedSource:
  {
    type: 'boolean',
    maxLength: null,
    nullable: true,
    defaultValue: null
  },
  minVolume:
  {
    type: 'bigint',
    maxLength: null,
    nullable: true,
    defaultValue: null
  },
  maxVolume:
  {
    type: 'bigint',
    maxLength: null,
    nullable: true,
    defaultValue: null
  }
}

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
      it('has the table columns as headers', async () => {
        const result = await ConvertToCSVService.go([billingChargeCategoriescolumnInfo, [billingChargeCategoryRow]])
        const resultLines = result.split(/\r?\n/)

        expect(resultLines[0]).to.equal(csvHeaders.join(','))
      })

      it('converts the data to a CSV format', async () => {
        const result = await ConvertToCSVService.go([billingChargeCategoriescolumnInfo, [billingChargeCategoryRow]])
        const resultLines = result.split(/\r?\n/)

        expect(resultLines[1]).to.equal(csvValues.join(','))
      })
    })

    describe('that has multiple rows of data', () => {
      it('transforms all the rows to CSV', async () => {
        const result = await ConvertToCSVService.go([billingChargeCategoriescolumnInfo, [billingChargeCategoryRow, billingChargeCategoryRow]])
        const resultLines = result.split(/\r?\n/)

        expect(resultLines[1]).to.equal(csvValues.join(','))
        expect(resultLines[2]).to.equal(csvValues.join(','))
      })
    })
  })

  describe('when not given data to convert', () => {
    describe('that has no rows of data', () => {
      it('doesnt throw an error', () => {
        expect(ConvertToCSVService.go([billingChargeCategoriescolumnInfo])).to.not.reject()
      })

      it('exports the table to CSV without any rows', async () => {
        const result = await ConvertToCSVService.go([billingChargeCategoriescolumnInfo])

        expect(result).to.equal(csvHeaders.toString())
      })
    })
  })
})
