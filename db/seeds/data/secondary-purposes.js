'use strict'

const data = [
  {
    id: '2457bfeb-a120-4b57-802a-46494bd22f82',
    legacyId: 'AGR',
    description: 'General Agriculture'
  },
  {
    id: 'd0708921-b5c1-4a5b-b63b-31aab46016d8',
    legacyId: 'AQF',
    description: 'Aquaculture Fish'
  },
  {
    id: '3dce7cf6-0ed2-48bd-ad6c-bf6c71f79db4',
    legacyId: 'AQP',
    description: 'Aquaculture Plant'
  },
  {
    id: 'c05b93dd-a48f-49a8-a5e6-782252c18f9d',
    legacyId: 'BRW',
    description: 'Breweries/Wine'
  },
  {
    id: '2d7ba5e2-b6e7-4ed2-a2d1-a1ad3f97229f',
    legacyId: 'BUS',
    description: 'Business Parks'
  },
  {
    id: '7ea553b0-03df-4081-bcaa-e1f704aa3291',
    legacyId: 'CHE',
    description: 'Chemicals'
  },
  {
    id: 'ceb6ae1d-fc8c-4cf9-ae01-269122c24c8d',
    legacyId: 'CON',
    description: 'Construction'
  },
  {
    id: 'd83bc811-b48f-4e87-9916-4c47943d224c',
    legacyId: 'CRN',
    description: 'Crown And Government'
  },
  {
    id: 'a50fd6db-96ab-46c6-804e-ddd035a4f1b4',
    legacyId: 'DAR',
    description: 'Dairies'
  },
  {
    id: 'c8d3f626-a4d5-42ea-9f72-6e22c524048e',
    legacyId: 'ELC',
    description: 'Electricity'
  },
  {
    id: 'e35d4bf3-9c23-48fc-881c-a258b78bb2d1',
    legacyId: 'EXT',
    description: 'Extractive'
  },
  {
    id: 'eb7c97fd-a718-4136-a7a2-4f0151e0188c',
    legacyId: 'FAD',
    description: 'Food & Drink'
  },
  {
    id: '9ca665af-5356-4a6d-b509-b96ee64de27a',
    legacyId: 'FOR',
    description: 'Forestry'
  },
  {
    id: 'a76d6e29-88d1-4fa3-9136-d961a9cdb1bf',
    legacyId: 'GOF',
    description: 'Golf Courses'
  },
  {
    id: 'ce8e913d-55fb-4f21-b2b2-755084661662',
    legacyId: 'HOL',
    description: 'Holiday Sites, Camp Sites & Tourist Attractions'
  },
  {
    id: 'c7be8e7a-37a0-459a-bf26-97af4f120834',
    legacyId: 'HOR',
    description: 'Horticulture And Nurseries'
  },
  {
    id: '2c397566-4cde-41c0-8cca-d152b554f528',
    legacyId: 'HOS',
    description: 'Hospitals'
  },
  {
    id: 'c4165b99-f4f1-4124-acad-e512371d1bf7',
    legacyId: 'HTL',
    description: 'Hotels, Public Houses And Conference Centres'
  },
  {
    id: '70abbcfd-b7b9-4eef-9f39-29468b32ce0e',
    legacyId: 'IND',
    description: 'Industrial/Commercial/Energy/Public Services'
  },
  {
    id: 'ecd25cff-3749-49fd-ba30-9c86483b4a12',
    legacyId: 'LAU',
    description: 'Laundry'
  },
  {
    id: 'ad036953-0e1b-43ce-a359-f452f344c4da',
    legacyId: 'MCH',
    description: 'Machinery And Electronics'
  },
  {
    id: 'd5fb3110-0dde-46f7-b7a3-94d06052d8fc',
    legacyId: 'MEC',
    description: 'Mechanical Non Electrical'
  },
  {
    id: '86708863-167a-4865-8383-cde90e7d1b43',
    legacyId: 'MIN',
    description: 'Mineral Products'
  },
  {
    id: 'af1eec87-602c-41de-a982-2417bbc320a2',
    legacyId: 'MTL',
    description: 'Metal'
  },
  {
    id: '7cff0b52-da01-4a29-b29c-a4bba4036324',
    legacyId: 'MUN',
    description: 'Municipal Grounds'
  },
  {
    id: '4bbdf3ff-9efa-4303-bea8-f7d419022922',
    legacyId: 'NAV',
    description: 'Navigation'
  },
  {
    id: '00237355-5b18-44d9-a5c4-785e387739fb',
    legacyId: 'NRE',
    description: 'Non-Remedial River/Wetland Support'
  },
  {
    id: '789824ee-140e-4871-b453-b17ac12ab095',
    legacyId: 'ORC',
    description: 'Orchards'
  },
  {
    id: '303cc214-6118-417b-b6ee-343257af3a3b',
    legacyId: 'OTE',
    description: 'Other Environmental Improvements'
  },
  {
    id: 'f85ab791-e943-4492-a3bb-c0b3ad3f0712',
    legacyId: 'OTI',
    description: 'Other Industrial/Commercial/Public Services'
  },
  {
    id: 'a58ef991-ea9b-4443-862d-811327ccd3dc',
    legacyId: 'PAD',
    description: 'Public Administration'
  },
  {
    id: 'e882c4a6-53d0-4b82-b921-499d25428134',
    legacyId: 'PAP',
    description: 'Paper And Printing'
  },
  {
    id: 'f47814e0-a7a9-45be-af75-4d2b58784be0',
    legacyId: 'PET',
    description: 'Petrochemicals'
  },
  {
    id: '6cbb6f30-64bd-47e5-b852-5089e7088568',
    legacyId: 'PRI',
    description: 'Private Non-Industrial'
  },
  {
    id: '8b324ba7-7d82-46d8-ae61-bc343e388745',
    legacyId: 'PRV',
    description: 'Private Water Supply'
  },
  {
    id: '2362c06f-bb1e-4649-8342-29cc94017774',
    legacyId: 'PUM',
    description: 'Pump & Treat'
  },
  {
    id: '866fe96a-1536-4396-85b3-de073ac2f92f',
    legacyId: 'PWS',
    description: 'Public Water Supply'
  },
  {
    id: '1d3877a3-c5cf-405a-9e07-4fe94689f4ea',
    legacyId: 'PWU',
    description: 'Private Water Undertaking'
  },
  {
    id: 'b9a4c156-77e8-4891-95f4-6df745e58d42',
    legacyId: 'RAC',
    description: 'Racecourses'
  },
  {
    id: '04d711bb-607c-4814-aca9-0c6bd39e0ea4',
    legacyId: 'REF',
    description: 'Refuse And Recycling'
  },
  {
    id: '3c2a4aab-c2a7-4fea-aa06-bcdf2d9e499f',
    legacyId: 'REM',
    description: 'Remedial River/Wetland Support'
  },
  {
    id: 'c0691f62-1022-4cef-8f9b-575099f62c20',
    legacyId: 'RES',
    description: 'Research Non- University/College'
  },
  {
    id: 'b6d3c0c8-4018-4553-9393-0e87a3c91a8f',
    legacyId: 'RET',
    description: 'Retail'
  },
  {
    id: 'bf32cb71-8f5a-4055-913a-3c16942abb8c',
    legacyId: 'RUB',
    description: 'Rubber'
  },
  {
    id: 'f06c3e2e-0a0b-4cd5-81bd-04d527bd8533',
    legacyId: 'SCH',
    description: 'Schools And Colleges'
  },
  {
    id: 'b6fbd08e-a4ad-4a9b-871e-30ac51efee78',
    legacyId: 'SLA',
    description: 'Slaughtering'
  },
  {
    id: '59bd435f-5651-4cc5-bdf8-fb8e3697f95a',
    legacyId: 'SPO',
    description: 'Sports Grounds/Facilities'
  },
  {
    id: '9c16f3e8-4ea0-4292-8802-8427bec0571a',
    legacyId: 'TRA',
    description: 'Transport'
  },
  {
    id: 'c778de53-0fd4-445e-af86-3c441f79e07b',
    legacyId: 'TXT',
    description: 'Textiles & Leather'
  },
  {
    id: '9b1828d1-d319-4d6c-a620-d9828c455fcb',
    legacyId: 'UNK',
    description: 'Unknown (for impounding exluding impoundments for HEP)'
  },
  {
    id: 'eecd8280-9b2f-4279-b300-d4b3441bd87c',
    legacyId: 'WAT',
    description: 'Water Supply Related'
  },
  {
    id: 'f6f7b6bf-6447-4092-8cd6-27cae2d8956e',
    legacyId: 'ZOO',
    description: 'Zoos/Kennels/Stables'
  },
  {
    id: '490db793-eddf-4fed-93ce-78260b8d0584',
    legacyId: 'CRW',
    description: 'Crown - Other'
  },
  {
    id: '09545099-a184-4e98-be2a-e749d24392e9',
    legacyId: 'GOV',
    description: 'Government Departments - Other'
  },
  {
    id: '6bb0f9c0-7ef0-4da4-9c0f-2a60fc6b4785',
    legacyId: 'DET',
    description: 'Detention And Immigration Centres'
  },
  {
    id: '3fd3cf82-47ff-4f01-b523-96959f2d635b',
    legacyId: 'VIF',
    description: 'Visiting Armed Forces'
  },
  {
    id: '8b836771-6d7e-4277-b03f-473c0504d02b',
    legacyId: 'FRT',
    description: 'Government Or Crown Forestry'
  },
  {
    id: '489930ca-cef9-4604-86be-31ef01954cc7',
    legacyId: 'CVY',
    description: 'Statutory Water Conservancy Operation'
  },
  {
    id: '607f230d-e96b-4383-a588-f7976cbf3e6b',
    legacyId: 'HRB',
    description: 'Ports And Harbour Authority Operation'
  },
  {
    id: '075d0549-4075-47f4-9e1a-944e96a63eec',
    legacyId: 'DRG',
    description: 'Drainage Operations'
  },
  {
    id: '678fa94b-6320-44d2-a21d-5d772040de6c',
    legacyId: 'POW',
    description: 'Domestic Premises Related'
  },
  {
    id: 'd4f9f23b-1602-4846-9b05-07a49d2bd9c5',
    legacyId: 'MOD',
    description: 'Mod (Ministry Of Defence)'
  },
  {
    id: '7f75f247-5b3c-4785-954c-207456a4d6c4',
    legacyId: 'OOG',
    description: 'Onshore Oil and Gas Extraction'
  }
]

module.exports = {
  data
}
