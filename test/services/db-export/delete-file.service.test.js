'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const fs = require('fs')
const path = require('path')
const mockFs = require('mock-fs')

// Thing under test
const DeleteFileService = require('../../../app/services/db-export/delete-file.service.js')

describe('Delete File service', () => {
  let filenameWithPath

  beforeEach(() => {
    filenameWithPath = path.join('testFolder', 'testFile')

    mockFs({
      testFolder: {
        testFile: 'test content'
      }
    })
  })

  afterEach(() => {
    mockFs.restore()
  })

  describe('When a valid file is specified', () => {
    it('deletes the file', async () => {
      await DeleteFileService.go(filenameWithPath)

      const fileExists = fs.existsSync(filenameWithPath)
      expect(fileExists).to.be.false()
    })
  })

  describe('When an error occurs', () => {
    it('throws an error', async () => {
      const fakeFile = 'FAKE_FILE'

      const result = await expect(DeleteFileService.go(fakeFile)).to.reject()

      expect(result).to.be.an.error()
      expect(result.message).to.equal(`ENOENT: no such file or directory, unlink '${fakeFile}'`)
    })
  })
})
