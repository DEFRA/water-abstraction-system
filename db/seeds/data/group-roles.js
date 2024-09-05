'use strict'

const { data: groups } = require('./groups.js')
const { data: roles } = require('./roles.js')

const data = [
  {
    id: 'e6fec455-1c2f-4cea-8ce6-7f8a8a52f384',
    groupId: groups.find((group) => { return group.group === 'environment_officer' }).id,
    roleId: roles.find((role) => { return role.role === 'hof_notifications' }).id
  },
  {
    id: '521867f4-5816-4fa5-8b01-3433ca304e18',
    groupId: groups.find((group) => { return group.group === 'billing_and_data' }).id,
    roleId: roles.find((role) => { return role.role === 'returns' }).id
  },
  {
    id: '90b975b3-6aa6-406d-bfef-bc9867811dea',
    groupId: groups.find((group) => { return group.group === 'billing_and_data' }).id,
    roleId: roles.find((role) => { return role.role === 'bulk_return_notifications' }).id
  },
  {
    id: '4f3014cb-3a42-4eb3-a555-076eb5c96969',
    groupId: groups.find((group) => { return group.group === 'billing_and_data' }).id,
    roleId: roles.find((role) => { return role.role === 'manage_accounts' }).id
  },
  {
    id: 'a4a66587-190c-4f68-bf2c-bae051754bb8',
    groupId: groups.find((group) => { return group.group === 'billing_and_data' }).id,
    roleId: roles.find((role) => { return role.role === 'unlink_licences' }).id
  },
  {
    id: '9aa6163c-faf1-4167-b2ec-3346203f9365',
    groupId: groups.find((group) => { return group.group === 'wirs' }).id,
    roleId: roles.find((role) => { return role.role === 'returns' }).id
  },
  {
    id: '2724687a-4f16-47c7-94c4-db9c89522a68',
    groupId: groups.find((group) => { return group.group === 'nps' }).id,
    roleId: roles.find((role) => { return role.role === 'unlink_licences' }).id
  },
  {
    id: 'fbf0bc10-14fa-4d69-9f2a-75ebc49aba9b',
    groupId: groups.find((group) => { return group.group === 'nps' }).id,
    roleId: roles.find((role) => { return role.role === 'renewal_notifications' }).id
  },
  {
    id: 'c4bb2367-9491-42c3-844e-2717e20e1050',
    groupId: groups.find((group) => { return group.group === 'psc' }).id,
    roleId: roles.find((role) => { return role.role === 'unlink_licences' }).id
  },
  {
    id: '1cef304f-734c-4632-9330-872092979281',
    groupId: groups.find((group) => { return group.group === 'psc' }).id,
    roleId: roles.find((role) => { return role.role === 'renewal_notifications' }).id
  },
  {
    id: 'dc6bc4ad-444f-4ab0-9cda-335c58f14bdd',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'returns' }).id
  },
  {
    id: '34765744-b2df-4b48-a542-c4a4a4051b7b',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'hof_notifications' }).id
  },
  {
    id: '72c9f37f-535d-4bb6-8184-2de8ef64f75b',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'bulk_return_notifications' }).id
  },
  {
    id: '10af67ab-b23b-4ed4-a670-f866ba958c7e',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'manage_accounts' }).id
  },
  {
    id: 'a8713481-9af2-41b4-88e3-69a59b8daf5e',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'unlink_licences' }).id
  },
  {
    id: '04d51975-13e3-4346-97f2-37c367f1d6cc',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'renewal_notifications' }).id
  },
  {
    id: '227243f5-606f-4f5d-aa8b-9fb8104a466a',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'ar_user' }).id
  },
  {
    id: 'd56a2f9e-3272-4f80-aadf-effdda53e14d',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'ar_approver' }).id
  },
  {
    id: '88ba3607-f0fc-4272-9bb3-ec8792d3ad8a',
    groupId: groups.find((group) => { return group.group === 'billing_and_data' }).id,
    roleId: roles.find((role) => { return role.role === 'billing' }).id
  },
  {
    id: '708256ad-2ebf-4871-b58a-7d1db7cac994',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'billing' }).id
  },
  {
    id: '0e0d76d0-1e3a-4147-8044-e0aecc4346da',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'charge_version_workflow_editor' }).id
  },
  {
    id: '027be72e-e13f-44bb-9d8d-a2952cc6577d',
    groupId: groups.find((group) => { return group.group === 'billing_and_data' }).id,
    roleId: roles.find((role) => { return role.role === 'charge_version_workflow_reviewer' }).id
  },
  {
    id: '1830bb37-5e7e-451c-8ae6-3189355287e0',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'charge_version_workflow_reviewer' }).id
  },
  {
    id: 'f740c44f-393b-4f6b-89cb-d8fc57ef5fdc',
    groupId: groups.find((group) => { return group.group === 'billing_and_data' }).id,
    roleId: roles.find((role) => { return role.role === 'manage_agreements' }).id
  },
  {
    id: '460ff8da-4466-4475-83a4-f046d25c8679',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'manage_agreements' }).id
  },
  {
    id: '38f2c87f-0885-4dca-b749-247bbe2215b1',
    groupId: groups.find((group) => { return group.group === 'billing_and_data' }).id,
    roleId: roles.find((role) => { return role.role === 'delete_agreements' }).id
  },
  {
    id: 'd063e5d0-9c53-4e42-9348-1862f0f38f1d',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'delete_agreements' }).id
  },
  {
    id: '2f2dd7d0-c88f-45a4-9420-e5235105e2b5',
    groupId: groups.find((group) => { return group.group === 'billing_and_data' }).id,
    roleId: roles.find((role) => { return role.role === 'charge_version_workflow_editor' }).id
  },
  {
    id: 'febe1594-a854-4289-a06c-a61d21bfcdad',
    groupId: groups.find((group) => { return group.group === 'billing_and_data' }).id,
    roleId: roles.find((role) => { return role.role === 'manage_billing_accounts' }).id
  },
  {
    id: '4abb0505-c88e-43d6-af63-657e1ce2a4b9',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'manage_billing_accounts' }).id
  },
  {
    id: '50664eac-4ac1-43e5-9c9b-ac38d2a2ace7',
    groupId: groups.find((group) => { return group.group === 'environment_officer' }).id,
    roleId: roles.find((role) => { return role.role === 'manage_gauging_station_licence_links' }).id
  },
  {
    id: '5bdf10a6-76f8-44aa-a53e-4b05b76a0a25',
    groupId: groups.find((group) => { return group.group === 'nps' }).id,
    roleId: roles.find((role) => { return role.role === 'manage_gauging_station_licence_links' }).id
  },
  {
    id: '19c3c925-bfd6-46fd-a6cf-964e348067f1',
    groupId: groups.find((group) => { return group.group === 'psc' }).id,
    roleId: roles.find((role) => { return role.role === 'manage_gauging_station_licence_links' }).id
  },
  {
    id: '0b8df4ec-47bb-424e-9eb9-ed44a151c3e0',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'manage_gauging_station_licence_links' }).id
  },
  {
    id: '530e62e6-42ff-45d0-b1c3-97082ea82472',
    groupId: groups.find((group) => { return group.group === 'billing_and_data' }).id,
    roleId: roles.find((role) => { return role.role === 'view_charge_versions' }).id
  },
  {
    id: 'f75a60f4-9219-4b18-8f5e-9dbf771b05c1',
    groupId: groups.find((group) => { return group.group === 'nps' }).id,
    roleId: roles.find((role) => { return role.role === 'view_charge_versions' }).id
  },
  {
    id: '1cd4ee5c-89b7-48b7-b08b-d7fe8eef9ee0',
    groupId: groups.find((group) => { return group.group === 'psc' }).id,
    roleId: roles.find((role) => { return role.role === 'view_charge_versions' }).id
  },
  {
    id: '882e3c15-f30d-4e25-b771-184065cc5f26',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    roleId: roles.find((role) => { return role.role === 'view_charge_versions' }).id
  }
]

module.exports = {
  data
}
