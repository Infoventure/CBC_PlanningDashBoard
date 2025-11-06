export interface Procedure {
  name: string;
  id: string;
  visiteret: number;
  disponeret: number;
}
export interface WeeklyData {
  week: string;
  visiteret: number;
  disponeret: number;
}
export interface Citizen {
  id: string;
  cpr: `${number}${number}${number}${number}${number}${number}-${number}${number}${number}${number}`;
  name: string;
  alert?: boolean;
  teamId: number;
  pathwayData: {
    [pathwayId: string]: {
      [week: string]: {
        total: { visiteret: number; disponeret: number },
        procedures: Procedure[]
      }
    }
  };
}
export interface Pathway {
  id: string;
  name: string;
  mediantime: number; // The median time for the pathway in minutes. This is the target that all procedures on the path should average to. This is the minutes that the munincipality reieves money based on. All procedures over the median is a loss of money.
}
export interface MockData {
  pathways: Pathway[];
  citizens: Citizen[];
}

export interface Appointment {
  curaGrantedProcedureId: string,
  curaId: string,
  curaPathwayId: string,
  curaSimplePathwayId: string,
  curaPatientId: string,
  curaProcedureId: string,
  curaProcedureTitle: string,
  duration: number,
  endTime: string,
  startTime: string,
  week: string
}
export interface Visitation {
  day: number,
  eve: number,
  id: string,
  pathwayId: string,
  simplePathwayId: string,
  pathwayName: string,
  patientId: string
}
export interface KompasData {
  appointments: Appointment[];
  visitation: Visitation[];
}

// Endpoint fetch and transform
// export async function fetchKompasData(): Promise<MockData> {
//   const res = await fetch("http://10.30.8.72:5000/kompas-data");
//   const data : KompasData = await res.json();

//   let processedCitizens : Record<string, Citizen> = {};

//   for (const appt of data.appointments) {

//     // If citizen not processed yet, create new
//     if (!processedCitizens[appt.curaPatientId]) {
//       processedCitizens[appt.curaPatientId] = {
//         id: appt.curaPatientId,
//         cpr: "000000-0000" as any,  // Replace with real CPR if available
//         name: "Unknown" as any,      // Replace with real name if available
//         teamId: 1,                   // Replace with real teamId if available
//         pathwayData: {}
//       };
//     }
//     let citizenData = processedCitizens[appt.curaPatientId];

//     // If this week in the pathway has not been processed yet create new
//     if (!citizenData.pathwayData[appt.curaSimplePathwayId][appt.week]) {
//       citizenData.pathwayData[appt.curaSimplePathwayId][appt.week] = {
//         total: { visiteret: 0, disponeret: 0 },
//         procedures: []
//       };
//     }
//     let weekData = citizenData.pathwayData[appt.curaSimplePathwayId][appt.week];

//     weekData.procedures.push({
//       name: appt.curaProcedureTitle,
//       id: appt.curaGrantedProcedureId,
//       visiteret: 0,
//       disponeret: appt.duration,
//     })

//   // const citizensMap: Record<string, Citizen> = {};

//   // // Process appointments
//   // for (const appt of data.appointments || []) {
//   //   console.log(appt);
//   //   const patientId = appt.curaPatientId;
//   //   if (!citizensMap[patientId]) {
//   //     citizensMap[patientId] = {
//   //       id: patientId,
//   //       cpr: "000000-0000" as any,  // Replace with real CPR if available
//   //       name: "Test",               // Replace with real name if available
//   //       teamId: 1,                  // Replace with real teamId if available
//   //       pathwayData: {},
//   //     };
//   //   }

//   //   const citizen = citizensMap[patientId];
//   //   const pathwayId = appt.curaSimplePathwayId; // Assuming simplePathwayId links to pathway
//   //   if (!citizen.pathwayData[pathwayId]) {
//   //     citizen.pathwayData[pathwayId] = {};
//   //   }

//   //   const week = appt.week;
//   //   if (!citizen.pathwayData[pathwayId][week]) {
//   //     citizen.pathwayData[pathwayId][week] = {
//   //       total: { visiteret: 0, disponeret: 0 },
//   //       procedures: [],
//   //     };
//   //   }

