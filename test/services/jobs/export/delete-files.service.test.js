'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const fs = require('fs')
const path = require('path')
const mockFs = require('mock-fs')

// Things we need to stub
const GlobalNotifierStub = require('../../../support/stubs/global-notifier.stub.js')

// Thing under test
const DeleteFilesService = require('../../../../app/services/jobs/export/delete-files.service.js')

describe('Delete Files service', () => {
  let filenameWithPath
  let folderNameWithPath
  let notifierStub

  beforeEach(() => {
    folderNameWithPath = 'testFolder'
    filenameWithPath = path.join(folderNameWithPath, 'testFile')
    notifierStub = GlobalNotifierStub.build(Sinon)
    globalThis.GlobalNotifier = notifierStub

    mockFs({
      testFolder: {
        testFile: 'test content'
      }
    })
  })

  afterEach(() => {
    mockFs.restore()
    Sinon.restore()
    delete globalThis.GlobalNotifier
  })

  describe('When a valid folder is specified', () => {
    it('deletes the folder', async () => {
      await DeleteFilesService.go(folderNameWithPath)

      const folderExists = fs.existsSync(folderNameWithPath)

      expect(folderExists).toBe(false)
    })

    it('deletes anything inside the folder', async () => {
      await DeleteFilesService.go(folderNameWithPath)

      const fileExists = fs.existsSync(filenameWithPath)

      expect(fileExists).toBe(false)
    })
  })

  describe('When a folder does not exist', () => {
    it('returns without throwing an error', async () => {
      const fakeFolder = 'FAKE_FILE'

      await expect(DeleteFilesService.go(fakeFolder)).resolves.toBeUndefined()
    })
  })

  describe('When a valid file is specified', () => {
    it('deletes the file', async () => {
      await DeleteFilesService.go(filenameWithPath)

      const fileExists = fs.existsSync(filenameWithPath)

      expect(fileExists).toBe(false)
    })
  })

  describe('When a file does not exist', () => {
    it('returns without throwing an error', async () => {
      const fakeFile = 'FAKE_FILE'

      await expect(DeleteFilesService.go(fakeFile)).resolves.toBeUndefined()
    })
  })

  describe('When no file name is given', () => {
    it('throws an error', async () => {
      const noFile = false

      await DeleteFilesService.go(noFile)

      expect(notifierStub.omfg.calledWith('Delete file service errored')).toBe(true)
    })
  })
})
