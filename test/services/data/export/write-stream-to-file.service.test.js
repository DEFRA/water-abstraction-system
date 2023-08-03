'use strict'

// Test framework dependencies
const Code = require('@hapi/code')
const Lab = require('@hapi/lab')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingChargeCategoryHelper = require('../../../support/helpers/water/billing-charge-category.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const { db } = require('../../../../db/db.js')
const fs = require('fs')
const path = require('path')

// Thing under test
const WriteStreamToFileService = require('../../../../app/services/data/export/write-stream-to-file.service.js')

const tableName = 'billing_charge_categories'
const schemaName = 'water'
const schemaFolderPath = '/tmp/water'
const billingChargeCategoryId = '20146cdc-9b40-4769-aa78-b51c17080d56'
const date = new Date('2022-12-14').toISOString()

const headers = [
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

const csvValues = '"20146cdc-9b40-4769-aa78-b51c17080d56",' +
'"4.4.5",12000,' +
'"Low loss non-tidal abstraction of restricted water up to and including 5,000 megalitres a year, where a Tier 1 model applies.",' +
'"Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model",' +
'false,' +
'"low",' +
'"tier 1",' +
'true,' +
',' +
'5000,' +
'2022-12-14T00:00:00.000Z,\n'

const csvHeaders = '"billingChargeCategoryId",' +
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

describe('Write stream to file service', () => {
  let filePath

  describe('when successful', () => {
    beforeEach(async () => {
      await DatabaseHelper.clean()

      await BillingChargeCategoryHelper.add({ createdAt: date, billingChargeCategoryId })

      const fileName = 'billing_charge_categories.csv'
      const __dirname = '/tmp/water'
      filePath = path.join(__dirname, fileName)
    })

    afterEach(() => {
      Sinon.restore()
      // Delete the file
      fs.unlinkSync(filePath)
    })

    it('should write the data to the correct file path', async () => {
      const inputStreamTest = db
        .withSchema(schemaName)
        .select('*')
        .from(tableName)
        .stream()

      const dataTest = {
        headers,
        rows: inputStreamTest
      }

      await WriteStreamToFileService.go(dataTest, schemaFolderPath, tableName)

      expect(fs.existsSync(filePath)).to.be.true()
    })

    it('should write the correct data to the file', async () => {
      const inputStreamTest = db
        .withSchema(schemaName)
        .select('*')
        .from(tableName)
        .stream()

      const dataTest = {
        headers,
        rows: inputStreamTest
      }

      await WriteStreamToFileService.go(dataTest, schemaFolderPath, tableName)
      const file = fs.readFileSync(filePath, 'utf-8')

      expect(file).to.equal(csvHeaders + csvValues)
    })
  })
})
