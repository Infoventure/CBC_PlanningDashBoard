export interface Procedure {
  name: string;
  visiteret: number;
  disponeret: number;
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
  pathwayData: {
    [pathwayId: number]: {
      [week: string]: {
        total: { visiteret: number; disponeret: number },
        procedures: Procedure[]
      }
    }
  };
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
  pathways: [
    {
      id: 1,
      name: 'Forløb 1',
      mediantime: 24
    }, {
      id: 2,
      name: 'Forløb 2',
      mediantime: 133
    }, {
      id: 3,
      name: 'Forløb 3',
      mediantime: 384
    },
    {
      id: 4,
      name: 'Forløb 4',
      mediantime: 854
    },
    {
      id: 5,
      name: 'Forløb 5',
      mediantime: 1745
    }
  ],
  citizens: [
  // Team 1 citizens
    {
      id: 1,
      name: 'Mads Testersen',
      cpr: '010101-1233',
      teamId: 1,
      pathwayData: {
        1: {
          "44-2025": {
            total: { visiteret: 40, disponeret: 39 },
            procedures: [{
              name: 'Procedure A',
              visiteret: 30, disponeret: 28
            }, {
              name: 'Procedure B',
              visiteret: 10, disponeret: 11
            }]
          },
          "45-2025": {
            total: { visiteret: 40, disponeret: 50 },
            procedures: [{
              name: 'Procedure A',
              visiteret: 30, disponeret: 35
            }, {
              name: 'Procedure B',
              visiteret: 10, disponeret: 15
            }]
          }
        },
        2: {
          "44-2025": {
            total: { visiteret: 133, disponeret: 133 },
            procedures: [{
              name: 'Procedure A',
              visiteret: 100, disponeret: 100
            }, {
              name: 'Procedure B',
              visiteret: 33, disponeret: 33
            }]
          },
          "45-2025": {
            total: { visiteret: 120, disponeret: 120 },
            procedures: [{
              name: 'Procedure A',
              visiteret: 50, disponeret: 55
            }, {
              name: 'Procedure B',
              visiteret: 70, disponeret: 65
            }]
          }
        },
      }
    },
    {
      id: 2,
      name: 'Signe Testgaard',
      cpr: '020205-1234',
      teamId: 1,
      pathwayData: {
        1: {
          "44-2025": {
            total: { visiteret: 40, disponeret: 39 },
            procedures: [{
              name: 'Procedure A',
              visiteret: 30, disponeret: 28
            }, {
              name: 'Procedure B',
              visiteret: 10, disponeret: 11
            }]
          },
          "45-2025": {
            total: { visiteret: 40, disponeret: 50 },
            procedures: [{
              name: 'Procedure A',
              visiteret: 30, disponeret: 35
            }, {
              name: 'Procedure B',
              visiteret: 10, disponeret: 15
            }]
          }
        }
      }
    }
  ]
};