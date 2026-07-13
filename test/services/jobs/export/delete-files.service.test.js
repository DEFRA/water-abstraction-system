// Test framework dependencies

// Test helpers
import fs from 'fs'
import path from 'path'
import mockFs from 'mock-fs'

// Things we need to stub
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'

// Thing under test
import DeleteFilesService from '../../../../app/services/jobs/export/delete-files.service.js'

describe('Delete Files service', () => {
  let filenameWithPath
  let folderNameWithPath
  let notifierStub

  beforeEach(() => {
    folderNameWithPath = 'testFolder'
    filenameWithPath = path.join(folderNameWithPath, 'testFile')
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub

    mockFs({
      testFolder: {
        testFile: 'test content'
      }
    })
  })

  afterEach(() => {
    mockFs.restore()
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('When a valid folder is specified', () => {
    it('deletes the folder', async () => {
      await DeleteFilesService(folderNameWithPath)

      const folderExists = fs.existsSync(folderNameWithPath)

      expect(folderExists).toBe(false)
    })

    it('deletes anything inside the folder', async () => {
      await DeleteFilesService(folderNameWithPath)

      const fileExists = fs.existsSync(filenameWithPath)

      expect(fileExists).toBe(false)
    })
  })

  describe('When a folder does not exist', () => {
    it('returns without throwing an error', async () => {
      const fakeFolder = 'FAKE_FILE'

      await expect(DeleteFilesService(fakeFolder)).resolves.toBeUndefined()
    })
  })

  describe('When a valid file is specified', () => {
    it('deletes the file', async () => {
      await DeleteFilesService(filenameWithPath)

      const fileExists = fs.existsSync(filenameWithPath)

      expect(fileExists).toBe(false)
    })
  })

  describe('When a file does not exist', () => {
    it('returns without throwing an error', async () => {
      const fakeFile = 'FAKE_FILE'

      await expect(DeleteFilesService(fakeFile)).resolves.toBeUndefined()
    })
  })

  describe('When no file name is given', () => {
    it('throws an error', async () => {
      const noFile = false

      await DeleteFilesService(noFile)

      expect(notifierStub.omfg).toHaveBeenCalledWith(
        'Delete file service errored',
        expect.any(Object),
        expect.any(Error)
      )
    })
  })
})
