const sectors = {
    'A1MT':{
        sectorId: 0,
        basepoints: 216,
        neighbors:['B1OR','D1BA','A2SI','A2T'],
    },
    'B1OR':{
        sectorId: 1,
        basepoints: 126,
        neighbors:['A1MT','C1ND','B2S','B2T'],
    },
    'C1ND':{
        sectorId: 2,
        basepoints: 177,
        neighbors:['B1OR','D1BA','C2S','C2T'],
    },
    'D1BA':{
        sectorId: 3,
        basepoints: 167,
        neighbors:['A1MT','C1ND','D2S','D2T'],
    },
    'A2SI':{
        sectorId: 4,
        basepoints: 79,
        neighbors:['A1MT','A2T','D2T','A3V','A3X'],
    },
    'A2T':{
        sectorId: 5,
        basepoints: 93,
        neighbors:['A1MT','A2SI','B2S','A3Y','A3Z'],
    },
    'B2S':{
        sectorId: 6,
        basepoints: 63,
        neighbors:['B1OR','A2T','B2T','B3V','B3X'],
    },
    'B2T':{
        sectorId: 7,
        basepoints: 144,
        neighbors:['B1OR','B2S','C2S','B2Y','B3Z'],
    },
    'C2S':{
        sectorId: 8,
        basepoints: 118,
        neighbors:['C1ND','B2T','C2T','C3V','C3X'],
    },
    'C2T':{
        sectorId: 9,
        basepoints: 62,
        neighbors:['C1ND','C2S','D2S','C3Y','C3Z'],
    },
    'D2S':{
        sectorId: 10,
        basepoints: 64,
        neighbors:['D1BA','C2T','D2T','D3V','D3X'],
    },
    'D2T':{
        sectorId: 11,
        basepoints: 67,
        neighbors:['D1BA','A2SI','D2S','D3Y','D3Z'],
    },
    'A3V':{
        sectorId: 12,
        basepoints: 40,
        neighbors:['A2SI','A3X','D3Z','A4A','A4BM'],
    },
    'A3X':{
        sectorId: 13,
        basepoints: 45,
        neighbors:['A2SI','A3V','A3Y','A4C','A4D'],
    },
    'A3Y':{
        sectorId: 14,
        basepoints: 53,
        neighbors:['A2T','A3X','A3Z','A4E','A4F'],
    },
    'A3Z':{
        sectorId: 15,
        basepoints: 66,
        neighbors:['A2T','A3Y','B3V','A4G','A4H'],
    },
    'B3V':{
        sectorId: 16,
        basepoints: 80,
        neighbors:['B2S','A3Z','B3X','B4A','B4B'],
    },
    'B3X':{
        sectorId: 17,
        basepoints: 74,
        neighbors:['B2S','B3V','B3Y','B4C','B4D'],
    },
    'B3Y':{
        sectorId: 18,
        basepoints: 49,
        neighbors:['B2T','B3X','B3Z','B4E','B4F'],
    },
    'B3Z':{
        sectorId: 19,
        basepoints: 72,
        neighbors:['B2T','B3Y','B3V','B4G','B4H'],
    },
    'C3V':{
        sectorId: 20,
        basepoints: 56,
        neighbors:['C2S','B3Z','C3X','C4A','C4BC'],
    },
    'C3X':{
        sectorId: 21,
        basepoints: 41,
        neighbors:['C2S','C3V','C3Y','C4C','C4D'],
    },
    'C3Y':{
        sectorId: 22,
        basepoints: 42,
        neighbors:['C2T','C3X','C3Z','C4E','C4F'],
    },
    'C3Z':{
        sectorId: 23,
        basepoints: 75,
        neighbors:['C2T','C3Y','D3V','C4G','C4H','D4A'],
    },
    'D3V':{
        sectorId: 24,
        basepoints: 43,
        neighbors:['D2S','C3Z','C3X','D4A','D4B'],
    },
    'D3X':{
        sectorId: 25,
        basepoints: 60,
        neighbors:['D2S','D3V','D3Y','D4C','D4D'],
    },
    'D3Y':{
        sectorId: 26,
        basepoints: 62,
        neighbors:['D2T','D3X','D3Z','D4E','D4F'],
    },
    'D3Z':{
        sectorId: 27,
        basepoints: 55,
        neighbors:['D2T','A3V','D3Y','D4GB','D4H'],
    },
    'A4A':{
        sectorId: 28,
        isSpawnSpot: true,
        basepoints: 0,
        neighbors:['A3V','A4BM','D4H'],
    },
    'A4BM':{
        sectorId: 29,
        basepoints: 34,
        neighbors:['A3V','A4A','A4C'],
    },
    'A4C':{
        sectorId: 30,
        basepoints: 36,
        neighbors:['A3X','A4BM','A4D'],
    },
    'A4D':{
        sectorId: 31,
        basepoints: 27,
        neighbors:['A3X','A4C','A4E'],
    },
    'A4E':{
        sectorId: 32,
        isSpawnSpot: true,
        basepoints: 0,
        neighbors:['A3Y','A4D','A4F'],
    },
    'A4F':{
        sectorId: 33,
        basepoints: 28,
        neighbors:['A3Y','A4E','A4G'],
    },
    'A4G':{
        sectorId: 34,
        basepoints: 25,
        neighbors:['A3Z','A4F','A4H'],
    },
    'A4H':{
        sectorId: 35,
        basepoints: 26,
        neighbors:['A4Z','A4G','B4A'],
    },
    'B4A':{
        sectorId: 36,
        basepoints: 16,
        neighbors:['B3V','A4H','B4B'],
    },
    'B4B':{
        sectorId: 37,
        isSpawnSpot: true,
        basepoints: 0,
        neighbors:['B3V','B4A','B4C'],
    },
    'B4C':{
        sectorId: 38,
        basepoints: 20,
        neighbors:['B3X','B4B','B4D'],
    },
    'B4D':{
        sectorId: 39,
        basepoints: 28,
        neighbors:['B3X','B4C','B4E'],
    },
    'B4E':{
        sectorId: 40,
        basepoints: 30,
        neighbors:['B3Y','B4D','B4F'],
    },
    'B4F':{
        sectorId: 41,
        isSpawnSpot: true,
        basepoints: 0,
        neighbors:['B3Y','B4E','B4G'],
    },
    'B4G':{
        sectorId: 42,
        basepoints: 31,
        neighbors:['B3Z','B4F','B4H'],
    },
    'B4H':{
        sectorId: 43,
        basepoints: 15,
        neighbors:['B3Z','B4G','C4A'],
    },
    'C4A':{
        sectorId: 44,
        basepoints: 34,
        neighbors:['C3V','B4H','C4BC'],
    },
    'C4BC':{
        sectorId: 45,
        basepoints: 16,
        neighbors:['C3V','C4A','C4C'],
    },
    'C4C':{
        sectorId: 46,
        isSpawnSpot: true,
        basepoints: 0,
        neighbors:['C3X','C4BC','C4D'],
    },
    'C4D':{
        sectorId: 47,
        basepoints: 23,
        neighbors:['C3X','C4C','C4E'],
    },
    'C4E':{
        sectorId: 48,
        basepoints: 25,
        neighbors:['C3Y','C4D','C4F'],
    },
    'C4F':{
        sectorId: 49,
        basepoints: 10,
        neighbors:['C3Y','C4E','C4G'],
    },
    'C4G':{
        sectorId: 50,
        isSpawnSpot: true,
        basepoints: 0,
        neighbors:['C3Z','C4F','C4H'],
    },
    'C4H':{
        sectorId: 51,
        basepoints: 14,
        neighbors:['C3Z','C4G','C4A'],
    },
    'D4A':{
        sectorId: 52,
        basepoints: 31,
        neighbors:['D3V','C4H','D4B'],
    },
    'D4B':{
        sectorId: 53,
        basepoints: 39,
        neighbors:['D3V','D4A','D4C'],
    },
    'D4C':{
        sectorId: 54,
        basepoints: 32,
        neighbors:['D3X','D4B','D4D'],
    },
    'D4D':{
        sectorId: 55,
        isSpawnSpot: true,
        basepoints: 0,
        neighbors:['D3X','D4C','D4E'],
    },
    'D4E':{
        sectorId: 56,
        basepoints: 15,
        neighbors:['D3Y','D4D','D4F'],
    },
    'D4F':{
        sectorId: 57,
        basepoints: 39,
        neighbors:['D3Y','D4E','D4GB'],
    },
    'D4GB':{
        sectorId: 58,
        basepoints: 23,
        neighbors:['D3Z','D4Z','D4H'],
    },
    'D4H':{
        sectorId: 59,
        basepoints: 31,
        neighbors:['D3Z','D4GB','A4A'],
    },
}

export { sectors }