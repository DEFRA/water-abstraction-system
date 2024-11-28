'use strict'

const billRunTypes = ['annual', 'supplementary', 'two_part_tariff']

const companyTypes = ['person', 'organisation']

const contactTypes = ['person', 'department']

const monthsAsIntegers = {
  january: 0
}

const organisationTypes = ['individual', 'limitedCompany', 'limitedLiabilityPartnership', 'publicLimitedCompany']

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
  organisationTypes,
  returnCycleDates,
  returnRequirementFrequencies,
  returnRequirementReasons,
  naldRegions,
  sources,
  twoPartTariffReviewIssues,
  monthsAsIntegers
}
