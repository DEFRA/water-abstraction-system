// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import * as TarWrapperLib from '../../../../app/lib/tar-wrapper.lib.js'

// Thing under test
import CompressSchemaFolderService from '../../../../app/services/jobs/export/compress-schema-folder.service.js'

describe('Jobs - Export - Compress Schema Folder service', () => {
  beforeEach(() => {
    vi.spyOn(TarWrapperLib, 'tarCreate').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a compressed tarball from the given schema folder', async () => {
    const schemaFolderPath = '/tmp/water'
    const expectedTarballPath = '/tmp/water.tgz'

    const result = await CompressSchemaFolderService(schemaFolderPath)

    expect(TarWrapperLib.tarCreate).toHaveBeenCalledOnce()
    expect(result).toEqual(expectedTarballPath)
  })
})
