'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const fs = require('fs')

// Thing under test
const CompressFilesService = require('../../../app/services/db-export/compress-files.service.js')

describe('Compress files service', () => {
  let filePath

  describe('when successful', () => {
    beforeEach(() => {
      filePath = 'test/fixtures/compress-files.service.csv'
    })

    afterEach(() => {
      // Delete the new file
      fs.unlinkSync(`${filePath}.gz`)
    })

    it('compresses the csv file to a .gz file', async () => {
      const result = await CompressFilesService.go(filePath)

      expect(result).to.equal(`${filePath}.gz`)
      expect(fs.existsSync(`${filePath}.gz`)).to.equal(true)
    })
  })

  describe('when unsuccessful because the CSV file does not exist', () => {
    beforeEach(() => {
      filePath = ''
    })

    it('returns an error', async () => {
      const result = await CompressFilesService.go(filePath)

      expect(result).to.equal(false)
      expect(fs.existsSync((`${filePath}.gz`))).to.equal(false)
    })
  })
})
