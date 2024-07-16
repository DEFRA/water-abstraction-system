'use strict'

/**
 * @module RegionsSeeder
 */

const { db } = require('../../../db/db.js')

const regions = {
  anglian: {
    id: 'a5f868ec-f51c-478d-924c-37852626b7c1',
    charge_region_id: 'A',
    nald_region_id: 1,
    name: 'Anglian',
    display_name: 'Anglian'
  },
  midlands: {
    id: '1acb3cc9-ee16-4276-b0f4-37603d791698',
    charge_region_id: 'B',
    nald_region_id: 2,
    name: 'Midlands',
    display_name: 'Midlands'
  },
  north_east: {
    id: '36706540-0985-4cef-b7e5-ab4345049b22',
    charge_region_id: 'Y',
    nald_region_id: 3,
    name: 'North East',
    display_name: 'North East'
  },
  north_west: {
    id: 'eb57737f-b309-49c2-9ab6-f701e3a6fd96',
    charge_region_id: 'N',
    nald_region_id: 4,
    name: 'North West',
    display_name: 'North West'
  },
  south_west: {
    id: '4ccf3c5b-ab4e-48e1-afa8-3b18b5d07fab',
    charge_region_id: 'E',
    nald_region_id: 5,
    name: 'South West',
    display_name: 'South West'
  },
  southern: {
    id: 'd34d9f4f-11ed-46f5-b4fb-15d5988c2870',
    charge_region_id: 'S',
    nald_region_id: 6,
    name: 'Southern',
    display_name: 'Southern'
  },
  thames: {
    id: '7af8fb71-e197-4f85-bee4-23b62ef711c6',
    charge_region_id: 'T',
    nald_region_id: 7,
    name: 'Thames',
    display_name: 'Thames'
  },
  ea_wales: {
    id: '77d44d65-6f33-425e-9075-ae5ac43a0c36',
    charge_region_id: 'W',
    nald_region_id: 8,
    name: 'EA Wales',
    display_name: 'Wales'
  },
  test_region: {
    id: '51dfb3e0-9815-4fb9-b6c1-d1f6c8e56273',
    charge_region_id: 'S',
    nald_region_id: 9,
    name: 'Test Region',
    display_name: 'Test Region'
  },
  test_region_alt: {
    id: 'd0a4123d-1e19-480d-9dd4-f70f3387c4b9',
    charge_region_id: 'S',
    nald_region_id: 9,
    name: 'Test Region',
    display_name: 'Test Region'
  }
}

function createValueStringFromRegions () {
  let valueString = ''

  for (const regionsKey in regions) {
    valueString += `('${regions[regionsKey].id}', '${regions[regionsKey].charge_region_id}', '${regions[regionsKey].nald_region_id}', '${regions[regionsKey].name}', '${regions[regionsKey].display_name}')`

    // Add comma to all but the last value
    valueString += (regionsKey === 'test_region_alt' ? '' : ',')
  }

  return valueString
}

/**
 * Add all the regions to the database
 *
 */
async function seed () {
  await db.raw(`
    INSERT INTO  public.regions (id, charge_region_id, nald_region_id, name, display_name)
      VALUES ${createValueStringFromRegions()};
  `
  )
}

module.exports = {
  seed,
  regions
}
