// Test helpers
import LicenceHelper from '../../support/helpers/licence.helper.js'
import LicenceVersionHelper from '../../support/helpers/licence-version.helper.js'
import LicenceVersionPurposeHelper from '../../support/helpers/licence-version-purpose.helper.js'
import LicenceVersionPurposePointHelper from '../../support/helpers/licence-version-purpose-point.helper.js'
import PointHelper from '../../support/helpers/point.helper.js'
import SourceHelper from '../../support/helpers/source.helper.js'

// Thing under test
import FetchPointsService from '../../../app/services/licences/fetch-points.service.js'

describe('Licences - Fetch Points service', () => {
  let licence
  let licenceVersion
  let licenceVersionPurpose
  let licenceVersionPurposePoint
  let point
  let source

  beforeAll(async () => {
    licence = await LicenceHelper.add()

    licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })

    licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
      licenceVersionId: licenceVersion.id
    })

    source = await SourceHelper.select()
    point = await PointHelper.add({
      bgsReference: 'TL 14/123',
      category: 'Single Point',
      depth: 123,
      description: 'RIVER OUSE AT BLETSOE',
      hydroInterceptDistance: 8.01,
      hydroReference: 'TL 14/133',
      hydroOffsetDistance: 5.56,
      locationNote: 'Castle Farm, The Loke, Gresham, Norfolk',
      ngr1: 'SD 963 193',
      ngr2: 'SD 963 193',
      ngr3: 'SD 963 193',
      ngr4: 'SD 963 193',
      note: 'WELL IS SPRING-FED',
      primaryType: 'Groundwater',
      secondaryType: 'Borehole',
      sourceId: source.id,
      wellReference: '81312'
    })

    licenceVersionPurposePoint = await LicenceVersionPurposePointHelper.add({
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

  describe('when the licence has licence versions, licence version purposes, points, and sources', () => {
    it('returns the points and source', async () => {
      const result = await FetchPointsService(licence.id)

      expect(result).toEqual([
        {
          bgsReference: 'TL 14/123',
          category: 'Single Point',
          depth: 123,
          description: 'RIVER OUSE AT BLETSOE',
          hydroInterceptDistance: 8.01,
          hydroReference: 'TL 14/133',
          hydroOffsetDistance: 5.56,
          pointId: point.id,
          locationNote: 'Castle Farm, The Loke, Gresham, Norfolk',
          ngr1: 'SD 963 193',
          ngr2: 'SD 963 193',
          ngr3: 'SD 963 193',
          ngr4: 'SD 963 193',
          note: 'WELL IS SPRING-FED',
          primaryType: 'Groundwater',
          secondaryType: 'Borehole',
          wellReference: '81312',
          sourceDescription: source.description,
          sourceType: source.sourceType
        }
      ])
    })
  })
})
