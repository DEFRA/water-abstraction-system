// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceHelper from '../../support/helpers/licence.helper.js'
import LicenceModel from '../../../app/models/licence.model.js'
import LicenceSupplementaryYearModel from '../../support/helpers/licence-supplementary-year.helper.js'
import LicenceVersionHelper from '../../support/helpers/licence-version.helper.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Thing under test
import FetchLicenceService from '../../../app/services/licences/fetch-licence.service.js'

describe('Licences - Fetch Licence service', () => {
  let licence
  let licenceVersion
  let licenceSupplementaryYear
  let additionalLicenceVersion

  beforeAll(async () => {
    licence = await LicenceHelper.add()

    licenceSupplementaryYear = await LicenceSupplementaryYearModel.add({
      licenceId: licence.id,
      twoPartTariff: true
    })

    // Create 2 licence versions so we can test the service only gets the 'current' version
    additionalLicenceVersion = await LicenceVersionHelper.add({
      endDate: new Date('2022-04-30'),
      increment: 0,
      issue: 100,
      licenceId: licence.id,
      startDate: new Date('2021-10-11'),
      status: 'superseded'
    })

    licenceVersion = await LicenceVersionHelper.add({
      increment: 0,
      issue: 101,
      licenceId: licence.id,
      startDate: new Date('2022-05-01')
    })
  })

  afterAll(async () => {
    await additionalLicenceVersion.$query().delete()
    await licence.$query().delete()
    await licenceSupplementaryYear.$query().delete()
    await licenceVersion.$query().delete()
  })

  describe('when there is a matching licence', () => {
    it('returns the matching licence', async () => {
      const result = await FetchLicenceService(licence.id)

      expect(result).toBeInstanceOf(LicenceModel)
      expect(result).toEqual({
        expiredDate: null,
        id: licence.id,
        includeInPresrocBilling: 'no',
        includeInSrocBilling: false,
        includeInTwoPartTariffBilling: true,
        lapsedDate: null,
        licenceRef: licence.licenceRef,
        licenceVersions: [
          {
            id: licenceVersion.id,
            issueDate: null,
            licenceId: licence.id,
            startDate: new Date('2022-05-01'),
            status: 'current'
          }
        ],
        revokedDate: null
      })
    })
  })

  describe('when there is not a matching licence', () => {
    it('returns undefined', async () => {
      const result = await FetchLicenceService(generateUUID())

      expect(result).toBeUndefined()
    })
  })
})
