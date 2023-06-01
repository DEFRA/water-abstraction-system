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

  describe('When a file does not exist', () => {
    it('returns without throwing an error', async () => {
      const fakeFile = 'FAKE_FILE'

      await expect(DeleteFileService.go(fakeFile)).not.to.reject()
    })
  })
})
