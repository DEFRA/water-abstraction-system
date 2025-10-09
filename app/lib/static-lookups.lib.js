'use strict'

const billRunTypes = ['annual', 'supplementary', 'two_part_tariff']

const companyTypes = ['person', 'organisation']

const contactTypes = ['person', 'department']

const countries = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Anguilla',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bermuda',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'British Indian Ocean Territory',
  'British Virgin Islands',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Cape Verde',
  'Cayman Islands',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo',
  'Congo (Democratic Republic)',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czechia',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'East Timor',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Falkland Islands',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Georgia',
  'Germany',
  'Ghana',
  'Gibraltar',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Ivory Coast',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Kosovo',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Montserrat',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'North Korea',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Pitcairn, Henderson, Ducie and Oeno Islands',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Georgia and the South Sandwich Islands',
  'South Korea',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'St Helena, Ascension and Tristan da Cunha',
  'St Kitts and Nevis',
  'St Lucia',
  'St Vincent',
  'Sudan',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'The Bahamas',
  'The Gambia',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Turks and Caicos Islands',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe'
]

const engineTriggers = { both: 'both', current: 'current', old: 'old', neither: 'neither' }

const naldAreaCodes = {
  ARCA: 'Central',
  AREA: 'Eastern',
  ARNA: 'Northern',

  DALES: 'Dales',
  NAREA: 'Northumbria',
  RIDIN: 'Ridings',

  NWCEN: 'Central',
  NWNTH: 'North',
  NWSTH: 'South',

  AGY2N: 'West',
  AGY2S: 'West',
  AGY3N: 'North East',
  AGY3S: 'North East',
  AGY4N: 'South East',
  AGY4S: 'South East',

  MIDLS: 'Lower Severn',
  MIDLT: 'Lower Trent',
  MIDUS: 'Upper Severn',
  MIDUT: 'Upper Trent',

  HAAR: 'Hampshire & Isle of Wight',
  KAEA: 'Kent',
  SAAR: 'Sussex',

  AACOR: 'Cornwall',
  AADEV: 'Devon',
  AANWX: 'North Wessex',
  AASWX: 'South Wessex',

  N: 'Northern',
  SE: 'South East'
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

const NoticeJourney = Object.freeze({ STANDARD: 'standard', ALERTS: 'alerts' })

const NoticeType = Object.freeze({
  ABSTRACTION_ALERTS: 'abstractionAlerts',
  INVITATIONS: 'invitations',
  PAPER_RETURN: 'paperReturn',
  REMINDERS: 'reminders'
})

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

/**
 * Conversion multipliers to normalise flow units to litres per day (L/d) and level units to metres (m)
 */
const unitConversion = {
  'Ml/d': 1_000_000,
  'm3/d': 1_000,
  'm3/s': 86_400_000,
  'l/s': 86_400,
  gpd: 3.78541,
  Mgpd: 3_785_410,
  'ft3/s': 28_316.8466 * 86400,
  m: 1,
  mAOD: 1,
  mASD: 1,
  mBOD: 1,
  SLD: 1
}

const unitNames = {
  CUBIC_METRES: 'm³',
  LITRES: 'l',
  MEGALITRES: 'Ml',
  GALLONS: 'gal'
}

const returnUnits = {
  [unitNames.CUBIC_METRES]: { multiplier: 1, label: 'cubic metres', name: 'cubic-metres' },
  [unitNames.LITRES]: { multiplier: 1000, label: 'litres', name: 'litres' },
  [unitNames.MEGALITRES]: { multiplier: 0.001, label: 'megalitres', name: 'megalitres' },
  [unitNames.GALLONS]: { multiplier: 219.969248299, label: 'gallons', name: 'gallons' }
}

const sources = ['nald', 'wrls']

const thresholdUnits = {
  MEGALITRES_PER_DAY: { value: 'Ml/d', label: 'megalitres per day' },
  CUBIC_METRES_PER_SECOND: { value: 'm3/s', label: 'cubic metres per second' },
  CUBIC_METRES_PER_DAY: { value: 'm3/d', label: 'cubic metres per day' },
  LITRES_PER_SECOND: { value: 'l/s', label: 'litres per second' },
  METRES_ABOVE_ORDNANCE_DATUM: { value: 'mAOD', label: 'metres above ordnance datum' },
  METRES_BELOW_ORDNANCE_DATUM: { value: 'mBOD', label: 'metres below ordnance datum' },
  METRES_ABOVE_SEA_DATUM: { value: 'mASD', label: 'metres above sea datum' },
  METRES: { value: 'm', label: 'metres' },
  SOUTH_LEVEL_DATUM: { value: 'SLD', label: 'south level datum' },
  CUBIC_FOOT_PER_SECOND: { value: 'ft3/s', label: 'cubic foot per second' },
  GALLONS_PER_DAY: { value: 'gpd', label: 'gallons per day' },
  MILLION_GALLONS_PER_DAY: { value: 'Mgpd', label: 'million gallons per day' }
}

const flowUnits = [
  thresholdUnits.MEGALITRES_PER_DAY.value,
  thresholdUnits.CUBIC_METRES_PER_SECOND.value,
  thresholdUnits.CUBIC_METRES_PER_DAY.value,
  thresholdUnits.LITRES_PER_SECOND.value,
  thresholdUnits.CUBIC_FOOT_PER_SECOND.value,
  thresholdUnits.GALLONS_PER_DAY.value,
  thresholdUnits.MILLION_GALLONS_PER_DAY.value
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
  'unable-to-match-return': 'Unable to match return',
  'multiple-issues': 'Multiple issues'
}

module.exports = {
  billRunTypes,
  companyTypes,
  contactTypes,
  countries,
  engineTriggers,
  flowUnits,
  naldAreaCodes,
  naldRegions,
  NoticeJourney,
  NoticeType,
  organisationTypes,
  returnCycleDates,
  returnPeriodDates,
  returnRequirementFrequencies,
  returnRequirementReasons,
  returnUnits,
  sources,
  thresholdUnits,
  twoPartTariffReviewIssues,
  quarterlyReturnPeriods,
  unitConversion,
  unitNames
}
