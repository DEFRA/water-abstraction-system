// Test helpers
import CompanyHelper from '../../../support/helpers/company.helper.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import LicenceVersionHelper from '../../../support/helpers/licence-version.helper.js'
import ModLogHelper from '../../../support/helpers/mod-log.helper.js'
import ReturnRequirementHelper from '../../../support/helpers/return-requirement.helper.js'
import ReturnVersionHelper from '../../../support/helpers/return-version.helper.js'

// Thing under test
import FetchLicenceService from '../../../../app/services/return-versions/setup/fetch-licence.service.js'

describe('Return Versions - Setup - Fetch Licence service', () => {
  let company
  let ignoredReturnVersion
  let licence
  let licenceVersion
  let modLog
  let oldLicenceVersion
  let returnRequirement
  let returnVersion
  let supersededReturnVersion
  let supersededReturnRequirement

  beforeAll(async () => {
    // Create a licence
    licence = await LicenceHelper.add()

    // Create a company
    company = await CompanyHelper.add()

    // Create two licence versions so we can test the service only gets the 'current' version
    oldLicenceVersion = await LicenceVersionHelper.add({
      companyId: company.id,
      endDate: new Date('2025-04-30'),
      increment: 0,
      issue: 1,
      licenceId: licence.id,
      startDate: licence.startDate,
      status: 'superseded'
    })

    licenceVersion = await LicenceVersionHelper.add({
      companyId: company.id,
      increment: 0,
      issue: 2,
      licenceId: licence.id,
      startDate: new Date('2022-05-01')
    })

    // Create a return version without return requirements: we'll test it is ignored
    ignoredReturnVersion = await ReturnVersionHelper.add({
      licenceId: licence.id,
      startDate: licence.startDate,
      version: 100
    })

    // Next create a superseded return version: we'll test it is ignore
    supersededReturnVersion = await ReturnVersionHelper.add({
      licenceId: licence.id,
      startDate: licenceVersion.startDate,
      status: 'superseded',
      version: 101
    })
    supersededReturnRequirement = await ReturnRequirementHelper.add({ returnVersionId: supersededReturnVersion.id })

    // Now create the current return version: we'll test its included in the result
    returnVersion = await ReturnVersionHelper.add({
      licenceId: licence.id,
      startDate: licenceVersion.startDate,
      version: 102
    })
    returnRequirement = await ReturnRequirementHelper.add({ returnVersionId: returnVersion.id })

    // Add a mod log for the return version we'll return linked to the licence
    modLog = await ModLogHelper.add({
      reasonDescription: 'Record Loaded During Migration',
      returnVersionId: returnVersion.id
    })
  })

  afterAll(async () => {
    await modLog.$query().delete()

    await returnRequirement.$query().delete()
    await returnVersion.$query().delete()

    await supersededReturnRequirement.$query().delete()
    await supersededReturnVersion.$query().delete()

    await ignoredReturnVersion.$query().delete()

    await licenceVersion.$query().delete()
    await oldLicenceVersion.$query().delete()

    await company.$query().delete()

    await licence.$query().delete()
  })

  describe('when the matching licence exists', () => {
    it('returns the matching licence and associated records', async () => {
      const result = await FetchLicenceService(licence.id)

      expect(result).toEqual({
        id: licence.id,
        expiredDate: null,
        lapsedDate: null,
        licenceRef: licence.licenceRef,
        revokedDate: null,
        startDate: licence.startDate,
        waterUndertaker: false,
        licenceVersions: [
          {
            id: licenceVersion.id,
            licenceId: licence.id,
            issueDate: licenceVersion.issueDate,
            startDate: licenceVersion.startDate,
            status: licenceVersion.status,
            company: {
              id: company.id,
              name: 'Example Trading Ltd',
              type: 'organisation'
            }
          }
        ],
        returnVersions: [
          {
            id: returnVersion.id,
            startDate: returnVersion.startDate,
            reason: 'new-licence',
            modLogs: [
              {
                id: modLog.id,
                reasonDescription: 'Record Loaded During Migration'
              }
            ]
          }
        ]
      })
    })

    describe('and the associated data records', () => {
      it('includes only the "current" licence version', async () => {
        const result = await FetchLicenceService(licence.id)

        const resultLicenceVersionIds = result.licenceVersions.map((licenceVersion) => {
          return licenceVersion.id
        })

        expect(resultLicenceVersionIds).toEqual([licenceVersion.id])
      })

      it('includes only return versions that can be copied from', async () => {
        const result = await FetchLicenceService(licence.id)

        const resultReturnVersionIds = result.returnVersions.map((returnVersion) => {
          return returnVersion.id
        })

        expect(resultReturnVersionIds).toEqual([returnVersion.id])
      })
    })
  })

  describe('when the matching licence does not exist', () => {
    it('returns undefined', async () => {
      const result = await FetchLicenceService('7f665e1b-a2cf-4241-9dc9-9351edc16533')

      expect(result).toBeUndefined()
    })
  })
})
