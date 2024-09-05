'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const fs = require('fs')
const path = require('path')
const mockFs = require('mock-fs')

// Thing under test
const DeleteFilesService = require('../../../../app/services/jobs/export/delete-files.service.js')

describe('Delete Files service', () => {
  let filenameWithPath
  let folderNameWithPath
  let notifierStub

  beforeEach(() => {
    folderNameWithPath = 'testFolder'
    filenameWithPath = path.join(folderNameWithPath, 'testFile')
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    mockFs({
      testFolder: {
        testFile: 'test content'
      }
    })
  })

  afterEach(() => {
    mockFs.restore()
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('When a valid folder is specified', () => {
    it('deletes the folder', async () => {
      await DeleteFilesService.go(folderNameWithPath)

      const folderExists = fs.existsSync(folderNameWithPath)

      expect(folderExists).to.be.false()
    })

    it('deletes anything inside the folder', async () => {
      await DeleteFilesService.go(folderNameWithPath)

      const fileExists = fs.existsSync(filenameWithPath)

      expect(fileExists).to.be.false()
    })
  })

  describe('When a folder does not exist', () => {
    it('returns without throwing an error', async () => {
      const fakeFolder = 'FAKE_FILE'

      await expect(DeleteFilesService.go(fakeFolder)).not.to.reject()
    })
  })

  describe('When a valid file is specified', () => {
    it('deletes the file', async () => {
      await DeleteFilesService.go(filenameWithPath)

      const fileExists = fs.existsSync(filenameWithPath)

      expect(fileExists).to.be.false()
    })
  })

  describe('When a file does not exist', () => {
    it('returns without throwing an error', async () => {
      const fakeFile = 'FAKE_FILE'

      await expect(DeleteFilesService.go(fakeFile)).not.to.reject()
    })
  })

  describe('When no file name is given', () => {
    it('throws an error', async () => {
      const noFile = false

      await DeleteFilesService.go(noFile)

      expect(notifierStub.omfg.calledWith(('Delete file service errored'))).to.be.true()
    })
  })
})