//   //   citizen.pathwayData[pathwayId][week].procedures.push({
//   //     name: appt.curaProcedureTitle,
//   //     id: appt.curaGrantedProcedureId,
//   //     visiteret: 0,       // You may need logic to fill this
//   //     disponeret: appt.duration,
//   //   });

//   //   citizen.pathwayData[pathwayId][week].total.disponeret += appt.duration;
//   // }

//   // // Process visitation
//   // for (const visit of data.visitation || []) {
//   //   const patientId = visit.patientId;
//   //   if (!citizensMap[patientId]) continue;

//   //   const citizen = citizensMap[patientId];
//   //   const pathwayId = visit.simplePathwayId;
//   //   if (!citizen.pathwayData[pathwayId]) citizen.pathwayData[pathwayId] = {};

//   //   const week = "unknown-week"; // Replace with logic if week is available
//   //   if (!citizen.pathwayData[pathwayId][week]) {
//   //     citizen.pathwayData[pathwayId][week] = {
//   //       total: { visiteret: 0, disponeret: 0 },
//   //       procedures: [],
//   //     };
//   //   }

//   //   citizen.pathwayData[pathwayId][week].total.visiteret += visit.day + visit.eve;
//   // }

//   return {
//     pathways: mockData.pathways, // Using mock pathways for now
//     citizens: mockData.citizens,
//   };
// }


