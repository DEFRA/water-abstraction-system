// Test framework dependencies

// Things we need to stub
import * as FetchExistingRequirementsService from '../../../../../app/services/return-versions/setup/existing/fetch-existing-requirements.service.js'

// Thing under test
import GenerateFromExistingRequirementsService from '../../../../../app/services/return-versions/setup/existing/generate-from-existing-requirements.service.js'

describe('Return Versions Setup - Generate From Existing Requirements service', () => {
  const returnVersionId = '7af310df-8bd1-476e-8476-eac7ce4153e9'

  let fetchResult

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a matching return version exists', () => {
    describe('and "multipleUpload" has been set', () => {
      beforeEach(() => {
        fetchResult = _fetchResult(returnVersionId)

        vi.spyOn(FetchExistingRequirementsService, 'default').mockResolvedValue(fetchResult)
      })

      it('returns the saved value', async () => {
        const result = await GenerateFromExistingRequirementsService(returnVersionId)

        expect(result.multipleUpload).toBe(false)
      })
    })

    describe('and "quarterlyReturns" has been set', () => {
      beforeEach(() => {
        fetchResult = _fetchResult(returnVersionId)

        vi.spyOn(FetchExistingRequirementsService, 'default').mockResolvedValue(fetchResult)
      })

      it('returns the saved value', async () => {
        const result = await GenerateFromExistingRequirementsService(returnVersionId)

        expect(result.quarterlyReturns).toBe(false)
      })
    })

    describe('and all its return requirements have a site description', () => {
      beforeEach(() => {
        fetchResult = _fetchResult(returnVersionId)

        vi.spyOn(FetchExistingRequirementsService, 'default').mockResolvedValue(fetchResult)
      })

      it('returns the details of its return requirements transformed for use in the journey', async () => {
        const result = await GenerateFromExistingRequirementsService(returnVersionId)

        expect(result.requirements).toEqual([
          {
            points: [fetchResult.returnRequirements[0].points[0].id],
            purposes: [
              {
                alias: fetchResult.returnRequirements[0].returnRequirementPurposes[0].alias,
                description: 'Spray Irrigation - Storage',
                id: fetchResult.returnRequirements[0].returnRequirementPurposes[0].purposeId
              }
            ],
            returnsCycle: 'winter-and-all-year',
            siteDescription: 'FIRST BOREHOLE AT AVALON',
            abstractionPeriod: {
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4
            },
            frequencyReported: 'week',
            frequencyCollected: 'week',
            agreementsExceptions: ['none']
          },
          {
            points: [fetchResult.returnRequirements[1].points[0].id],
            purposes: [
              {
                alias: '',
                description: 'Spray Irrigation - Storage',
                id: fetchResult.returnRequirements[1].returnRequirementPurposes[0].purposeId
              }
            ],
            returnsCycle: 'summer',
            siteDescription: 'SECOND BOREHOLE AT AVALON',
            abstractionPeriod: {
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4
            },
            frequencyReported: 'month',
            frequencyCollected: 'week',
            agreementsExceptions: [
              '56-returns-exception',
              'gravity-fill',
              'transfer-re-abstraction-scheme',
              'two-part-tariff'
            ]
          }
        ])
      })
    })

    describe('but one of its return requirements does not have a site description', () => {
      beforeEach(() => {
        fetchResult = _fetchResult()
        fetchResult.returnRequirements[1].siteDescription = null

        vi.spyOn(FetchExistingRequirementsService, 'default').mockResolvedValue(fetchResult)
      })

      it('returns the details of its return requirements transformed, falling back to point description for the missing site description', async () => {
        const result = await GenerateFromExistingRequirementsService(returnVersionId)

        expect(result.requirements).toEqual([
          {
            points: [fetchResult.returnRequirements[0].points[0].id],
            purposes: [
              {
                alias: fetchResult.returnRequirements[0].returnRequirementPurposes[0].alias,
                description: 'Spray Irrigation - Storage',
                id: fetchResult.returnRequirements[0].returnRequirementPurposes[0].purposeId
              }
            ],
            returnsCycle: 'winter-and-all-year',
            siteDescription: 'FIRST BOREHOLE AT AVALON',
            abstractionPeriod: {
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4
            },
            frequencyReported: 'week',
            frequencyCollected: 'week',
            agreementsExceptions: ['none']
          },
          {
            points: [fetchResult.returnRequirements[1].points[0].id],
            purposes: [
              {
                alias: '',
                description: 'Spray Irrigation - Storage',
                id: fetchResult.returnRequirements[1].returnRequirementPurposes[0].purposeId
              }
            ],
            returnsCycle: 'summer',
            siteDescription: 'WELL AT WELLINGTON',
            abstractionPeriod: {
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4
            },
            frequencyReported: 'month',
            frequencyCollected: 'week',
            agreementsExceptions: [
              '56-returns-exception',
              'gravity-fill',
              'transfer-re-abstraction-scheme',
              'two-part-tariff'
            ]
          }
        ])
      })
    })
  })

  describe('when a matching return version does not exist', () => {
    it('throws an error', async () => {
      await expect(GenerateFromExistingRequirementsService('6d436e7b-c3c9-493c-97f3-b397c899c926')).rejects.toThrow()
    })
  })
})

function _fetchResult(returnVersionId) {
  return {
    id: returnVersionId,
    multipleUpload: false,
    quarterlyReturns: false,
    returnRequirements: [
      {
        id: 'b8c8e40f-2557-4ce5-8fd9-fd7f6bb71c30',
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        collectionFrequency: 'week',
        fiftySixException: false,
        gravityFill: false,
        reabstraction: false,
        reportingFrequency: 'week',
        siteDescription: 'FIRST BOREHOLE AT AVALON',
        summer: false,
        twoPartTariff: false,
        points: [
          {
            id: '8be0bf17-ba9b-465f-b660-b732f0a131df',
            description: 'WELL AT WELLINGTON'
          }
        ],
        returnRequirementPurposes: [
          {
            id: 'f0709035-4f2a-4294-b4ac-dbd2c47a955f',
            alias: 'I have an alias',
            purposeId: 'da576426-70bc-4f76-b05b-849bba48a8e8',
            purpose: {
              id: 'da576426-70bc-4f76-b05b-849bba48a8e8',
              description: 'Spray Irrigation - Storage'
            }
          }
        ]
      },
      {
        id: '01674d01-f54a-4631-9fe6-76d429e2a823',
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        collectionFrequency: 'week',
        fiftySixException: true,
        gravityFill: true,
        reabstraction: true,
        reportingFrequency: 'month',
        siteDescription: 'SECOND BOREHOLE AT AVALON',
        summer: true,
        twoPartTariff: true,
        points: [
          {
            id: 'e535dfb8-3720-41aa-824d-6a6942d65650',
            description: 'WELL AT WELLINGTON'
          }
        ],
        returnRequirementPurposes: [
          {
            id: '2a6b8b21-6449-4353-8f6f-93457395f7a6',
            alias: null,
            purposeId: 'da576426-70bc-4f76-b05b-849bba48a8e8',
            purpose: {
              id: 'da576426-70bc-4f76-b05b-849bba48a8e8',
              description: 'Spray Irrigation - Storage'
            }
          }
        ]
      }
    ]
  }
}
