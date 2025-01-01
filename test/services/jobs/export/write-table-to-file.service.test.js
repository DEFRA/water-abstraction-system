'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach, after } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const { data: chargeCategories } = require('../../../../db/seeds/data/charge-categories.js')
const { closeConnection } = require('../../../support/database.js')
const { db } = require('../../../../db/db.js')
const fs = require('fs')
const path = require('path')

// Thing under test
const WriteTableToFileService = require('../../../../app/services/jobs/export/write-table-to-file.service.js')

const tableName = 'billing_charge_categories'
const schemaName = 'water'
const schemaFolderPath = '/tmp/water'

const headers = [
  'billingChargeCategoryId',
  'reference',
  'subsistenceCharge',
  'description',
  'shortDescription',
  'isTidal',
  'lossFactor',
  'modelTier',
  'isRestrictedSource',
  'minVolume',
  'maxVolume'
]

const csvValues =
  '"b13a469a-aa38-48c8-b899-da7536b44e37",' +
  '"4.1.1",' +
  '9700,' +
  '"Low loss tidal abstraction of water up to and including 25,002 megalitres a year where no model applies",' +
  '"Low loss, tidal, up to and including 25,002 ML/yr",' +
  'true,' +
  '"low",' +
  '"no model",' +
  'false,' +
  ',' +
  '25002\n'

const csvHeaders =
  '"billingChargeCategoryId",' +
  '"reference",' +
  '"subsistenceCharge",' +
  '"description",' +
  '"shortDescription",' +
  '"isTidal",' +
  '"lossFactor",' +
  '"modelTier",' +
  '"isRestrictedSource",' +
  '"minVolume",' +
  '"maxVolume"\n'

describe('Write table to file service', () => {
  let filePath

  after(async () => {
    await closeConnection()
  })

  describe('when successful', () => {
    beforeEach(async () => {
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
        .select([headers])
        .from(tableName)
        .where('billingChargeCategoryId', chargeCategories[0].id)
        .stream()

      const dataTest = {
        headers,
        rows: inputStreamTest
      }

      await WriteTableToFileService.go(dataTest.headers, dataTest.rows, schemaFolderPath, tableName)

      expect(fs.existsSync(filePath)).to.be.true()
    })

    it('should write the correct data to the file', async () => {
      const inputStreamTest = db
        .withSchema(schemaName)
        .select([headers])
        .from(tableName)
        .where('billingChargeCategoryId', chargeCategories[0].id)
        .stream()

      const dataTest = {
        headers,
        rows: inputStreamTest
      }

      await WriteTableToFileService.go(dataTest.headers, dataTest.rows, schemaFolderPath, tableName)
      const file = fs.readFileSync(filePath, 'utf-8')

      expect(file).to.equal(csvHeaders + csvValues)
    })
  })
})
