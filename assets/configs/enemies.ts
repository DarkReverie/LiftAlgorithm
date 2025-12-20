type EnemyConfig = {
    bounds: { x: number; y: number; width: number; height: number };
};


type LevelEnemiesConfig = {
    [level: number]: EnemyConfig[];
};

export const ENEMIES_CONFIG: LevelEnemiesConfig = {

    0: [
        {
            bounds: { x: 500, y: 850, width: 430, height: 100 }
        },
        {
            bounds: { x: 100, y: 1000, width: 500, height: 100 }
        },
    ],

    1: [
        {
            bounds: { x: 500, y: 850, width: 430, height: 100 }
        },
        {
            bounds: { x: 100, y: 1200, width: 500, height: 100 }
        },
        {
            bounds: { x: 100, y: 1000, width: 200, height: 200 }
        },
    ],

    2: [
        {
            bounds: { x: 500, y: 850, width: 430, height: 100 }
        },
        {
            bounds: { x: 100, y: 1200, width: 500, height: 100 }
        },
        {
            bounds: { x: 100, y: 1000, width: 200, height: 200 }
        },
        {
            bounds: { x: 800, y: 700, width: 100, height: 900 }
        },
    ],
};
