// Test helpers
import * as LicenceHelper from '../../support/helpers/licence.helper.js'
import * as LicenceVersionHelper from '../../support/helpers/licence-version.helper.js'
import * as LicenceVersionPurposeHelper from '../../support/helpers/licence-version-purpose.helper.js'
import * as LicenceVersionPurposePointHelper from '../../support/helpers/licence-version-purpose-point.helper.js'
import * as PointHelper from '../../support/helpers/point.helper.js'
import * as PurposeHelper from '../../support/helpers/purpose.helper.js'
import * as SourceHelper from '../../support/helpers/source.helper.js'

// Thing under test
import FetchPurposesService from '../../../app/services/licences/fetch-purposes.service.js'

describe('Licences - Fetch Purposes service', () => {
  let licence
  let licenceVersion
  let licenceVersionPurpose
  let licenceVersionPurposePoint
  let point
  let purpose
  let source

  describe('when the licence has licence versions, licence version purposes, points, purposes, and sources', () => {
    beforeAll(async () => {
      licence = await LicenceHelper.add()

      licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })

      purpose = await PurposeHelper.select()

      licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      source = await SourceHelper.select()
      point = await PointHelper.add({ sourceId: source.id })

      licenceVersionPurposePoint = await LicenceVersionPurposePointHelper.add({
        abstractionMethod: 'Unspecified Pump',
        licenceVersionPurposeId: licenceVersionPurpose.id,
        pointId: point.id
      })
    })

    afterAll(async () => {
      await licence.$query().delete()
      await licenceVersion.$query().delete()
      await licenceVersionPurpose.$query().delete()
      await licenceVersionPurposePoint.$query().delete()
      await point.$query().delete()
    })

    it('returns the matching licence version purposes, points, purposes, and sources', async () => {
      const result = await FetchPurposesService(licence.id)

      expect(result).toEqual([
        {
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 1,
          annualQuantity: null,
          dailyQuantity: null,
          hourlyQuantity: null,
          instantQuantity: null,
          licenceVersionPurposePoints: [
            {
              abstractionMethod: 'Unspecified Pump'
            }
          ],
          points: [
            {
              description: point.description,
              id: point.id,
              ngr1: point.ngr1,
              ngr2: null,
              ngr3: null,
              ngr4: null,
              source: {
                description: source.description,
                id: source.id
              }
            }
          ],
          purpose: {
            description: purpose.description,
            id: purpose.id
          }
        }
      ])
    })
  })

  describe('when the licence has no current licence versions', () => {
    beforeAll(async () => {
      licence = await LicenceHelper.add()
    })

    afterAll(async () => {
      await licence.$query().delete()
    })

    it('returns an empty array', async () => {
      const result = await FetchPurposesService(licence.id)

      expect(result).toEqual([])
    })
  })

  describe('when the licence has licence versions but no licence version purposes, points or purposes', () => {
    beforeAll(async () => {
      licence = await LicenceHelper.add()

      licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })
    })

    afterAll(async () => {
      await licence.$query().delete()
      await licenceVersion.$query().delete()
    })

    it('returns an empty array', async () => {
      const result = await FetchPurposesService(licence.id)

      expect(result).toEqual([])
    })
  })
})
