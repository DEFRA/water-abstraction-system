// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import fs from 'fs'
import path from 'path'

// Thing under test
import CompressSchemaFolderService from '../../../../app/services/jobs/export/compress-schema-folder.service.js'

describe('Jobs - Export - Compress Schema Folder service', () => {
  // NOTE: 'tar' is a native ESM package, so its module namespace is frozen and cannot be stubbed with vi.spyOn()
  // (and we don't use vi.mock() — see the testing skill's Mocking section for why). So instead we exercise the real
  // thing: create a real folder with a file in it, compress it, and assert the tarball exists on disk.
  let schemaFolderPath
  let tarballPath

  beforeEach(() => {
    schemaFolderPath = '/tmp/compress-schema-folder-test'
    tarballPath = `${schemaFolderPath}.tgz`

    fs.mkdirSync(schemaFolderPath, { recursive: true })
    fs.writeFileSync(path.join(schemaFolderPath, 'test-file.csv'), 'some,csv,data')
  })

  afterEach(() => {
    fs.rmSync(schemaFolderPath, { recursive: true, force: true })
    fs.rmSync(tarballPath, { force: true })
  })

  it('creates a compressed tarball from the given schema folder', async () => {
    const result = await CompressSchemaFolderService(schemaFolderPath)

    expect(result).toEqual(tarballPath)
    expect(fs.existsSync(tarballPath)).toBe(true)
  })
})