export const mockData: MockData = {
  pathways: [
    {
      id: 'Forløb 1',
      name: 'Forløb 1',
      mediantime: 24
    }, {
      id: 'Forløb 2',
      name: 'Forløb 2',
      mediantime: 133
    }, {
      id: 'Forløb 3',
      name: 'Forløb 3',
      mediantime: 384
    },
    {
      id: 'Forløb 4',
      name: 'Forløb 4',
      mediantime: 854
    },
    {
      id: 'Forløb 5',
      name: 'Forløb 5',
      mediantime: 1745
    }
  ],
  citizens: [
  // Team 1 citizens
  {
    id: "1",
    name: 'Mads Testersen',
    cpr: '010101-1233',
    teamId: 1,
    pathwayData: {
      "Forløb 1": {
        "42-2025": {
          total: { visiteret: 22, disponeret: 25 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 15, disponeret: 17 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 7, disponeret: 8 }
          ]
        },
        "43-2025": {
          total: { visiteret: 26, disponeret: 23 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 18, disponeret: 15 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 8, disponeret: 8 }
          ]
        },
        "44-2025": {
          total: { visiteret: 28, disponeret: 30 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 20, disponeret: 22 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 8, disponeret: 8 }
          ]
        },
        "45-2025": {
          total: { visiteret: 25, disponeret: 24 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 18, disponeret: 17 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 7, disponeret: 7 }
          ]
        }
      },
      "Forløb 2": {
        "42-2025": {
          total: { visiteret: 115, disponeret: 125 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 80, disponeret: 85 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 35, disponeret: 40 }
          ]
        },
        "43-2025": {
          total: { visiteret: 130, disponeret: 135 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 90, disponeret: 95 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 40, disponeret: 40 }
          ]
        },
        "44-2025": {
          total: { visiteret: 125, disponeret: 120 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 85, disponeret: 80 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 40, disponeret: 40 }
          ]
        },
        "45-2025": {
          total: { visiteret: 140, disponeret: 150 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 90, disponeret: 100 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 50, disponeret: 50 }
          ]
        }
      },
      "Forløb 3": {
        "42-2025": {
          total: { visiteret: 350, disponeret: 380 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 250, disponeret: 270 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 100, disponeret: 110 }
          ]
        },
        "43-2025": {
          total: { visiteret: 400, disponeret: 420 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 280, disponeret: 290 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 120, disponeret: 130 }
          ]
        },
        "44-2025": {
          total: { visiteret: 380, disponeret: 390 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 260, disponeret: 270 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 120, disponeret: 120 }
          ]
        },
        "45-2025": {
          total: { visiteret: 370, disponeret: 360 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 250, disponeret: 250 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 120, disponeret: 110 }
          ]
        }
      },
      "Forløb 4": {
        "42-2025": {
          total: { visiteret: 880, disponeret: 900 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 600, disponeret: 620 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 280, disponeret: 280 }
          ]
        },
        "43-2025": {
          total: { visiteret: 840, disponeret: 850 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 570, disponeret: 580 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 270, disponeret: 270 }
          ]
        },
        "44-2025": {
          total: { visiteret: 870, disponeret: 860 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 590, disponeret: 580 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 280, disponeret: 280 }
          ]
        },
        "45-2025": {
          total: { visiteret: 860, disponeret: 890 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 580, disponeret: 610 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 280, disponeret: 280 }
          ]
        }
      },
      "Forløb 5": {
        "42-2025": {
          total: { visiteret: 1600, disponeret: 1700 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1100, disponeret: 1200 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 500, disponeret: 500 }
          ]
        },
        "43-2025": {
          total: { visiteret: 1750, disponeret: 1800 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1200, disponeret: 1250 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 550, disponeret: 550 }
          ]
        },
        "44-2025": {
          total: { visiteret: 1800, disponeret: 1850 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1250, disponeret: 1300 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 550, disponeret: 550 }
          ]
        },
        "45-2025": {
          total: { visiteret: 1700, disponeret: 1650 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1150, disponeret: 1100 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 550, disponeret: 550 }
          ]
        }
      }
    }
  },
  {
    id: "2",
    name: 'Signe Testgaard',
    cpr: '020205-1234',
    teamId: 1,
    pathwayData: {
      "Forløb 1": {
        "42-2025": {
          total: { visiteret: 20, disponeret: 22 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 14, disponeret: 15 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 6, disponeret: 7 }
          ]
        },
        "43-2025": {
          total: { visiteret: 25, disponeret: 24 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 18, disponeret: 17 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 7, disponeret: 7 }
          ]
        },
        "44-2025": {
          total: { visiteret: 28, disponeret: 30 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 20, disponeret: 22 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 8, disponeret: 8 }
          ]
        },
        "45-2025": {
          total: { visiteret: 25, disponeret: 26 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 18, disponeret: 19 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 7, disponeret: 7 }
          ]
        }
      },
      "Forløb 2": {
        "42-2025": {
          total: { visiteret: 120, disponeret: 110 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 80, disponeret: 75 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 40, disponeret: 35 }
          ]
        },
        "43-2025": {
          total: { visiteret: 130, disponeret: 140 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 85, disponeret: 90 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 45, disponeret: 50 }
          ]
        },
        "44-2025": {
          total: { visiteret: 135, disponeret: 130 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 90, disponeret: 85 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 45, disponeret: 45 }
          ]
        },
        "45-2025": {
          total: { visiteret: 125, disponeret: 120 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 80, disponeret: 75 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 45, disponeret: 45 }
          ]
        }
      },
      "Forløb 3": {
        "42-2025": {
          total: { visiteret: 360, disponeret: 370 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 250, disponeret: 260 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 110, disponeret: 110 }
          ]
        },
        "43-2025": {
          total: { visiteret: 390, disponeret: 400 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 270, disponeret: 280 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 120, disponeret: 120 }
          ]
        },
        "44-2025": {
          total: { visiteret: 380, disponeret: 390 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 260, disponeret: 270 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 120, disponeret: 120 }
          ]
        },
        "45-2025": {
          total: { visiteret: 400, disponeret: 380 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 270, disponeret: 260 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 130, disponeret: 120 }
          ]
        }
      },
      "Forløb 4": {
        "42-2025": {
          total: { visiteret: 830, disponeret: 870 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 570, disponeret: 600 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 260, disponeret: 270 }
          ]
        },
        "43-2025": {
          total: { visiteret: 850, disponeret: 880 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 580, disponeret: 610 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 270, disponeret: 270 }
          ]
        },
        "44-2025": {
          total: { visiteret: 870, disponeret: 890 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 590, disponeret: 610 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 280, disponeret: 280 }
          ]
        },
        "45-2025": {
          total: { visiteret: 860, disponeret: 840 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 580, disponeret: 560 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 280, disponeret: 280 }
          ]
        }
      },
      "Forløb 5": {
        "42-2025": {
          total: { visiteret: 1650, disponeret: 1700 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1150, disponeret: 1200 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 500, disponeret: 500 }
          ]
        },
        "43-2025": {
          total: { visiteret: 1750, disponeret: 1800 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1200, disponeret: 1250 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 550, disponeret: 550 }
          ]
        },
        "44-2025": {
          total: { visiteret: 1850, disponeret: 1900 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1300, disponeret: 1350 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 550, disponeret: 550 }
          ]
        },
        "45-2025": {
          total: { visiteret: 1750, disponeret: 1650 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1200, disponeret: 1100 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 550, disponeret: 550 }
          ]
        }
      }
    }
  },
  {
    id: "3",
    name: 'Simon Lundtest',
    cpr: '050177-1235',
    teamId: 1,
    pathwayData: {
      "Forløb 1": {
        "42-2025": {
          total: { visiteret: 22, disponeret: 25 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 15, disponeret: 17 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 7, disponeret: 8 }
          ]
        },
        "43-2025": {
          total: { visiteret: 26, disponeret: 23 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 18, disponeret: 15 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 8, disponeret: 8 }
          ]
        },
        "44-2025": {
          total: { visiteret: 28, disponeret: 30 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 20, disponeret: 22 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 8, disponeret: 8 }
          ]
        },
        "45-2025": {
          total: { visiteret: 25, disponeret: 24 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 18, disponeret: 17 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 7, disponeret: 7 }
          ]
        }
      },
      "Forløb 2": {
        "42-2025": {
          total: { visiteret: 115, disponeret: 125 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 80, disponeret: 85 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 35, disponeret: 40 }
          ]
        },
        "43-2025": {
          total: { visiteret: 130, disponeret: 135 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 90, disponeret: 95 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 40, disponeret: 40 }
          ]
        },
        "44-2025": {
          total: { visiteret: 125, disponeret: 120 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 85, disponeret: 80 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 40, disponeret: 40 }
          ]
        },
        "45-2025": {
          total: { visiteret: 140, disponeret: 150 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 90, disponeret: 100 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 50, disponeret: 50 }
          ]
        }
      },
      "Forløb 3": {
        "42-2025": {
          total: { visiteret: 350, disponeret: 380 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 250, disponeret: 270 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 100, disponeret: 110 }
          ]
        },
        "43-2025": {
          total: { visiteret: 400, disponeret: 420 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 280, disponeret: 290 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 120, disponeret: 130 }
          ]
        },
        "44-2025": {
          total: { visiteret: 380, disponeret: 390 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 260, disponeret: 270 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 120, disponeret: 120 }
          ]
        },
        "45-2025": {
          total: { visiteret: 370, disponeret: 360 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 250, disponeret: 250 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 120, disponeret: 110 }
          ]
        }
      },
      "Forløb 4": {
        "42-2025": {
          total: { visiteret: 880, disponeret: 900 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 600, disponeret: 620 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 280, disponeret: 280 }
          ]
        },
        "43-2025": {
          total: { visiteret: 840, disponeret: 850 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 570, disponeret: 580 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 270, disponeret: 270 }
          ]
        },
        "44-2025": {
          total: { visiteret: 870, disponeret: 860 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 590, disponeret: 580 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 280, disponeret: 280 }
          ]
        },
        "45-2025": {
          total: { visiteret: 860, disponeret: 890 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 580, disponeret: 610 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 280, disponeret: 280 }
          ]
        }
      },
      "Forløb 5": {
        "42-2025": {
          total: { visiteret: 1600, disponeret: 1700 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1100, disponeret: 1200 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 500, disponeret: 500 }
          ]
        },
        "43-2025": {
          total: { visiteret: 1750, disponeret: 1800 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1200, disponeret: 1250 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 550, disponeret: 550 }
          ]
        },
        "44-2025": {
          total: { visiteret: 1800, disponeret: 1850 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1250, disponeret: 1300 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 550, disponeret: 550 }
          ]
        },
        "45-2025": {
          total: { visiteret: 1700, disponeret: 1650 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1150, disponeret: 1100 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 550, disponeret: 550 }
          ]
        }
      }
    }
  },
  {
    id: "4",
    name: 'Annemette Test',
    cpr: '020567-1452',
    teamId: 1,
    pathwayData: {
      "Forløb 1": {
        "42-2025": {
          total: { visiteret: 20, disponeret: 22 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 14, disponeret: 15 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 6, disponeret: 7 }
          ]
        },
        "43-2025": {
          total: { visiteret: 25, disponeret: 24 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 18, disponeret: 17 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 7, disponeret: 7 }
          ]
        },
        "44-2025": {
          total: { visiteret: 28, disponeret: 30 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 20, disponeret: 22 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 8, disponeret: 8 }
          ]
        },
        "45-2025": {
          total: { visiteret: 25, disponeret: 26 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 18, disponeret: 19 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 7, disponeret: 7 }
          ]
        }
      },
      "Forløb 2": {
        "42-2025": {
          total: { visiteret: 120, disponeret: 110 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 80, disponeret: 75 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 40, disponeret: 35 }
          ]
        },
        "43-2025": {
          total: { visiteret: 130, disponeret: 140 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 85, disponeret: 90 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 45, disponeret: 50 }
          ]
        },
        "44-2025": {
          total: { visiteret: 135, disponeret: 130 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 90, disponeret: 85 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 45, disponeret: 45 }
          ]
        },
        "45-2025": {
          total: { visiteret: 125, disponeret: 120 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 80, disponeret: 75 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 45, disponeret: 45 }
          ]
        }
      },
      "Forløb 3": {
        "42-2025": {
          total: { visiteret: 360, disponeret: 370 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 250, disponeret: 260 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 110, disponeret: 110 }
          ]
        },
        "43-2025": {
          total: { visiteret: 390, disponeret: 400 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 270, disponeret: 280 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 120, disponeret: 120 }
          ]
        },
        "44-2025": {
          total: { visiteret: 380, disponeret: 390 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 260, disponeret: 270 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 120, disponeret: 120 }
          ]
        },
        "45-2025": {
          total: { visiteret: 400, disponeret: 380 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 270, disponeret: 260 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 130, disponeret: 120 }
          ]
        }
      },
      "Forløb 4": {
        "42-2025": {
          total: { visiteret: 830, disponeret: 870 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 570, disponeret: 600 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 260, disponeret: 270 }
          ]
        },
        "43-2025": {
          total: { visiteret: 850, disponeret: 880 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 580, disponeret: 610 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 270, disponeret: 270 }
          ]
        },
        "44-2025": {
          total: { visiteret: 870, disponeret: 890 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 590, disponeret: 610 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 280, disponeret: 280 }
          ]
        },
        "45-2025": {
          total: { visiteret: 860, disponeret: 840 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 580, disponeret: 560 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 280, disponeret: 280 }
          ]
        }
      },
      "Forløb 5": {
        "42-2025": {
          total: { visiteret: 1650, disponeret: 1700 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1150, disponeret: 1200 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 500, disponeret: 500 }
          ]
        },
        "43-2025": {
          total: { visiteret: 1750, disponeret: 1800 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1200, disponeret: 1250 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 550, disponeret: 550 }
          ]
        },
        "44-2025": {
          total: { visiteret: 1850, disponeret: 1900 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1300, disponeret: 1350 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 550, disponeret: 550 }
          ]
        },
        "45-2025": {
          total: { visiteret: 1750, disponeret: 1650 },
          procedures: [
            { name: 'Procedure A', id: 'proc-1', visiteret: 1200, disponeret: 1100 },
            { name: 'Procedure B', id: 'proc-2', visiteret: 550, disponeret: 550 }
          ]
        }
      }
    }
  }
]
};