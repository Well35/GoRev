export const GMCPModule = {
    Char: 'Char',
    CharInfo: 'Char.Info',
    CharVitals: 'Char.Vitals',
    CharStats: 'Char.Stats',
    CharWorth: 'Char.Worth',
    CharSkills: 'Char.Skills',
    CharSpells: 'Char.Spells',
    RoomInfo: 'Room.Info',
    RoomMap: 'Room.Map',
    RoomInfoContentsNpcs: 'Room.Info.Contents.Npcs',
} as const;

export type GMCPModule = (typeof GMCPModule)[keyof typeof GMCPModule];
