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
        status: 'gray' | 'green' | 'yellow' | 'red';
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
  minTime: number; // The minimum time for the pathway in minutes.
  maxTime: number | null; // The maximum time for the pathway in minutes.
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

const now = new Date();
function getISOWeek(date: Date) {
    const tmp = new Date(date.getTime());
    tmp.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
    // January 4 is always in week 1.
    const week1 = new Date(tmp.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return (
    1 +
    Math.round(
        ((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
    );
}
export const currentWeek = getISOWeek(now);
export const currentYear = now.getFullYear();

// Endpoint fetch and transform
export async function fetchKompasData(): Promise<MockData> {
    const res = await fetch("http://10.30.8.72:5001/kompas-data");
    const data : KompasData = await res.json();

    // throw new Error("Disabled temporary for testing");

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
                status: 'gray',
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
                status: 'gray',
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

    // Here

    for (const citizenId in processedCitizens) {
        const citizen = processedCitizens[citizenId];
        for (const pathwayId in citizen.pathwayData) {
            const pathwayWeeks = citizen.pathwayData[pathwayId];
            // Find the pathway definition for min/max
            const pathwayDef = (mockData.pathways || []).find(p => p.id === pathwayId);
            if (!pathwayDef) continue;
            const min = pathwayDef.minTime;
            const max = pathwayDef.maxTime;
            const range = (max ?? 10000) - min;
            const twentyPercent = 0.2 * range;
            for (const week in pathwayWeeks) {
                const weekData = pathwayWeeks[week];
                const disponeret = weekData.total?.disponeret ?? 0;
                if (disponeret < min || disponeret > (max ?? 10000)) {
                    weekData.status = 'red';
                } else if (
                    disponeret <= min + twentyPercent ||
                    disponeret >= (max ?? 10000) - twentyPercent
                ) {
                    weekData.status = 'yellow';
                } else {
                    weekData.status = 'green';
                }
            }
        }
    }


    // Example POST request to fetch CPR for citizens
    try {
        const postRes = await fetch("http://10.30.8.72:5001/cpr-for-citizens", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: "mbntest2770!",
                ids: Object.keys(processedCitizens)
            })
        });
        const cprResult = await postRes.json();
        // cprResult is a list of { cpr, curaId, fullName }
        if (Array.isArray(cprResult)) {
            for (const entry of cprResult) {
                const { curaId, cpr, fullName } = entry;
                if (processedCitizens[curaId]) {
                    processedCitizens[curaId].cpr = cpr;
                    processedCitizens[curaId].name = fullName;
                }
            }
        }
    } catch (err) {
        console.error('Failed to fetch CPR for citizens:', err);
    }

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
      mediantime: 24,
      minTime: 0,
      maxTime: 59,
    }, {
      id: 'Forløb 2',
      name: 'Forløb 2',
      mediantime: 133,
      minTime: 60,
      maxTime: 239,
    }, {
      id: 'Forløb 3',
      name: 'Forløb 3',
      mediantime: 384,
      minTime: 240,
      maxTime: 599,
    },
    {
      id: 'Forløb 4',
      name: 'Forløb 4',
      mediantime: 854,
      minTime: 600,
      maxTime: 1199,
    },
    {
      id: 'Forløb 5',
      name: 'Forløb 5',
      mediantime: 1745,
      minTime: 1200,
      maxTime: null,
    }
  ],
  citizens:[
    {
        "id": "f222bac2-e823-43b4-9c86-f215ab30fb66",
        "cpr": "161616-1616",
        "name": "Olga Testgren",
        "teamId": 1,
        "pathwayData": {
            "Forløb 2": {
                "44-2025": {
                    "status": "yellow",
                    "total": {
                        "visiteret": 210,
                        "disponeret": 75
                    },
                    "procedures": {
                        "93aa3719-f82c-4191-8d65-28fa73f32b43": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "93aa3719-f82c-4191-8d65-28fa73f32b43",
                            "visiteret": 60,
                            "disponeret": 30
                        },
                        "0e4f91df-2f3e-4984-9cf1-6130107fca89": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "0e4f91df-2f3e-4984-9cf1-6130107fca89",
                            "visiteret": 150,
                            "disponeret": 45
                        }
                    }
                },
                "45-2025": {
                    "status": "yellow",
                    "total": {
                        "visiteret": 210,
                        "disponeret": 220
                    },
                    "procedures": {
                        "0e4f91df-2f3e-4984-9cf1-6130107fca89": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "0e4f91df-2f3e-4984-9cf1-6130107fca89",
                            "visiteret": 150,
                            "disponeret": 150
                        },
                        "93aa3719-f82c-4191-8d65-28fa73f32b43": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "93aa3719-f82c-4191-8d65-28fa73f32b43",
                            "visiteret": 60,
                            "disponeret": 70
                        }
                    }
                },
                "46-2025": {
                    "status": "yellow",
                    "total": {
                        "visiteret": 210,
                        "disponeret": 220
                    },
                    "procedures": {
                        "0e4f91df-2f3e-4984-9cf1-6130107fca89": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "0e4f91df-2f3e-4984-9cf1-6130107fca89",
                            "visiteret": 150,
                            "disponeret": 150
                        },
                        "93aa3719-f82c-4191-8d65-28fa73f32b43": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "93aa3719-f82c-4191-8d65-28fa73f32b43",
                            "visiteret": 60,
                            "disponeret": 70
                        }
                    }
                }
            },
            "Forløb 4": {
                "45-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 455,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d154bbe4-21ae-4bb7-8f2e-21c91e3a3ba4": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "d154bbe4-21ae-4bb7-8f2e-21c91e3a3ba4",
                            "visiteret": 200,
                            "disponeret": 0
                        },
                        "276b28e5-a50a-4bc9-bdc8-01360b812fc3": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "276b28e5-a50a-4bc9-bdc8-01360b812fc3",
                            "visiteret": 200,
                            "disponeret": 0
                        },
                        "7439fd94-2ab9-427a-9c4e-24c6d65e62e5": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "7439fd94-2ab9-427a-9c4e-24c6d65e62e5",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "09954e2e-364c-465e-bbf7-5f4b50eab8d9": {
                            "name": "Indkøb (FSIII)",
                            "id": "09954e2e-364c-465e-bbf7-5f4b50eab8d9",
                            "visiteret": 55,
                            "disponeret": 0
                        }
                    }
                },
                "46-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 455,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d154bbe4-21ae-4bb7-8f2e-21c91e3a3ba4": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "d154bbe4-21ae-4bb7-8f2e-21c91e3a3ba4",
                            "visiteret": 200,
                            "disponeret": 0
                        },
                        "276b28e5-a50a-4bc9-bdc8-01360b812fc3": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "276b28e5-a50a-4bc9-bdc8-01360b812fc3",
                            "visiteret": 200,
                            "disponeret": 0
                        },
                        "7439fd94-2ab9-427a-9c4e-24c6d65e62e5": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "7439fd94-2ab9-427a-9c4e-24c6d65e62e5",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "09954e2e-364c-465e-bbf7-5f4b50eab8d9": {
                            "name": "Indkøb (FSIII)",
                            "id": "09954e2e-364c-465e-bbf7-5f4b50eab8d9",
                            "visiteret": 55,
                            "disponeret": 0
                        }
                    }
                }
            }
        }
    },
    {
        "id": "3525ab02-e036-4d3c-a385-e211252c50ff",
        "cpr": "191919-1919",
        "name": "Hanne Test Testerson",
        "teamId": 1,
        "pathwayData": {
            "Forløb 4": {
                "44-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 700,
                        "disponeret": 238
                    },
                    "procedures": {
                        "0d8d3f82-23ec-4d34-83bf-e300034877a2": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "0d8d3f82-23ec-4d34-83bf-e300034877a2",
                            "visiteret": 500,
                            "disponeret": 168
                        },
                        "eaba8fb8-ef94-42a0-8912-39e4c0513581": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "eaba8fb8-ef94-42a0-8912-39e4c0513581",
                            "visiteret": 200,
                            "disponeret": 70
                        },
                        "66402ada-c1a1-4e65-8f97-04e6bb45dbfa": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "66402ada-c1a1-4e65-8f97-04e6bb45dbfa",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "1fb79df9-b5a5-43ae-b060-3882f9fa4d61": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "1fb79df9-b5a5-43ae-b060-3882f9fa4d61",
                            "visiteret": 0,
                            "disponeret": 0
                        }
                    }
                },
                "45-2025": {
                    "status": "yellow",
                    "total": {
                        "visiteret": 700,
                        "disponeret": 686
                    },
                    "procedures": {
                        "0d8d3f82-23ec-4d34-83bf-e300034877a2": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "0d8d3f82-23ec-4d34-83bf-e300034877a2",
                            "visiteret": 500,
                            "disponeret": 490
                        },
                        "eaba8fb8-ef94-42a0-8912-39e4c0513581": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "eaba8fb8-ef94-42a0-8912-39e4c0513581",
                            "visiteret": 200,
                            "disponeret": 196
                        },
                        "66402ada-c1a1-4e65-8f97-04e6bb45dbfa": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "66402ada-c1a1-4e65-8f97-04e6bb45dbfa",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "1fb79df9-b5a5-43ae-b060-3882f9fa4d61": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "1fb79df9-b5a5-43ae-b060-3882f9fa4d61",
                            "visiteret": 0,
                            "disponeret": 0
                        }
                    }
                },
                "46-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 700,
                        "disponeret": 588
                    },
                    "procedures": {
                        "0d8d3f82-23ec-4d34-83bf-e300034877a2": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "0d8d3f82-23ec-4d34-83bf-e300034877a2",
                            "visiteret": 500,
                            "disponeret": 420
                        },
                        "eaba8fb8-ef94-42a0-8912-39e4c0513581": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "eaba8fb8-ef94-42a0-8912-39e4c0513581",
                            "visiteret": 200,
                            "disponeret": 168
                        },
                        "66402ada-c1a1-4e65-8f97-04e6bb45dbfa": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "66402ada-c1a1-4e65-8f97-04e6bb45dbfa",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "1fb79df9-b5a5-43ae-b060-3882f9fa4d61": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "1fb79df9-b5a5-43ae-b060-3882f9fa4d61",
                            "visiteret": 0,
                            "disponeret": 0
                        }
                    }
                },
                "47-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 0,
                        "disponeret": 84
                    },
                    "procedures": {
                        "0d8d3f82-23ec-4d34-83bf-e300034877a2": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "0d8d3f82-23ec-4d34-83bf-e300034877a2",
                            "visiteret": 0,
                            "disponeret": 70
                        },
                        "eaba8fb8-ef94-42a0-8912-39e4c0513581": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "eaba8fb8-ef94-42a0-8912-39e4c0513581",
                            "visiteret": 0,
                            "disponeret": 14
                        }
                    }
                },
                "48-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 0,
                        "disponeret": 114
                    },
                    "procedures": {
                        "0d8d3f82-23ec-4d34-83bf-e300034877a2": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "0d8d3f82-23ec-4d34-83bf-e300034877a2",
                            "visiteret": 0,
                            "disponeret": 100
                        },
                        "eaba8fb8-ef94-42a0-8912-39e4c0513581": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "eaba8fb8-ef94-42a0-8912-39e4c0513581",
                            "visiteret": 0,
                            "disponeret": 14
                        }
                    }
                }
            }
        }
    },
    {
        "id": "d16a323d-1abb-4a8f-a71d-1cfb69ac4d84",
        "cpr": "151515-1515",
        "name": "Claus Testborg",
        "teamId": 1,
        "pathwayData": {
            "Forløb 1": {
                "43-2025": {
                    "status": "gray",
                    "total": {
                        "visiteret": 70,
                        "disponeret": 0
                    },
                    "procedures": {
                        "5ce4caab-d7ed-4be3-8ac7-16690b6b946f": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "5ce4caab-d7ed-4be3-8ac7-16690b6b946f",
                            "visiteret": 70,
                            "disponeret": 0
                        }
                    }
                },
                "44-2025": {
                    "status": "green",
                    "total": {
                        "visiteret": 70,
                        "disponeret": 20
                    },
                    "procedures": {
                        "5ce4caab-d7ed-4be3-8ac7-16690b6b946f": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "5ce4caab-d7ed-4be3-8ac7-16690b6b946f",
                            "visiteret": 70,
                            "disponeret": 20
                        }
                    }
                },
                "45-2025": {
                    "status": "yellow",
                    "total": {
                        "visiteret": 70,
                        "disponeret": 59
                    },
                    "procedures": {
                        "5ce4caab-d7ed-4be3-8ac7-16690b6b946f": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "5ce4caab-d7ed-4be3-8ac7-16690b6b946f",
                            "visiteret": 70,
                            "disponeret": 70
                        }
                    }
                },
                "46-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 70,
                        "disponeret": 90
                    },
                    "procedures": {
                        "5ce4caab-d7ed-4be3-8ac7-16690b6b946f": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "5ce4caab-d7ed-4be3-8ac7-16690b6b946f",
                            "visiteret": 70,
                            "disponeret": 90
                        }
                    }
                }
            }
        }
    },
    {
        "id": "d16a323d-1abb-4a8f-a71d-1cfb69ac4d88",
        "cpr": "141716-1516",
        "name": "Mette Test-Jul",
        "teamId": 1,
        "pathwayData": {
            "Forløb 1": {
                "43-2025": {
                    "status": "green",
                    "total": {
                        "visiteret": 50,
                        "disponeret": 20
                    },
                    "procedures": {
                        "5ce4caab-d7ed-4be3-8ac7-16690b6b946f": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "5ce4caab-d7ed-4be3-8ac7-16690b6b946f",
                            "visiteret": 50,
                            "disponeret": 20
                        }
                    }
                },
                "44-2025": {
                    "status": "green",
                    "total": {
                        "visiteret": 50,
                        "disponeret": 40
                    },
                    "procedures": {
                        "5ce4caab-d7ed-4be3-8ac7-16690b6b946f": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "5ce4caab-d7ed-4be3-8ac7-16690b6b946f",
                            "visiteret": 50,
                            "disponeret": 40
                        }
                    }
                },
                "45-2025": {
                    "status": "yellow",
                    "total": {
                        "visiteret": 50,
                        "disponeret": 59
                    },
                    "procedures": {
                        "5ce4caab-d7ed-4be3-8ac7-16690b6b946f": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "5ce4caab-d7ed-4be3-8ac7-16690b6b946f",
                            "visiteret": 50,
                            "disponeret": 70
                        }
                    }
                },
                "46-2025": {
                    "status": "yellow",
                    "total": {
                        "visiteret": 50,
                        "disponeret": 54
                    },
                    "procedures": {
                        "5ce4caab-d7ed-4be3-8ac7-16690b6b946f": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "5ce4caab-d7ed-4be3-8ac7-16690b6b946f",
                            "visiteret": 50,
                            "disponeret": 54
                        }
                    }
                }
            }
        }
    },
    {
        "id": "7d404089-b963-4d7d-aa3e-64aee693fc52",
        "cpr": "171717-1717",
        "name": "Frederik Gammeltest",
        "teamId": 1,
        "pathwayData": {
            "Forløb 5": {
                "48-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 0,
                        "disponeret": 180
                    },
                    "procedures": {
                        "1f2177ca-3b13-4565-b4c9-05e577d01fa9": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "1f2177ca-3b13-4565-b4c9-05e577d01fa9",
                            "visiteret": 0,
                            "disponeret": 180
                        }
                    }
                },
                "44-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 1755,
                        "disponeret": 0
                    },
                    "procedures": {
                        "cb254f93-ccf6-46a8-b82e-f6ff59330f96": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "cb254f93-ccf6-46a8-b82e-f6ff59330f96",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "0f1d594a-d438-43bc-8394-c24aa09f53ec": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "0f1d594a-d438-43bc-8394-c24aa09f53ec",
                            "visiteret": 210,
                            "disponeret": 0
                        },
                        "73c989cf-ec57-498a-94b0-9b0147f8eb3e": {
                            "name": "Indkøb (FSIII)",
                            "id": "73c989cf-ec57-498a-94b0-9b0147f8eb3e",
                            "visiteret": 15,
                            "disponeret": 0
                        },
                        "5a68971f-c370-451e-b2fc-894088e7a5af": {
                            "name": "Klippekort  (FSIII) (ÆL)",
                            "id": "5a68971f-c370-451e-b2fc-894088e7a5af",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "1f2177ca-3b13-4565-b4c9-05e577d01fa9": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "1f2177ca-3b13-4565-b4c9-05e577d01fa9",
                            "visiteret": 1530,
                            "disponeret": 0
                        },
                        "1fe54be7-ca03-4165-af0d-4e192f6689c7": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "1fe54be7-ca03-4165-af0d-4e192f6689c7",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "92e8cf2b-7602-45e1-8820-29cb5c9f36fc": {
                            "name": "Madservice (FSIII) (ÆL)",
                            "id": "92e8cf2b-7602-45e1-8820-29cb5c9f36fc",
                            "visiteret": 0,
                            "disponeret": 0
                        }
                    }
                },
                "45-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 1755,
                        "disponeret": 0
                    },
                    "procedures": {
                        "cb254f93-ccf6-46a8-b82e-f6ff59330f96": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "cb254f93-ccf6-46a8-b82e-f6ff59330f96",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "0f1d594a-d438-43bc-8394-c24aa09f53ec": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "0f1d594a-d438-43bc-8394-c24aa09f53ec",
                            "visiteret": 210,
                            "disponeret": 0
                        },
                        "73c989cf-ec57-498a-94b0-9b0147f8eb3e": {
                            "name": "Indkøb (FSIII)",
                            "id": "73c989cf-ec57-498a-94b0-9b0147f8eb3e",
                            "visiteret": 15,
                            "disponeret": 0
                        },
                        "5a68971f-c370-451e-b2fc-894088e7a5af": {
                            "name": "Klippekort  (FSIII) (ÆL)",
                            "id": "5a68971f-c370-451e-b2fc-894088e7a5af",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "1f2177ca-3b13-4565-b4c9-05e577d01fa9": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "1f2177ca-3b13-4565-b4c9-05e577d01fa9",
                            "visiteret": 1530,
                            "disponeret": 0
                        },
                        "1fe54be7-ca03-4165-af0d-4e192f6689c7": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "1fe54be7-ca03-4165-af0d-4e192f6689c7",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "92e8cf2b-7602-45e1-8820-29cb5c9f36fc": {
                            "name": "Madservice (FSIII) (ÆL)",
                            "id": "92e8cf2b-7602-45e1-8820-29cb5c9f36fc",
                            "visiteret": 0,
                            "disponeret": 0
                        }
                    }
                },
                "46-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 1755,
                        "disponeret": 0
                    },
                    "procedures": {
                        "cb254f93-ccf6-46a8-b82e-f6ff59330f96": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "cb254f93-ccf6-46a8-b82e-f6ff59330f96",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "0f1d594a-d438-43bc-8394-c24aa09f53ec": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "0f1d594a-d438-43bc-8394-c24aa09f53ec",
                            "visiteret": 210,
                            "disponeret": 0
                        },
                        "73c989cf-ec57-498a-94b0-9b0147f8eb3e": {
                            "name": "Indkøb (FSIII)",
                            "id": "73c989cf-ec57-498a-94b0-9b0147f8eb3e",
                            "visiteret": 15,
                            "disponeret": 0
                        },
                        "5a68971f-c370-451e-b2fc-894088e7a5af": {
                            "name": "Klippekort  (FSIII) (ÆL)",
                            "id": "5a68971f-c370-451e-b2fc-894088e7a5af",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "1f2177ca-3b13-4565-b4c9-05e577d01fa9": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "1f2177ca-3b13-4565-b4c9-05e577d01fa9",
                            "visiteret": 1530,
                            "disponeret": 0
                        },
                        "1fe54be7-ca03-4165-af0d-4e192f6689c7": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "1fe54be7-ca03-4165-af0d-4e192f6689c7",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "92e8cf2b-7602-45e1-8820-29cb5c9f36fc": {
                            "name": "Madservice (FSIII) (ÆL)",
                            "id": "92e8cf2b-7602-45e1-8820-29cb5c9f36fc",
                            "visiteret": 0,
                            "disponeret": 0
                        }
                    }
                }
            }
        }
    },
    {
        "id": "4cda6096-47c2-4d3f-b9b5-774c3d52f7bb",
        "cpr": "251248-9996",
        "name": "Nancy Ann TestBerggren",
        "teamId": 1,
        "pathwayData": {
            "Forløb 3": {
                "26-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 194,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "54f4dd6f-2390-4871-927d-05b675d7302e": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "54f4dd6f-2390-4871-927d-05b675d7302e",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "f1a51c1c-61eb-43ce-b657-5c1e6d2ce192": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "f1a51c1c-61eb-43ce-b657-5c1e6d2ce192",
                            "visiteret": 2,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "a2d93ee5-f6e8-476d-aa96-d2de365d9a9d": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "a2d93ee5-f6e8-476d-aa96-d2de365d9a9d",
                            "visiteret": 2,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "27-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "28-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "29-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "30-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "31-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "32-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "33-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "34-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "35-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "36-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "37-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "38-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "39-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "40-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "41-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "42-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "43-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "44-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "45-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                },
                "46-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 190,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "d5b81b71-8fdf-4b98-9ccb-9c09c7f3733a",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bc1eb6fd-162c-498c-9e4f-9093b0599106": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bc1eb6fd-162c-498c-9e4f-9093b0599106",
                            "visiteret": 175,
                            "disponeret": 0
                        },
                        "33fa6875-6108-4ef3-9804-fc0fd1e19aba": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "33fa6875-6108-4ef3-9804-fc0fd1e19aba",
                            "visiteret": 15,
                            "disponeret": 0
                        }
                    }
                }
            }
        }
    }
]
};