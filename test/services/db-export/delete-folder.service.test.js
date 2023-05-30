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
const DeleteFolderService = require('../../../app/services/db-export/delete-folder.service.js')

describe('Delete Folder service', () => {
  let filenameWithPath
  let folderNameWithPath

  beforeEach(() => {
    folderNameWithPath = 'testFolder'
    filenameWithPath = path.join(folderNameWithPath, 'testFile')

    mockFs({
      testFolder: {
        testFile: 'test content'
      }
    })
  })

  afterEach(() => {
    mockFs.restore()
  })

  describe('When a valid folder is specified', () => {
    it('deletes the folder', async () => {
      await DeleteFolderService.go(folderNameWithPath)

      const folderExists = fs.existsSync(folderNameWithPath)
      expect(folderExists).to.be.false()
    })

    it('deletes anything inside the folder', async () => {
      await DeleteFolderService.go(folderNameWithPath)

      const fileExists = fs.existsSync(filenameWithPath)
      expect(fileExists).to.be.false()
    })
  })

  describe('When an error occurs', () => {
    it('throws an error', async () => {
      const fakeFolder = 'FAKE_FILE'

      const result = await expect(DeleteFolderService.go(fakeFolder)).to.reject()

      expect(result).to.be.an.error()
      expect(result.message).to.equal(`ENOENT: no such file or directory, scandir '${fakeFolder}'`)
    })
  })
})
