'use strict'

const billRunTypes = [
  'annual',
  'supplementary',
  'two_part_tariff'
]

const companyTypes = [
  'person',
  'organisation'
]

const contactTypes = [
  'person',
  'department'
]

const organisationTypes = [
  'individual',
  'limitedCompany',
  'limitedLiabilityPartnership',
  'publicLimitedCompany'
]

const sources = [
  'nald',
  'wrls'
]

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
  'unable-to-match-return': 'Unable to match return'
}

module.exports = {
  billRunTypes,
  companyTypes,
  contactTypes,
  organisationTypes,
  sources,
  twoPartTariffReviewIssues
}
