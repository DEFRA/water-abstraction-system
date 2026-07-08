// Test framework dependencies

// Things we need to stub
import FetchCurrentReturnVersionsDal from '../../../../../app/dal/return-versions/fetch-current-return-versions.dal.js'
import UpdateReturnVersionEndDateDal from '../../../../../app/dal/return-versions/update-return-version-end-date.dal.js'
import UpdateReturnVersionStatusDal from '../../../../../app/dal/return-versions/update-return-version-status.dal.js'

// Thing under test
import ProcessExistingReturnVersionsService from '../../../../../app/services/return-versions/setup/check/process-existing-return-versions.service.js'

describe('Return Versions Setup - Process Existing Return Versions service', () => {
  let licenceId
  let newVersionStartDate

  beforeEach(() => {
    licenceId = '7cf4a46b-1375-42c8-bfe7-24c1bfff765c'

    vi.mock('../../../../../app/dal/return-versions/fetch-current-return-versions.dal.js')

    vi.mock('../../../../../app/dal/return-versions/update-return-version-end-date.dal.js')
    UpdateReturnVersionEndDateDal.mockResolvedValue()
    vi.mock('../../../../../app/dal/return-versions/update-return-version-status.dal.js')
    UpdateReturnVersionStatusDal.mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('When a "current" return version has a "startDate" < "newVersionStartDate" and no "endDate"', () => {
    beforeEach(() => {
      newVersionStartDate = new Date('2024-06-01')

      FetchCurrentReturnVersionsDal.mockResolvedValue([
        {
          id: '46c0fef8-70bb-41c8-bfa1-ace5c21ef739',
          licenceId,
          startDate: new Date('2024-04-01'),
          endDate: null
        }
      ])
    })

    it('sets the "endDate" of the existing record, a null "endDate" is returned for the new return version', async () => {
      const result = await ProcessExistingReturnVersionsService(licenceId, newVersionStartDate)

      expect(result).toBeNull()

      expect(UpdateReturnVersionEndDateDal).toHaveBeenCalledOnce()
      expect(UpdateReturnVersionEndDateDal.mock.calls[0][0]).toEqual('46c0fef8-70bb-41c8-bfa1-ace5c21ef739')
      expect(UpdateReturnVersionEndDateDal.mock.calls[0][1]).toEqual(new Date('2024-05-31'))
    })
  })

  describe('When a "current" return version has a "startDate" < "newVersionStartDate" and an "endDate" greater', () => {
    beforeEach(() => {
      newVersionStartDate = new Date('2024-06-01')

      FetchCurrentReturnVersionsDal.mockResolvedValue([
        {
          id: '46c0fef8-70bb-41c8-bfa1-ace5c21ef739',
          licenceId,
          startDate: new Date('2024-04-01'),
          endDate: new Date('2024-07-01')
        }
      ])
    })

    it('sets the "endDate" of the existing record and an "endDate" is returned for the new return version', async () => {
      const result = await ProcessExistingReturnVersionsService(licenceId, newVersionStartDate)

      expect(result).toEqual(new Date('2024-07-01'))

      expect(UpdateReturnVersionEndDateDal).toHaveBeenCalledOnce()
      expect(UpdateReturnVersionEndDateDal.mock.calls[0][0]).toEqual('46c0fef8-70bb-41c8-bfa1-ace5c21ef739')
      expect(UpdateReturnVersionEndDateDal.mock.calls[0][1]).toEqual(new Date('2024-05-31'))
    })
  })

  describe('When a "current" return version has a "startDate" > "newVersionStartDate" and no "endDate"', () => {
    beforeEach(() => {
      newVersionStartDate = new Date('2024-04-01')

      FetchCurrentReturnVersionsDal.mockResolvedValue([
        {
          id: '46c0fef8-70bb-41c8-bfa1-ace5c21ef739',
          licenceId,
          startDate: new Date('2024-04-21'),
          endDate: null
        }
      ])
    })

    it('an "endDate" is returned for the new return version and no changes are made', async () => {
      const result = await ProcessExistingReturnVersionsService(licenceId, newVersionStartDate)

      expect(result).toEqual(new Date('2024-04-20'))

      expect(UpdateReturnVersionEndDateDal).not.toHaveBeenCalled()
      expect(UpdateReturnVersionStatusDal).not.toHaveBeenCalled()
    })
  })

  describe('When a "current" return version has a "startDate" === "newVersionStartDate" and no "endDate"', () => {
    beforeEach(async () => {
      newVersionStartDate = new Date('2024-04-01')

      FetchCurrentReturnVersionsDal.mockResolvedValue([
        {
          id: '46c0fef8-70bb-41c8-bfa1-ace5c21ef739',
          licenceId,
          startDate: new Date('2024-04-01'),
          endDate: null
        }
      ])
    })

    it('sets the "status" of the existing record, a null end date is returned for the new return version', async () => {
      const result = await ProcessExistingReturnVersionsService(licenceId, newVersionStartDate)

      expect(result).toBeNull()

      expect(UpdateReturnVersionStatusDal).toHaveBeenCalledOnce()
      expect(UpdateReturnVersionStatusDal.mock.calls[0][0]).toEqual('46c0fef8-70bb-41c8-bfa1-ace5c21ef739')
      expect(UpdateReturnVersionStatusDal.mock.calls[0][1]).toEqual('superseded')
    })
  })

  describe('When a "current" return version has a "startDate" === "newVersionStartDate" and an "endDate"', () => {
    beforeEach(() => {
      newVersionStartDate = new Date('2024-04-01')

      FetchCurrentReturnVersionsDal.mockResolvedValue([
        {
          id: '46c0fef8-70bb-41c8-bfa1-ace5c21ef739',
          licenceId,
          startDate: new Date('2024-04-01'),
          endDate: new Date('2024-07-01')
        }
      ])
    })

    it('sets the "status" of the existing record and an "endDate" is returned for the new return version', async () => {
      const result = await ProcessExistingReturnVersionsService(licenceId, newVersionStartDate)

      expect(result).toEqual(new Date('2024-07-01'))

      expect(UpdateReturnVersionStatusDal).toHaveBeenCalledOnce()
      expect(UpdateReturnVersionStatusDal.mock.calls[0][0]).toEqual('46c0fef8-70bb-41c8-bfa1-ace5c21ef739')
      expect(UpdateReturnVersionStatusDal.mock.calls[0][1]).toEqual('superseded')
    })
  })

  describe('When a return version is inserted in between two existing return versions', () => {
    beforeEach(() => {
      newVersionStartDate = new Date('2025-04-01')

      FetchCurrentReturnVersionsDal.mockResolvedValue([
        {
          id: 'c4738c45-f43c-440d-a353-823cc0148d68',
          licenceId,
          startDate: new Date('1993-04-27'),
          endDate: new Date('2008-03-31')
        },
        {
          id: '46c0fef8-70bb-41c8-bfa1-ace5c21ef739',
          licenceId,
          startDate: new Date('2008-04-01'),
          endDate: new Date('2025-05-11')
        },
        {
          id: '670d1781-4071-4010-ab80-56ddc525faff',
          licenceId,
          startDate: new Date('2025-05-12'),
          endDate: null
        }
      ])
    })

    it('the correct "endDate" is returned for the existing return version and the previous ones endDate is updated', async () => {
      const result = await ProcessExistingReturnVersionsService(licenceId, newVersionStartDate)

      expect(result).toEqual(new Date('2025-05-11'))

      expect(UpdateReturnVersionEndDateDal).toHaveBeenCalledOnce()
      expect(UpdateReturnVersionEndDateDal.mock.calls[0][0]).toEqual('46c0fef8-70bb-41c8-bfa1-ace5c21ef739')
      expect(UpdateReturnVersionEndDateDal.mock.calls[0][1]).toEqual(new Date('2025-03-31'))
    })
  })
})
