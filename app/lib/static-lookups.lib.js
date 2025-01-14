'use strict'

const billRunTypes = ['annual', 'supplementary', 'two_part_tariff']

const companyTypes = ['person', 'organisation']

const contactTypes = ['person', 'department']

const engineTriggers = { both: 'both', current: 'current', old: 'old', neither: 'neither' }

/**
 * NALD region prefix from import.NALD_ABS_LICENCES.AREP_EIUC_CODE will be mapped to one of the below regions
 *
 */
const naldRegions = {
  AN: 'Anglian',
  MD: 'Midlands',
  NO: 'Northumbria',
  NW: 'North West',
  SO: 'Southern',
  SW: 'South West (incl Wessex)',
  TH: 'Thames',
  WL: 'Wales',
  YO: 'Yorkshire'
}

const organisationTypes = ['individual', 'limitedCompany', 'limitedLiabilityPartnership', 'publicLimitedCompany']

/**
 * The start, end and due dates for each return cycle
 */
const returnCycleDates = {
  allYear: {
    dueDate: { day: 28, month: 3 },
    endDate: { day: 31, month: 2 },
    startDate: { day: 1, month: 3 }
  },
  summer: {
    dueDate: { day: 28, month: 10 },
    endDate: { day: 31, month: 9 },
    startDate: { day: 1, month: 10 }
  }
}

/**
 * The start, end and due dates for each quarterly return period
 */
const quarterlyReturnPeriods = {
  quarterOne: {
    dueDate: { day: 28, month: 6 },
    endDate: { day: 30, month: 5 },
    startDate: { day: 1, month: 3 }
  },
  quarterTwo: {
    dueDate: { day: 28, month: 9 },
    endDate: { day: 30, month: 8 },
    startDate: { day: 1, month: 6 }
  },
  quarterThree: {
    dueDate: { day: 28, month: 0 },
    endDate: { day: 31, month: 11 },
    startDate: { day: 1, month: 9 }
  },
  quarterFour: {
    dueDate: { day: 28, month: 3 },
    endDate: { day: 31, month: 2 },
    startDate: { day: 1, month: 0 }
  }
}

/**
 * An object defining the return periods / cycles with their respective start dates, end dates, and due dates.
 *
 * Each period / cycle is represented with the following properties:
 * - `startDate`: The starting date of the period (day and month).
 * - `endDate`: The ending date of the period (day and month).
 * - `dueDate`: The due date for the period (day and month).
 *
 * Months are zero-based, where January = 0, February = 1, ..., December = 11.
 *
 * | Name         | Start Date    | End Date      | Due Date       |
 * |--------------|---------------|---------------|----------------|
 * | Quarter One  | 1 January     | 31 March      | 28th April     |
 * | All Year     | 1 April       | 31 March      | 28th April     |
 * | Quarter Two  | 1 April       | 30 June       | 28th July      |
 * | Quarter Three| 1 July        | 30 September  | 28th October   |
 * | Quarter Four | 1 October     | 31 December   | 28th January   |
 * | Summer       | 1 November    | 31 October    | 28th November  |
 *
 */
const returnPeriodDates = {
  ...returnCycleDates,
  ...quarterlyReturnPeriods
}

const returnRequirementFrequencies = {
  day: 'daily',
  week: 'weekly',
  fortnight: 'fortnightly',
  month: 'monthly',
  quarter: 'quarterly',
  year: 'yearly'
}

const returnRequirementReasons = {
  'abstraction-below-100-cubic-metres-per-day': 'Abstraction amount below 100 cubic metres per day',
  'change-to-return-requirements': 'Change to requirements for returns',
  'change-to-special-agreement': 'Change to special agreement',
  'error-correction': 'Error correction',
  'extension-of-licence-validity': 'Limited extension of licence validity (LEV)',
  'licence-conditions-do-not-require-returns': 'Licence conditions do not require returns',
  'major-change': 'Major change',
  'minor-change': 'Minor change',
  'name-or-address-change': 'Licence holder name or address change',
  'new-licence': 'New licence',
  'new-licence-in-part-succession-or-licence-apportionment': 'New licence in part succession or licence apportionment',
  'new-special-agreement': 'New special agreement',
  'returns-exception': 'Returns exception',
  'succession-or-transfer-of-licence': 'Succession or transfer of licence',
  'succession-to-remainder-licence-or-licence-apportionment':
    'Succession to remainder licence or licence apportionment',
  'temporary-trade': 'Temporary trade',
  'transfer-and-now-chargeable': 'Licence transferred and now chargeable'
}

const unitNames = {
  CUBIC_METRES: 'm³',
  LITRES: 'l',
  MEGALITRES: 'Ml',
  GALLONS: 'gal'
}

const returnUnits = {
  [unitNames.CUBIC_METRES]: { multiplier: 1, label: 'cubic meters' },
  [unitNames.LITRES]: { multiplier: 1000, label: 'litres' },
  [unitNames.MEGALITRES]: { multiplier: 0.001, label: 'megalitres' },
  [unitNames.GALLONS]: { multiplier: 219.969248299, label: 'gallons' }
}

const sources = ['nald', 'wrls']

const twoPartTariffReviewIssues = {
  'abs-outside-period': 'Abstraction outside period',
  'aggregate-factor': 'Aggregate',
  'checking-query': 'Checking query',
  'no-returns-received': 'No returns received',
  'over-abstraction': 'Over abstraction',
  'overlap-of-charge-dates': 'Overlap of charge dates',
  'returns-received-not-processed': 'Returns received but not processed',
  'returns-late': 'Returns received late',
  'return-split-over-refs': 'Return split over charge references',
  'some-returns-not-received': 'Some returns not received',
  'unable-to-match-return': 'Unable to match return',
  'multiple-issues': 'Multiple issues'
}

module.exports = {
  billRunTypes,
  companyTypes,
  contactTypes,
  engineTriggers,
  naldRegions,
  organisationTypes,
  returnCycleDates,
  returnPeriodDates,
  returnRequirementFrequencies,
  returnRequirementReasons,
  returnUnits,
  sources,
  twoPartTariffReviewIssues,
  quarterlyReturnPeriods,
  unitNames
}
