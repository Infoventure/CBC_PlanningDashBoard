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
        procedures: Record<string, Procedure>
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
  title: string,
  pathwayId: string,
  simplePathwayId: string,
  pathwayName: string,
  patientId: string,
  periodStart: string,
  periodEnd: string|null,
  relevantWeeks: string[],
}
export interface KompasData {
  appointments: Appointment[];
  visitation: Visitation[];
}

// Endpoint fetch and transform
export async function fetchKompasData(): Promise<MockData> {
  const res = await fetch("http://10.30.8.72:5000/kompas-data");
  const data : KompasData = await res.json();

  let processedCitizens : Record<string, Citizen> = {};

  // Create a record mapping visitation.id to visitation object
  const visitationById: Record<string, Visitation> = {};
  for (const visit of data.visitation) {
    visitationById[visit.id] = visit;
  }

  for (const appt of data.appointments) {

    // If citizen not processed yet, create new
    if (!processedCitizens[appt.curaPatientId]) {
      processedCitizens[appt.curaPatientId] = {
        id: appt.curaPatientId,
        cpr: "000000-0000" as any,  // Replace with real CPR if available
        name: appt.curaPatientId as any,      // Replace with real name if available
        teamId: 1,                   // Replace with real teamId if available
        pathwayData: {}
      };
    }
    let citizenData = processedCitizens[appt.curaPatientId];

    // If pathway not processed yet create new
    if(!citizenData.pathwayData[appt.curaSimplePathwayId]) {
      citizenData.pathwayData[appt.curaSimplePathwayId] = {};
    }

    // If this week in the pathway has not been processed yet create new
    if (!citizenData.pathwayData[appt.curaSimplePathwayId][appt.week]) {
      citizenData.pathwayData[appt.curaSimplePathwayId][appt.week] = {
        total: { visiteret: 0, disponeret: 0 },
        procedures: {}
      };
    }
    let weekData = citizenData.pathwayData[appt.curaSimplePathwayId][appt.week];

    // If this procedure has not been processed yet create new
    if (!weekData.procedures[appt.curaGrantedProcedureId]) {
      weekData.procedures[appt.curaGrantedProcedureId] = {
        name: appt.curaProcedureTitle,
        id: appt.curaGrantedProcedureId,
        visiteret: 0,
        disponeret: appt.duration
      }
      weekData.total.disponeret += appt.duration;
      // weekData.total.visiteret += 0;
    }
    else { // Else just add disponeret time
      weekData.procedures[appt.curaGrantedProcedureId].disponeret += appt.duration;
      weekData.total.disponeret += appt.duration;
    }
  }

  // Now loop our visitation data, and add visiteret times to each relevant procedure
  for (const visit of data.visitation) {
    // Ensure all objects exist as in the forloop above
    if (!processedCitizens[visit.patientId]) {
      processedCitizens[visit.patientId] = {
        id: visit.patientId,
        cpr: "000000-0000" as any,
        name: visit.patientId as any,
        teamId: 1,
        pathwayData: {}
      };
    }
    let citizenData = processedCitizens[visit.patientId];
    // If the pathway does not exist yet, create it as empty
    if (!citizenData.pathwayData[visit.simplePathwayId]) {
      citizenData.pathwayData[visit.simplePathwayId] = {};
    }

    let weeks = citizenData.pathwayData[visit.simplePathwayId];
    // Ensure all weeks in visit.relevantWeeks exist
    if (Array.isArray(visit.relevantWeeks)) {
      for (const relevantWeek of visit.relevantWeeks) {
        if (!weeks[relevantWeek]) { // If the relevant week does not exist in their data yet, create it
          weeks[relevantWeek] = {
            total: { visiteret: 0, disponeret: 0 },
            procedures: {}
          };
        }
      }
    }

    // Now we can insert each the procedure into each week
    for (const week in weeks) {
      if (!visit.relevantWeeks || !visit.relevantWeeks.includes(week)) {
        continue; // Skip weeks that are not relevant for this visitation
      }

      const thisWeekData = weeks[week];
      // Ensure the procedure exists for this visitation id
      if (!thisWeekData.procedures[visit.id]) {
        thisWeekData.procedures[visit.id] = {
          name: visit.title,
          id: visit.id,
          visiteret: 0,
          disponeret: 0
        };
      }
      // Add visiteret time if this is the correct procedure
      thisWeekData.procedures[visit.id].visiteret += visit.day + visit.eve;
      thisWeekData.total.visiteret += visit.day + visit.eve;
    }
  }

  // const citizensMap: Record<string, Citizen> = {};

  // // Process appointments
  // for (const appt of data.appointments || []) {
  //   console.log(appt);
  //   const patientId = appt.curaPatientId;
  //   if (!citizensMap[patientId]) {
  //     citizensMap[patientId] = {
  //       id: patientId,
  //       cpr: "000000-0000" as any,  // Replace with real CPR if available
  //       name: "Test",               // Replace with real name if available
  //       teamId: 1,                  // Replace with real teamId if available
  //       pathwayData: {},
  //     };
  //   }

  //   const citizen = citizensMap[patientId];
  //   const pathwayId = appt.curaSimplePathwayId; // Assuming simplePathwayId links to pathway
  //   if (!citizen.pathwayData[pathwayId]) {
  //     citizen.pathwayData[pathwayId] = {};
  //   }

  //   const week = appt.week;
  //   if (!citizen.pathwayData[pathwayId][week]) {
  //     citizen.pathwayData[pathwayId][week] = {
  //       total: { visiteret: 0, disponeret: 0 },
  //       procedures: [],
  //     };
  //   }

  //   citizen.pathwayData[pathwayId][week].procedures.push({
  //     name: appt.curaProcedureTitle,
  //     id: appt.curaGrantedProcedureId,
  //     visiteret: 0,       // You may need logic to fill this
  //     disponeret: appt.duration,
  //   });

  //   citizen.pathwayData[pathwayId][week].total.disponeret += appt.duration;
  // }

  // // Process visitation
  // for (const visit of data.visitation || []) {
  //   const patientId = visit.patientId;
  //   if (!citizensMap[patientId]) continue;

  //   const citizen = citizensMap[patientId];
  //   const pathwayId = visit.simplePathwayId;
  //   if (!citizen.pathwayData[pathwayId]) citizen.pathwayData[pathwayId] = {};

  //   const week = "unknown-week"; // Replace with logic if week is available
  //   if (!citizen.pathwayData[pathwayId][week]) {
  //     citizen.pathwayData[pathwayId][week] = {
  //       total: { visiteret: 0, disponeret: 0 },
  //       procedures: [],
  //     };
  //   }

  //   citizen.pathwayData[pathwayId][week].total.visiteret += visit.day + visit.eve;
  // }

  console.log(
    {
      pathways: mockData.pathways, // Using mock pathways for now
      citizens: processedCitizens ? Object.values(processedCitizens) : [],
    }
  )

  return {
    pathways: mockData.pathways, // Using mock pathways for now
    citizens: processedCitizens ? Object.values(processedCitizens) : [],
  };
}


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
          procedures: {
            "proc-1": { name: 'Procedure A', id: 'proc-1', visiteret: 15, disponeret: 17 },
            "proc-2": { name: 'Procedure B', id: 'proc-2', visiteret: 7, disponeret: 8 }
          }
        },
        "43-2025": {
          total: { visiteret: 26, disponeret: 23 },
          procedures: {
            "proc-1": { name: 'Procedure A', id: 'proc-1', visiteret: 18, disponeret: 15 },
            "proc-2": { name: 'Procedure B', id: 'proc-2', visiteret: 8, disponeret: 8 }
          }
        },
        "44-2025": {
          total: { visiteret: 28, disponeret: 30 },
          procedures: {
            "proc-1": { name: 'Procedure A', id: 'proc-1', visiteret: 20, disponeret: 22 },
            "proc-2": { name: 'Procedure B', id: 'proc-2', visiteret: 8, disponeret: 8 }
          }
        },
        "45-2025": {
          total: { visiteret: 25, disponeret: 24 },
          procedures: {
            "proc-1": { name: 'Procedure A', id: 'proc-1', visiteret: 18, disponeret: 17 },
            "proc-2": { name: 'Procedure B', id: 'proc-2', visiteret: 7, disponeret: 7 }
          }
        }
      },
    }
  },
]
};