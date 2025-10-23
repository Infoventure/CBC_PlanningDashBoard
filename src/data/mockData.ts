export interface Service {
  name: string;
  hours: number;
}
export interface PathwayData {
  id: number;
  visiteret: number;
  disponeret: number;
  balance: number;
  balancePathwayMedian: number;
}
export interface WeeklyData {
  week: string;
  visiteret: number;
  disponeret: number;
}
export interface Citizen {
  id: number;
  cpr: `${number}${number}${number}${number}${number}${number}-${number}${number}${number}${number}`;
  name: string;
  alert?: boolean;
  teamId: number;
  pathways: PathwayData[];
  services?: Service[];
  weeklyData: WeeklyData[];
}
export interface Pathway {
  id: number;
  name: string;
  mediantime: number; // The median time for the pathway in minutes. This is the target that all procedures on the path should average to. This is the minutes that the munincipality reieves money based on. All procedures over the median is a loss of money.
}
interface MockData {
  pathways: Pathway[];
  citizens: Citizen[];
}
export const mockData: MockData = {
  pathways: [{
    id: 1,
    name: 'Forløb 1',
    mediantime: 30
  }, {
    id: 2,
    name: 'Forløb 2',
    mediantime: 60
  }, {
    id: 3,
    name: 'Forløb 3',
    mediantime: 120
  }],
  citizens: [
  // Team 1 citizens
  {
    id: 1,
    name: 'Mads Testersen',
    cpr: '010101-1233',
    teamId: 1,
    pathways: [{
      id: 1,
      visiteret: 40,
      disponeret: 40,
      balance: 0,
      balancePathwayMedian: -10,
    }, {
      id: 2,
      visiteret: 0,
      disponeret: 0,
      balance: 0,
      balancePathwayMedian: 0,
    }, {
      id: 3,
      visiteret: 0,
      disponeret: 0,
      balance: 0,
      balancePathwayMedian: 0,
    }],
    services: [{
      name: 'Personlig pleje',
      hours: 20
    }, {
      name: 'Praktisk hjælp',
      hours: 5
    }, {
      name: 'Genoptræning',
      hours: 15
    }],
    weeklyData: [{
      week: 'Uge 1',
      visiteret: 59,
      disponeret: 30
    }, {
      week: 'Uge 2',
      visiteret: 59,
      disponeret: 35
    }, {
      week: 'Uge 3',
      visiteret: 59,
      disponeret: 40
    }, {
      week: 'Uge 4',
      visiteret: 59,
      disponeret: 45
    }]
  }, {
    id: 2,
    name: 'Peter Testgaard',
    cpr: '010101-1235',
    teamId: 1,
    pathways: [{
      id: 1,
      visiteret: 20,
      disponeret: 25,
      balance: -5,
      balancePathwayMedian: 5,
    }, {
      id: 2,
      visiteret: 0,
      disponeret: 0,
      balance: 0,
      balancePathwayMedian: 0,
    }, {
      id: 3,
      visiteret: 0,
      disponeret: 0,
      balance: 0,
      balancePathwayMedian: 0,
    }],
    weeklyData: [{
      week: 'Uge 1',
      visiteret: 59,
      disponeret: 45
    }, {
      week: 'Uge 2',
      visiteret: 59,
      disponeret: 50
    }, {
      week: 'Uge 3',
      visiteret: 59,
      disponeret: 55
    }, {
      week: 'Uge 4',
      visiteret: 59,
      disponeret: 59
    }]
  }, {
    id: 3,
    name: 'Sofie Testdal',
    cpr: '010101-1230',
    teamId: 1,
    alert: true,
    pathways: [{
      id: 1,
      visiteret: 50,
      disponeret: 50,
      balance: 0,
      balancePathwayMedian: -20,
    }, {
      id: 2,
      visiteret: 0,
      disponeret: 0,
      balance: 0,
      balancePathwayMedian: 0,
    }, {
      id: 3,
      visiteret: 0,
      disponeret: 0,
      balance: 0,
      balancePathwayMedian: 0,
    }],
    services: [{
      name: 'Personlig pleje',
      hours: 8
    }, {
      name: 'Praktisk hjælp',
      hours: 12
    }, {
      name: 'Genoptræning',
      hours: 30
    }],
    weeklyData: [{
      week: 'Uge 1',
      visiteret: 59,
      disponeret: 80
    }, {
      week: 'Uge 2',
      visiteret: 59,
      disponeret: 95
    }, {
      week: 'Uge 3',
      visiteret: 59,
      disponeret: 110
    }, {
      week: 'Uge 4',
      visiteret: 59,
      disponeret: 135
    }]
  }, {
    id: 11,
    name: 'Frederik Testholm',
    cpr: '010101-1237',
    teamId: 1,
    pathways: [{
      id: 1,
      visiteret: 0,
      disponeret: 0,
      balance: 0,
      balancePathwayMedian: 0,
    }, {
      id: 2,
      visiteret: 50,
      disponeret: 45,
      balance: 5,
      balancePathwayMedian: 15,
    }, {
      id: 3,
      visiteret: 0,
      disponeret: 0,
      balance: 0,
      balancePathwayMedian: 0,
    }],
    weeklyData: [{
      week: 'Uge 1',
      visiteret: 125,
      disponeret: 100
    }, {
      week: 'Uge 2',
      visiteret: 125,
      disponeret: 105
    }, {
      week: 'Uge 3',
      visiteret: 125,
      disponeret: 110
    }, {
      week: 'Uge 4',
      visiteret: 125,
      disponeret: 118
    }]
  }, {
    id: 12,
    name: 'Katrine Testlund',
    cpr: '010101-1232',
    teamId: 1,
    pathways: [{
      id: 1,
      visiteret: 0,
      disponeret: 0,
      balance: 0,
      balancePathwayMedian: 0,
    }, {
      id: 2,
      visiteret: 0,
      disponeret: 0,
      balance: 0,
      balancePathwayMedian: 0,
    }, {
      id: 3,
      visiteret: 150,
      disponeret: 160,
      balance: -10,
      balancePathwayMedian: -40,
    }],
    weeklyData: [{
      week: 'Uge 1',
      visiteret: 600,
      disponeret: 550
    }, {
      week: 'Uge 2',
      visiteret: 600,
      disponeret: 560
    }, {
      week: 'Uge 3',
      visiteret: 600,
      disponeret: 570
    }, {
      week: 'Uge 4',
      visiteret: 600,
      disponeret: 580
    }]
  },
  // Team 2 citizens
  // {
  //   id: 4,
  //   name: 'Borger 4',
  //   teamId: 2,
  //   pathways: [{
  //     id: 1,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 2,
  //     visiteret: 179,
  //     disponeret: 100,
  //     balance: 79,
  //   }, {
  //     id: 3,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }],
  //   weeklyData: [{
  //     week: 'Uge 1',
  //     visiteret: 179,
  //     disponeret: 70
  //   }, {
  //     week: 'Uge 2',
  //     visiteret: 179,
  //     disponeret: 80
  //   }, {
  //     week: 'Uge 3',
  //     visiteret: 179,
  //     disponeret: 90
  //   }, {
  //     week: 'Uge 4',
  //     visiteret: 179,
  //     disponeret: 100
  //   }]
  // }, {
  //   id: 5,
  //   name: 'Borger 5',
  //   teamId: 2,
  //   pathways: [{
  //     id: 1,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 2,
  //     visiteret: 179,
  //     disponeret: 180,
  //     balance: -1,
  //   }, {
  //     id: 3,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }],
  //   weeklyData: [{
  //     week: 'Uge 1',
  //     visiteret: 179,
  //     disponeret: 150
  //   }, {
  //     week: 'Uge 2',
  //     visiteret: 179,
  //     disponeret: 160
  //   }, {
  //     week: 'Uge 3',
  //     visiteret: 179,
  //     disponeret: 170
  //   }, {
  //     week: 'Uge 4',
  //     visiteret: 179,
  //     disponeret: 180
  //   }]
  // }, {
  //   id: 6,
  //   name: 'Borger 6',
  //   teamId: 2,
  //   pathways: [{
  //     id: 1,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 2,
  //     visiteret: 179,
  //     disponeret: 170,
  //     balance: 9,
  //   }, {
  //     id: 3,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }],
  //   weeklyData: [{
  //     week: 'Uge 1',
  //     visiteret: 179,
  //     disponeret: 140
  //   }, {
  //     week: 'Uge 2',
  //     visiteret: 179,
  //     disponeret: 150
  //   }, {
  //     week: 'Uge 3',
  //     visiteret: 179,
  //     disponeret: 160
  //   }, {
  //     week: 'Uge 4',
  //     visiteret: 179,
  //     disponeret: 170
  //   }]
  // }, {
  //   id: 13,
  //   name: 'Borger 13',
  //   teamId: 2,
  //   pathways: [{
  //     id: 1,
  //     visiteret: 65,
  //     disponeret: 60,
  //     balance: 5,
  //   }, {
  //     id: 2,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 3,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }],
  //   weeklyData: [{
  //     week: 'Uge 1',
  //     visiteret: 65,
  //     disponeret: 45
  //   }, {
  //     week: 'Uge 2',
  //     visiteret: 65,
  //     disponeret: 50
  //   }, {
  //     week: 'Uge 3',
  //     visiteret: 65,
  //     disponeret: 55
  //   }, {
  //     week: 'Uge 4',
  //     visiteret: 65,
  //     disponeret: 60
  //   }]
  // }, {
  //   id: 14,
  //   name: 'Borger 14',
  //   teamId: 2,
  //   pathways: [{
  //     id: 1,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 2,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 3,
  //     visiteret: 680,
  //     disponeret: 650,
  //     balance: 30,
  //   }],
  //   weeklyData: [{
  //     week: 'Uge 1',
  //     visiteret: 680,
  //     disponeret: 620
  //   }, {
  //     week: 'Uge 2',
  //     visiteret: 680,
  //     disponeret: 630
  //   }, {
  //     week: 'Uge 3',
  //     visiteret: 680,
  //     disponeret: 640
  //   }, {
  //     week: 'Uge 4',
  //     visiteret: 680,
  //     disponeret: 650
  //   }]
  // },
  // // Team 3 citizens
  // {
  //   id: 7,
  //   name: 'Borger 7',
  //   teamId: 3,
  //   pathways: [{
  //     id: 1,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 2,
  //     visiteret: 179,
  //     disponeret: 220,
  //     balance: -41,
  //   }, {
  //     id: 3,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }],
  //   weeklyData: [{
  //     week: 'Uge 1',
  //     visiteret: 179,
  //     disponeret: 190
  //   }, {
  //     week: 'Uge 2',
  //     visiteret: 179,
  //     disponeret: 200
  //   }, {
  //     week: 'Uge 3',
  //     visiteret: 179,
  //     disponeret: 210
  //   }, {
  //     week: 'Uge 4',
  //     visiteret: 179,
  //     disponeret: 220
  //   }]
  // }, {
  //   id: 8,
  //   name: 'Borger 8',
  //   teamId: 3,
  //   pathways: [{
  //     id: 1,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 2,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 3,
  //     visiteret: 719,
  //     disponeret: 600,
  //     balance: 119,
  //   }],
  //   weeklyData: [{
  //     week: 'Uge 1',
  //     visiteret: 719,
  //     disponeret: 550
  //   }, {
  //     week: 'Uge 2',
  //     visiteret: 719,
  //     disponeret: 570
  //   }, {
  //     week: 'Uge 3',
  //     visiteret: 719,
  //     disponeret: 590
  //   }, {
  //     week: 'Uge 4',
  //     visiteret: 719,
  //     disponeret: 600
  //   }]
  // }, {
  //   id: 15,
  //   name: 'Borger 15',
  //   teamId: 3,
  //   pathways: [{
  //     id: 1,
  //     visiteret: 72,
  //     disponeret: 68,
  //     balance: 4,
  //   }, {
  //     id: 2,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 3,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }],
  //   weeklyData: [{
  //     week: 'Uge 1',
  //     visiteret: 72,
  //     disponeret: 50
  //   }, {
  //     week: 'Uge 2',
  //     visiteret: 72,
  //     disponeret: 55
  //   }, {
  //     week: 'Uge 3',
  //     visiteret: 72,
  //     disponeret: 60
  //   }, {
  //     week: 'Uge 4',
  //     visiteret: 72,
  //     disponeret: 68
  //   }]
  // },
  // // Team 4 citizens
  // {
  //   id: 9,
  //   name: 'Borger 9',
  //   teamId: 4,
  //   pathways: [{
  //     id: 1,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 2,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 3,
  //     visiteret: 719,
  //     disponeret: 1000,
  //     balance: -281,
  //   }],
  //   weeklyData: [{
  //     week: 'Uge 1',
  //     visiteret: 719,
  //     disponeret: 850
  //   }, {
  //     week: 'Uge 2',
  //     visiteret: 719,
  //     disponeret: 900
  //   }, {
  //     week: 'Uge 3',
  //     visiteret: 719,
  //     disponeret: 950
  //   }, {
  //     week: 'Uge 4',
  //     visiteret: 719,
  //     disponeret: 1000
  //   }]
  // }, {
  //   id: 10,
  //   name: 'Borger 10',
  //   teamId: 4,
  //   pathways: [{
  //     id: 1,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 2,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 3,
  //     visiteret: 719,
  //     disponeret: 800,
  //     balance: -81,
  //   }],
  //   weeklyData: [{
  //     week: 'Uge 1',
  //     visiteret: 719,
  //     disponeret: 750
  //   }, {
  //     week: 'Uge 2',
  //     visiteret: 719,
  //     disponeret: 770
  //   }, {
  //     week: 'Uge 3',
  //     visiteret: 719,
  //     disponeret: 790
  //   }, {
  //     week: 'Uge 4',
  //     visiteret: 719,
  //     disponeret: 800
  //   }]
  // }, {
  //   id: 16,
  //   name: 'Borger 16',
  //   teamId: 4,
  //   pathways: [{
  //     id: 1,
  //     visiteret: 55,
  //     disponeret: 60,
  //     balance: -5,
  //   }, {
  //     id: 2,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 3,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }],
  //   weeklyData: [{
  //     week: 'Uge 1',
  //     visiteret: 55,
  //     disponeret: 45
  //   }, {
  //     week: 'Uge 2',
  //     visiteret: 55,
  //     disponeret: 50
  //   }, {
  //     week: 'Uge 3',
  //     visiteret: 55,
  //     disponeret: 55
  //   }, {
  //     week: 'Uge 4',
  //     visiteret: 55,
  //     disponeret: 60
  //   }]
  // }, {
  //   id: 17,
  //   name: 'Borger 17',
  //   teamId: 4,
  //   pathways: [{
  //     id: 1,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }, {
  //     id: 2,
  //     visiteret: 150,
  //     disponeret: 165,
  //     balance: -15,
  //   }, {
  //     id: 3,
  //     visiteret: 0,
  //     disponeret: 0,
  //     balance: 0,
  //   }],
  //   weeklyData: [{
  //     week: 'Uge 1',
  //     visiteret: 150,
  //     disponeret: 140
  //   }, {
  //     week: 'Uge 2',
  //     visiteret: 150,
  //     disponeret: 150
  //   }, {
  //     week: 'Uge 3',
  //     visiteret: 150,
  //     disponeret: 160
  //   }, {
  //     week: 'Uge 4',
  //     visiteret: 150,
  //     disponeret: 165
  //   }]
  // }
]
};