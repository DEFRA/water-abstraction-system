'use strict'

const data = [
  {
    id: 'a71c352b-04a8-4f32-b349-929ec1607704',
    code: 'NSQ',
    subcode: 'M3FN',
    description: 'Non Standard Quantities',
    subcodeDescription: 'Cubic Metres Per Fortnight',
    displayTitle: 'Non standard quantities cubic metres per fortnight'
  },
  {
    id: '56729fac-cd3c-4136-8763-c9c6f8f7a85d',
    code: 'NSQ',
    subcode: 'M3WK',
    description: 'Non Standard Quantities',
    subcodeDescription: 'Cubic Metres Per Week',
    displayTitle: 'Non standard quantities cubic metres per week'
  },
  {
    id: 'f9dd5078-d365-45e3-be57-d9859c6d4599',
    code: 'NSQ',
    subcode: 'PER',
    description: 'Non Standard Quantities',
    subcodeDescription: 'Text Defined Periodicity',
    displayTitle: 'Non standard quantities'
  },
  {
    id: '875e9fde-67c2-42bb-8e0c-2033c78b0bbe',
    code: 'OTH',
    subcode: 'GEN',
    description: 'Other Standard Conditions',
    subcodeDescription: 'General',
    displayTitle: 'General conditions'
  },
  {
    id: '692bc351-5d50-427a-ad96-cd4328eb21d2',
    code: 'PTAK',
    subcode: 'COMP',
    description: 'Proportional Take',
    subcodeDescription: 'Complex',
    displayTitle: 'Complex proportional take'
  },
  {
    id: '047ae10c-85a9-4d92-890a-6e7c4c1d4153',
    code: 'PTAK',
    subcode: 'PCENT',
    description: 'Proportional Take',
    subcodeDescription: 'Percentage Take',
    displayTitle: 'Proportional percentage take'
  },
  {
    id: 'e25b9fa3-5038-4b83-8ed0-58648358a143',
    code: 'RAT',
    subcode: 'LPS',
    description: 'Rates',
    subcodeDescription: 'Litres Per Second',
    displayTitle: 'Rates litres per second'
  },
  {
    id: '4a142b01-5588-4dfc-9330-920c996babe0',
    code: 'RAT',
    subcode: 'M3D',
    description: 'Rates',
    subcodeDescription: 'M3 Per Day',
    displayTitle: 'Rates m3 per day'
  },
  {
    id: '98a1ad74-f753-4900-add8-e12779078f4a',
    code: 'RAT',
    subcode: 'M3M',
    description: 'Rates',
    subcodeDescription: 'M3 Per Month',
    displayTitle: 'Rates m3 per month'
  },
  {
    id: 'fe52f2df-8536-4865-b364-ff8b7e146928',
    code: 'RAT',
    subcode: 'M3S',
    description: 'Rates',
    subcodeDescription: 'M3 Per Second',
    displayTitle: 'Rates m3 per second'
  },
  {
    id: '60f41084-c014-4a0e-8036-f748390b7791',
    code: 'S57',
    subcode: 'BANI',
    description: 'Spray Irrigation',
    subcodeDescription: 'Ban Imposed',
    displayTitle: 'Spray irrigation ban imposed'
  },
  {
    id: '97f2634f-7357-4a43-b126-6a0d45eaf02c',
    code: 'S57',
    subcode: 'BANP',
    description: 'Spray Irrigation',
    subcodeDescription: 'Ban Proposed',
    displayTitle: 'Spray irrigation ban proposed'
  },
  {
    id: '03a6f321-f726-4835-9625-6aa593b06cda',
    code: 'XREG',
    subcode: 'PTS',
    description: 'Cross Regional Point',
    subcodeDescription: 'Licensed Point Falls Within Another Region',
    displayTitle: 'Licensed point falls within another region'
  },
  {
    id: '8187812c-0533-4b0f-8433-3f5b2f463f86',
    code: 'AGG',
    subcode: 'LLX',
    description: 'Aggregate',
    subcodeDescription: 'Licence To Licence; Cross Regional Condition Link Between Licences',
    displayTitle: 'Aggregate condition cross regional link between licences'
  },
  {
    id: '265497c2-d3fb-41ab-9167-c3204fce3e3c',
    code: 'PWS',
    subcode: 'WSL',
    description: 'Public Water Supply',
    subcodeDescription: 'Water Supply Licensee',
    displayTitle: 'Public water supply licensee'
  },
  {
    id: '54df1201-b6a1-4909-ae29-cc1a3d93e469',
    code: 'EEL',
    subcode: 'REGS',
    description: 'Eel Regulations',
    subcodeDescription: 'Pass/Screen - Eel Regs SI3344',
    displayTitle: 'Fish pass/screen - eel regs SI3344'
  },
  {
    id: '31dde8db-de9a-4b41-abd8-2efc88d6db68',
    code: 'DEROG',
    subcode: 'CLAUS',
    description: 'Derogation',
    subcodeDescription: 'Derogation Clause',
    displayTitle: 'Derogation clause'
  },
  {
    id: '03abbecd-2445-4209-a96c-fe4c9a857065',
    code: 'TLTD',
    subcode: 'LEVFL',
    description: 'Time Limited',
    subcodeDescription: 'Limited Extension of Validity - Full Licence Expiry',
    displayTitle: 'Time Limited Extension of Validity - Full Licence Expiry'
  },
  {
    id: '0afdae8f-4fc9-4623-83a9-246ca862047f',
    code: 'TLTD',
    subcode: 'LEVTL',
    description: 'Time Limited',
    subcodeDescription: 'Limited Extension of Validity - Time Limited Variation',
    displayTitle: 'Time Limited Extension of Validity - Time Limited Variation'
  },
  {
    id: '478dc963-46d6-4464-862c-283d3991fd63',
    code: 'AGG',
    subcode: 'LLL',
    description: 'Aggregate',
    subcodeDescription: 'Licence To Licence; Link Between Licences',
    displayTitle: 'Aggregate condition link between licences'
  },
  {
    id: '1617d5f0-8ad0-443f-a897-318260db88f1',
    code: 'CES',
    subcode: 'CHE',
    description: 'Cessation Condition',
    subcodeDescription: 'Chemical',
    displayTitle: 'Chemical cessation condition'
  },
  {
    id: '7f53fb27-9002-43b1-8b0f-04a338ab7333',
    code: 'CES',
    subcode: 'DEP',
    description: 'Cessation Condition',
    subcodeDescription: 'Dependent On Release From Schemes/Other Licences',
    displayTitle: 'Cessation dependant on releases from schemes / other licences'
  },
  {
    id: 'f2c1072f-6654-44c9-80c5-683c446ac87f',
    code: 'CES',
    subcode: 'FLOW',
    description: 'Cessation Condition',
    subcodeDescription: 'Flow',
    displayTitle: 'Flow cessation condition'
  },
  {
    id: '259db7c3-00cd-4f42-86a8-996d470f700c',
    code: 'CES',
    subcode: 'GWL',
    description: 'Cessation Condition',
    subcodeDescription: 'Groundwater Level',
    displayTitle: 'Groundwater level cessation condition'
  },
  {
    id: 'f5dc9b11-3a7b-4d91-9113-bdb41289a43d',
    code: 'CES',
    subcode: 'LEV',
    description: 'Cessation Condition',
    subcodeDescription: 'Level',
    displayTitle: 'Level cessation condition'
  },
  {
    id: '3bf80bb2-cbba-4897-a1f1-f1b3055930f7',
    code: 'CES',
    subcode: 'POL',
    description: 'Cessation Condition',
    subcodeDescription: 'Political - Hosepipe Ban',
    displayTitle: 'Political cessation condition'
  },
  {
    id: 'b4d445c9-1ea0-4918-b97b-48e8c4496fb0',
    code: 'AGG',
    subcode: 'LPL',
    description: 'Aggregate',
    subcodeDescription: 'Licence To Purpose; Link Between Different Licences',
    displayTitle: 'Aggregate condition licence to purpose between different licences'
  },
  {
    id: '8f118be4-c132-4d96-8c0a-f2918cdd371b',
    code: 'BYPAS',
    subcode: 'FLOW',
    description: 'By-Pass Flow',
    subcodeDescription: 'Flow',
    displayTitle: 'By-pass flow'
  },
  {
    id: 'b942a057-5da1-4382-926f-ae3fa98cb484',
    code: 'COMB',
    subcode: 'LINK',
    description: 'Condition To Indicate Licence  Split On Nald',
    subcodeDescription: 'Link Between Split Licences',
    displayTitle: 'Link between split licences'
  },
  {
    id: '558d51fa-e84b-4a49-b85c-3cd1f017abe1',
    code: 'COMP',
    subcode: 'GEN',
    description: 'Complex Condition',
    subcodeDescription: 'General',
    displayTitle: 'Complex condition'
  },
  {
    id: 'a111a541-b3b8-48e3-a405-1fe0efa5f9a9',
    code: 'COMPR',
    subcode: 'FLOW',
    description: 'Compensation Release',
    subcodeDescription: 'Flow',
    displayTitle: 'Flow compensation release'
  },
  {
    id: '8c059046-2a0b-498a-b9a6-053159cd14c5',
    code: 'FILL',
    subcode: 'FILL',
    description: 'Filling/Emptying Clause',
    subcodeDescription: 'Filling/Emptying To Be Notified To Agency',
    displayTitle: 'Filling/emptying to be notified to Agency'
  },
  {
    id: '32618825-4fda-474e-b6e3-33b9ab4ea708',
    code: 'FILL',
    subcode: 'SEAS',
    description: 'Filling/Emptying Clause',
    subcodeDescription: 'Filling/Emptying Season Limited',
    displayTitle: 'Filling/emptying season limited'
  },
  {
    id: '965bbf07-06c9-4b25-8f0c-755a83dfb27a',
    code: 'INFLO',
    subcode: 'TYPE',
    description: 'Inflow Control',
    subcodeDescription: 'Control Type',
    displayTitle: 'Inflow control type'
  },
  {
    id: '7e2da099-3a5f-45b6-94f4-8e9f677fa095',
    code: 'LINTY',
    subcode: 'TYPE',
    description: 'Type Of Lining',
    subcodeDescription: 'Type',
    displayTitle: 'Type of lining'
  },
  {
    id: '2410d74c-5f7b-4c1f-bd1c-1f67d63a5cd0',
    code: 'LOK',
    subcode: 'OFF',
    description: 'Lockable Structures Required',
    subcodeDescription: 'Locked',
    displayTitle: 'Lockable structures required'
  },
  {
    id: 'edcf5946-6e1d-41e4-97b2-39e7ee3e705d',
    code: 'MAINT',
    subcode: 'FLOW',
    description: 'Maintained Flow',
    subcodeDescription: 'Flow',
    displayTitle: 'Maintained flow'
  },
  {
    id: '769d0915-04c8-4838-9da4-9986f4677f4f',
    code: 'MCOMP',
    subcode: 'MEANS',
    description: 'Means Of Compensation Flow Release',
    subcodeDescription: 'Means',
    displayTitle: 'Means of compensation flow release'
  },
  {
    id: '4339796c-fc0e-41a8-9ea8-f3502529cf92',
    code: 'NSQ',
    subcode: 'M3MO',
    description: 'Non Standard Quantities',
    subcodeDescription: 'Cubic Metres Per Month',
    displayTitle: 'Non standard quantities cubic metres per month'
  },
  {
    id: 'e8807cab-124d-47c9-9b19-4efb2c35e213',
    code: 'TRA',
    subcode: 'TRAN',
    description: 'Transfer',
    subcodeDescription: 'Transfer',
    displayTitle: 'Transfer'
  },
  {
    id: '8501db0e-8227-43a4-bd21-a5d4857e2506',
    code: 'WLM',
    subcode: 'GW',
    description: 'Water Level Monitoring',
    subcodeDescription: 'Ground Water',
    displayTitle: 'Water level monitoring groundwater'
  },
  {
    id: '91777b9d-3df0-40a8-a5e6-115f543c0908',
    code: 'WLM',
    subcode: 'SW',
    description: 'Water Level Monitoring',
    subcodeDescription: 'Surface Water',
    displayTitle: 'Water level monitoring surface water'
  },
  {
    id: '629e6598-40a5-4d62-8229-cf1264c35bff',
    code: 'WQM',
    subcode: 'GW',
    description: 'Water Quality Monitoring',
    subcodeDescription: 'Groundwater',
    displayTitle: 'Water quality monitoring groundwater'
  },
  {
    id: '6fd1ad95-6755-430a-b32b-d9adbb0ba476',
    code: 'WQM',
    subcode: 'SW',
    description: 'Water Quality Monitoring',
    subcodeDescription: 'Surface Water',
    displayTitle: 'Water quality monitoring surface water'
  },
  {
    id: '3b2c530b-0d81-44b7-9b12-752e458a0ae6',
    code: 'TLTD',
    subcode: 'VAR',
    description: 'Time Limited',
    subcodeDescription: 'Variation',
    displayTitle: 'Time limited variation'
  },
  {
    id: '3888f275-6281-4685-90a8-65451ef01ca4',
    code: 'WRT',
    subcode: 'QTY',
    description: 'Water Rights Trade',
    subcodeDescription: 'Traded Quantity',
    displayTitle: 'Water rights trade quantity'
  },
  {
    id: 'c3f5648f-efbd-4c46-9b86-4ddd6bd3ce61',
    code: 'WRT',
    subcode: 'PUR',
    description: 'Water Rights Trade',
    subcodeDescription: 'Traded Purpose',
    displayTitle: 'Water rights trade purpose'
  },
  {
    id: '7f036649-4ef1-48c9-9bdc-7f2415604801',
    code: 'WRT',
    subcode: 'PNT',
    description: 'Water Rights Trade',
    subcodeDescription: 'Traded Point',
    displayTitle: 'Water rights trade point'
  },
  {
    id: 'cddc2c57-7036-4557-953d-13440b90fa8e',
    code: 'TLTD',
    subcode: 'MINQ',
    description: 'Time Limited',
    subcodeDescription: 'Minimum Quantity',
    displayTitle: 'Time limited minimum quantity'
  },
  {
    id: '6f031296-bb36-4d19-980c-21545d7eeee8',
    code: 'TLTD',
    subcode: 'SD',
    description: 'Time Limited',
    subcodeDescription: 'Self Destruct',
    displayTitle: 'Time limited self destruct'
  },
  {
    id: 'bf53e6ad-af27-4e67-b100-d86001d21f1c',
    code: 'AGG',
    subcode: 'PP',
    description: 'Aggregate',
    subcodeDescription: 'Purpose To Purpose; Link Within A Licence',
    displayTitle: 'Aggregate condition purpose to purpose within a licence'
  },
  {
    id: 'a5ddff18-f9b1-4b7a-9c20-fad7677aa7f2',
    code: 'AGG',
    subcode: 'PPL',
    description: 'Aggregate',
    subcodeDescription: 'Purpose To Purpose ; Link Between Different Licences',
    displayTitle: 'Aggregate condition purpose to purpose between different licences'
  },
  {
    id: '18ade96c-75ae-4bc3-9580-b8a574f3f9e5',
    code: 'AGI',
    subcode: 'DIM',
    description: 'Additional Groundwater Information',
    subcodeDescription: 'Dimensions',
    displayTitle: 'Additional groundwater information dimensions'
  },
  {
    id: '9aced507-2135-4804-9490-46c84607a08d',
    code: 'INFLR',
    subcode: 'RATE',
    description: 'Inflow Rate',
    subcodeDescription: 'Rate',
    displayTitle: 'Inflow rate'
  }
]

module.exports = {
  data
}
