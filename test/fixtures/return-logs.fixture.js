'use strict'

/**
 * Represents a complete response from `FetchCurrentReturnCycleService`
 *
 * @returns {object}
 */
function returnCycle() {
  return {
    id: '6889b98d-964f-4966-b6d6-bf511d6526a1',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2025-03-31'),
    dueDate: new Date('2025-04-28'),
    summer: false,
    submittedInWrls: true
  }
}

/**
 * Represents a result from either `FetchReturnRequirementsService` or
 * `FetchLicenceReturnRequirementsService`
 *
 * @returns {object}
 */
function returnRequirement() {
  return {
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
}

module.exports = {
  returnCycle,
  returnRequirement
}
