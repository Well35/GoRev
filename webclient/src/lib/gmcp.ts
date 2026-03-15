export const GMCPModule = {
    Char: 'Char',
    CharInfo: 'Char.Info',
    CharVitals: 'Char.Vitals',
    CharStats: 'Char.Stats',
    CharWorth: 'Char.Worth',
    CharSkills: 'Char.Skills',
    CharSpells: 'Char.Spells',
    CharInventory: 'Char.Inventory',
    CharInventoryBackpack: 'Char.Inventory.Backpack',
    CharInventoryWorn: 'Char.Inventory.Worn',
    RoomInfo: 'Room.Info',
    RoomMap: 'Room.Map',
    RoomInfoContentsNpcs: 'Room.Info.Contents.Npcs',
} as const;

export type GMCPModule = (typeof GMCPModule)[keyof typeof GMCPModule];
