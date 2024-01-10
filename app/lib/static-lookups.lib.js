'use strict'

const billRunTypes = [
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

const reasonNewRequirementsFields = [
  'abstraction_below_100_cubic_metres_per_day',
  'returns_exception',
  'transfer_licence'
]

module.exports = {
  billRunTypes,
  companyTypes,
  contactTypes,
  organisationTypes,
  reasonNewRequirementsFields,
  sources
}
