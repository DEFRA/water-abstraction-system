// Things we need to stub (dynamically required in beforeEach to support mocking)
let tar

// Thing under test (dynamically required in beforeEach to support mocking)
let CompressSchemaFolderService

// TODO: Remove describe.skip once the project migrates to ESM. In CJS mode, Node.js v22's require(esm)
// compatibility layer runs before Vitest's module interceptor so vi.doMock('tar') cannot replace the ESM
// package's live bindings. Once test files are ESM, vi.mock('tar') with a static import will work correctly.
describe.skip('Jobs - Export - Compress Schema Folder service', () => {
  beforeEach(() => {
    vi.doMock('tar', () => {
      return { create: vi.fn().mockResolvedValue(undefined) }
    })
    vi.resetModules()

    tar = require('tar')
    CompressSchemaFolderService = require('../../../../app/services/jobs/export/compress-schema-folder.service.js')
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('creates a compressed tarball from the given schema folder', async () => {
    const schemaFolderPath = '/tmp/water'
    const expectedTarballPath = '/tmp/water.tgz'

    const result = await CompressSchemaFolderService(schemaFolderPath)

    expect(tar.create).toHaveBeenCalledOnce()
    expect(result).toEqual(expectedTarballPath)
  })
})
