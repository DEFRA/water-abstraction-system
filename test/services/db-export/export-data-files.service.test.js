'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const fs = require('fs')
const path = require('path')

// Thing under test
const ExportDataFilesService = require('../../../app/services/db-export/export-data-files.service.js')

const csvHeader = [
  '"billingChargeCategoryId"',
  '"reference"',
  '"subsistenceCharge"',
  '"description"',
  '"shortDescription"',
  '"isTidal"',
  '"lossFactor"',
  '"modelTier"',
  '"isRestrictedSource"',
  '"minVolume"',
  '"maxVolume"',
  '"dateCreated"',
  '"dateUpdated"'
]

const csvValues = [
  '"20146cdc-9b40-4769-aa78-b51c17080d56"',
  '"4.1.1"',
  '"9700"',
  '"Low loss tidal abstraction of water up to and including 25,002 megalitres a year where no model applies"',
  '"Low loss, tidal, up to and including 25,002 ML/yr"',
  '"2022-12-14T18:39:45.000Z"',
  '"2022-12-14T18:39:45.000Z"',
  '"true"',
  '"low"',
  '"no model"',
  '"false"',
  '"0"',
  '"25002"'
]

describe('Export data files service', () => {
  const tableName = 'billing_charge_categories'

  let filePath
  let schemaFolder

  describe('when successful', () => {
    beforeEach(() => {
      const fileName = 'billing_charge_categories.csv'
      const __dirname = '/tmp/water'
      filePath = path.join(__dirname, fileName)
      schemaFolder = '/tmp/water'
    })

    afterEach(() => {
      // Delete the file
      fs.unlinkSync(filePath)
    })

    it('should write the CSV data to a file and return true', async () => {
      const data = csvHeader.join(',') + '\n' + csvValues.join(',')

      const returnedResult = await ExportDataFilesService.go(data, tableName, schemaFolder)

      expect(fs.existsSync(filePath)).to.equal(true)
      expect(returnedResult).to.equal('/tmp/water/billing_charge_categories.csv')
    })
  })

  describe('when unsuccessful', () => {
    it('should handle errors and return false', async () => {
      const data = null
      const result = await ExportDataFilesService.go(data, tableName, schemaFolder)

      expect(result).to.equal(false)
    })
  })
})
