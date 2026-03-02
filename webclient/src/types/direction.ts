export const Directions = {
    North: 'north',
    South: 'south',
    East:  'east',
    West:  'west',
    Up:    'up',
    Down:  'down',
} as const;

export type Direction = typeof Directions[keyof typeof Directions];
