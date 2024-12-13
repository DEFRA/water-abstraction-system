'use strict'

/**
 * Represents a complete response from `FetchCurrentReturnCycleService`
 *
 * @param {boolean} [summer=false] - true to return a summer return cycle else false
 *
 * @returns {object}
 */
function returnCycle(summer = false) {
  if (summer) {
    return returnCycles()[0]
  }

  return returnCycles()[1]
}

/**
 * Represents a list of return cycles from the database, as fetched in `ProcessLicenceReturnLogsService`
 *
 * @returns {object[]} an array of objects, each representing a return cycle
 */
function returnCycles() {
  return [
    {
      id: '4c5ff4dc-dfe0-4693-9cb5-acdebf6f76b4',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-10-31'),
      dueDate: new Date('2025-11-28'),
      summer: true,
      submittedInWrls: true
    },
    {
      id: '6889b98d-964f-4966-b6d6-bf511d6526a1',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      dueDate: new Date('2025-04-28'),
      summer: false,
      submittedInWrls: true
    }
  ]
}

/**
 * Represents a single result from either `FetchReturnRequirementsService` or
 * `FetchLicenceReturnRequirementsService`
 *
 * @param {boolean} [summer=false] - true to return a summer requirement else false
 * @returns {object}
 */
function returnRequirement(summer = false) {
  if (summer) {
    return returnRequirements()[0]
  }

  return returnRequirements()[1]
}

/**
 * Represents multiple results from either `FetchReturnRequirementsService` or
 * `FetchLicenceReturnRequirementsService`
 *
 * @returns {object[]}
 */
function returnRequirements() {
  return [
    {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 10,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 5,
      externalId: '4:16999652',
      id: '3bc0e31a-4bfb-47ef-aa6e-8aca37d9aac2',
      legacyId: 16999651,
      reportingFrequency: 'day',
      returnVersionId: '5a077661-05fc-4fc4-a2c6-d84ec908f093',
      siteDescription: 'PUMP AT TINTAGEL',
      summer: true,
      twoPartTariff: false,
      upload: false,
      returnVersion: {
        endDate: null,
        id: '5a077661-05fc-4fc4-a2c6-d84ec908f093',
        reason: 'new-licence',
        startDate: new Date('2022-04-01'),
        licence: {
          expiredDate: null,
          id: '3acf7d80-cf74-4e86-8128-13ef687ea091',
          lapsedDate: null,
          licenceRef: '01/25/90/3242',
          revokedDate: null,
          areacode: 'SAAR',
          region: {
            id: 'eb57737f-b309-49c2-9ab6-f701e3a6fd96',
            naldRegionId: 4
          }
        }
      },
      points: [
        {
          description: 'Summer cycle - live licence - live return version - summer return requirement',
          ngr1: 'TG 713 291',
          ngr2: null,
          ngr3: null,
          ngr4: null
        }
      ],
      returnRequirementPurposes: [
        {
          alias: 'Purpose alias for testing',
          id: '8a5164fd-1705-45bd-a01c-6b09d066e403',
          primaryPurpose: {
            description: 'Agriculture',
            id: 'b6bb3b77-cfe8-4f22-8dc9-e92713ca3156',
            legacyId: 'A'
          },
          purpose: {
            description: 'General Farming & Domestic',
            id: '289d1644-5215-4a20-af9e-5664fa9a18c7',
            legacyId: '140'
          },
          secondaryPurpose: {
            description: 'General Agriculture',
            id: '2457bfeb-a120-4b57-802a-46494bd22f82',
            legacyId: 'AGR'
          }
        }
      ]
    },
    {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 3,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 4,
      externalId: '4:16999651',
      id: '4bc1efa7-10af-4958-864e-32acae5c6fa4',
      legacyId: 16999651,
      reportingFrequency: 'day',
      returnVersionId: '5a077661-05fc-4fc4-a2c6-d84ec908f093',
      siteDescription: 'BOREHOLE AT AVALON',
      summer: false,
      twoPartTariff: false,
      upload: false,
      returnVersion: {
        endDate: null,
        id: '5a077661-05fc-4fc4-a2c6-d84ec908f093',
        reason: 'new-licence',
        startDate: new Date('2022-04-01'),
        licence: {
          expiredDate: null,
          id: '3acf7d80-cf74-4e86-8128-13ef687ea091',
          lapsedDate: null,
          licenceRef: '01/25/90/3242',
          revokedDate: null,
          areacode: 'SAAR',
          region: {
            id: 'eb57737f-b309-49c2-9ab6-f701e3a6fd96',
            naldRegionId: 4
          }
        }
      },
      points: [
        {
          description: 'Winter cycle - live licence - live return version - winter return requirement',
          ngr1: 'TG 713 291',
          ngr2: null,
          ngr3: null,
          ngr4: null
        }
      ],
      returnRequirementPurposes: [
        {
          alias: 'Purpose alias for testing',
          id: '06c4c2f2-3dff-4053-bbc8-e6f64cd39623',
          primaryPurpose: {
            description: 'Agriculture',
            id: 'b6bb3b77-cfe8-4f22-8dc9-e92713ca3156',
            legacyId: 'A'
          },
          purpose: {
            description: 'General Farming & Domestic',
            id: '289d1644-5215-4a20-af9e-5664fa9a18c7',
            legacyId: '140'
          },
          secondaryPurpose: {
            description: 'General Agriculture',
            id: '2457bfeb-a120-4b57-802a-46494bd22f82',
            legacyId: 'AGR'
          }
        }
      ]
    }
  ]
}

module.exports = {
  returnCycle,
  returnCycles,
  returnRequirement,
  returnRequirements
}
