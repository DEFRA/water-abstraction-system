'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const UploadTypeService = require('../../../../app/services/data/export/upload-type.service.js')

describe('Upload type service', () => {
  describe('when the buffer is bigger then 5MB', () => {
    it('returns multipart upload', async () => {
      const size = 25 * 1024 * 1024

      const result = await UploadTypeService.go(createString(size))

      expect(result).to.equal('multipart upload')
    })
  })
  describe('when the buffer is smaller then 5MB', () => {
    it('returns single upload', async () => {
      const size = 5 * 1024 * 1024

      const result = await UploadTypeService.go(createString(size))

      expect(result).to.equal('single upload')
    })
  })
})

function createString (size) {
  return 'x'.repeat(size)
}
