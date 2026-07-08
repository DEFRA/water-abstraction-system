// Thing under test
import FetchSystemInfoService from '../../../app/services/health/fetch-system-info.service.js'

describe('Fetch System Info service', () => {
  it('returns the systems version and commit hash', async () => {
    const result = await FetchSystemInfoService()

    expect(result.name).toEqual('System')
    expect(result.serviceName).toEqual('system')
    expect(result.version).toBeDefined()
    expect(result.commit).toBeDefined()
    expect(result.jobs).toHaveLength(0)
  })
})
