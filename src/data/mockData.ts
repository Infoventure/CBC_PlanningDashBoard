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
  cpr: `${number}${number}${number}${number}${number}${number}${number}${number}${number}${number}`;
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
  citizens: [
    {
        "id": "f222bac2-e823-43b4-9c86-f215ab30fb66",
        "cpr": "1616161616",
        "name": "Olga Testsen",
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
                },
                "47-2025": {
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
                "48-2025": {
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
                },
                "47-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 255,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d154bbe4-21ae-4bb7-8f2e-21c91e3a3ba4": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "d154bbe4-21ae-4bb7-8f2e-21c91e3a3ba4",
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
                "48-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 255,
                        "disponeret": 0
                    },
                    "procedures": {
                        "d154bbe4-21ae-4bb7-8f2e-21c91e3a3ba4": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "d154bbe4-21ae-4bb7-8f2e-21c91e3a3ba4",
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
        "id": "d16a323d-1abb-4a8f-a71d-1cfb69ac4d84",
        "cpr": "1515151515",
        "name": "Gert Test-Jul",
        "teamId": 1,
        "pathwayData": {
            "Forløb 1": {
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
                    "status": "red",
                    "total": {
                        "visiteret": 70,
                        "disponeret": 70
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
                        "visiteret": 140,
                        "disponeret": 70
                    },
                    "procedures": {
                        "5ce4caab-d7ed-4be3-8ac7-16690b6b946f": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "5ce4caab-d7ed-4be3-8ac7-16690b6b946f",
                            "visiteret": 70,
                            "disponeret": 70
                        },
                        "efe9f7b8-20ff-4fd8-8bf0-673e431e060c": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "efe9f7b8-20ff-4fd8-8bf0-673e431e060c",
                            "visiteret": 70,
                            "disponeret": 0
                        }
                    }
                },
                "47-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 180,
                        "disponeret": 100
                    },
                    "procedures": {
                        "5ce4caab-d7ed-4be3-8ac7-16690b6b946f": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "5ce4caab-d7ed-4be3-8ac7-16690b6b946f",
                            "visiteret": 70,
                            "disponeret": 10
                        },
                        "8fe19007-cf7a-416a-b304-1129e7dd1a51": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "8fe19007-cf7a-416a-b304-1129e7dd1a51",
                            "visiteret": 110,
                            "disponeret": 90
                        }
                    }
                },
                "48-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 110,
                        "disponeret": 105
                    },
                    "procedures": {
                        "8fe19007-cf7a-416a-b304-1129e7dd1a51": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "8fe19007-cf7a-416a-b304-1129e7dd1a51",
                            "visiteret": 110,
                            "disponeret": 105
                        }
                    }
                }
            }
        }
    },
    {
        "id": "3525ab02-e036-4d3c-a385-e211252c50ff",
        "cpr": "1919191919",
        "name": "Hannetest Hansen",
        "teamId": 1,
        "pathwayData": {
            "Forløb 3": {
                "47-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 330,
                        "disponeret": 92
                    },
                    "procedures": {
                        "bb66838c-6ee0-40ae-a4dc-e027ec6611af": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bb66838c-6ee0-40ae-a4dc-e027ec6611af",
                            "visiteret": 220,
                            "disponeret": 62
                        },
                        "a1b1121d-ec70-46fc-a400-1cc57a16231a": {
                            "name": "Praktisk hjælp i hjemmet (FSIII) (ÆL)",
                            "id": "a1b1121d-ec70-46fc-a400-1cc57a16231a",
                            "visiteret": 110,
                            "disponeret": 30
                        },
                        "40f452b1-d089-4e71-89d5-31bca8db6a25": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "40f452b1-d089-4e71-89d5-31bca8db6a25",
                            "visiteret": 0,
                            "disponeret": 0
                        }
                    }
                },
                "48-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 330,
                        "disponeret": 0
                    },
                    "procedures": {
                        "40f452b1-d089-4e71-89d5-31bca8db6a25": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "40f452b1-d089-4e71-89d5-31bca8db6a25",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "bb66838c-6ee0-40ae-a4dc-e027ec6611af": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "bb66838c-6ee0-40ae-a4dc-e027ec6611af",
                            "visiteret": 220,
                            "disponeret": 0
                        },
                        "a1b1121d-ec70-46fc-a400-1cc57a16231a": {
                            "name": "Praktisk hjælp i hjemmet (FSIII) (ÆL)",
                            "id": "a1b1121d-ec70-46fc-a400-1cc57a16231a",
                            "visiteret": 110,
                            "disponeret": 0
                        }
                    }
                }
            }
        }
    },
    {
        "id": "0574ee87-7f03-4bc1-bcc0-24caddc6b2dd",
        "cpr": "2412780100",
        "name": "Keld Testingsen",
        "teamId": 1,
        "pathwayData": {
            "Forløb 2": {
                "47-2025": {
                    "status": "yellow",
                    "total": {
                        "visiteret": 235,
                        "disponeret": 75
                    },
                    "procedures": {
                        "cbe49129-3e37-4ef1-a3e3-ff2c223ff84b": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "cbe49129-3e37-4ef1-a3e3-ff2c223ff84b",
                            "visiteret": 210,
                            "disponeret": 75
                        },
                        "d07fb2de-87e6-45d0-826d-c438abb70560": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "d07fb2de-87e6-45d0-826d-c438abb70560",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "2414c056-1eb7-4b1e-9324-7e588402e262": {
                            "name": "Praktisk hjælp i hjemmet (FSIII) (ÆL)",
                            "id": "2414c056-1eb7-4b1e-9324-7e588402e262",
                            "visiteret": 25,
                            "disponeret": 0
                        }
                    }
                },
                "48-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 235,
                        "disponeret": 260
                    },
                    "procedures": {
                        "cbe49129-3e37-4ef1-a3e3-ff2c223ff84b": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "cbe49129-3e37-4ef1-a3e3-ff2c223ff84b",
                            "visiteret": 210,
                            "disponeret": 210
                        },
                        "2414c056-1eb7-4b1e-9324-7e588402e262": {
                            "name": "Praktisk hjælp i hjemmet (FSIII) (ÆL)",
                            "id": "2414c056-1eb7-4b1e-9324-7e588402e262",
                            "visiteret": 25,
                            "disponeret": 50
                        },
                        "d07fb2de-87e6-45d0-826d-c438abb70560": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "d07fb2de-87e6-45d0-826d-c438abb70560",
                            "visiteret": 0,
                            "disponeret": 0
                        }
                    }
                }
            }
        }
    },
    {
        "id": "288b7b4d-9f8d-4032-a43e-43124754c634",
        "cpr": "9999999999",
        "name": "Jan-Test Erik",
        "teamId": 1,
        "pathwayData": {
            "Forløb 5": {
                "47-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 1160,
                        "disponeret": 280
                    },
                    "procedures": {
                        "114ea45f-63f6-46e2-bc43-c9d3f8cf083d": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "114ea45f-63f6-46e2-bc43-c9d3f8cf083d",
                            "visiteret": 1120,
                            "disponeret": 280
                        },
                        "ff8459c9-7874-40e4-a95f-8433c2f7542e": {
                            "name": "Praktisk hjælp i hjemmet (FSIII) (ÆL)",
                            "id": "ff8459c9-7874-40e4-a95f-8433c2f7542e",
                            "visiteret": 20,
                            "disponeret": 0
                        },
                        "dd6f0b0a-32d8-4363-ad2f-86f6ff72b1b8": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "dd6f0b0a-32d8-4363-ad2f-86f6ff72b1b8",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "03125f5d-1f30-4989-8d0a-ba0f68c594ef": {
                            "name": "Klippekort  (FSIII) (ÆL)",
                            "id": "03125f5d-1f30-4989-8d0a-ba0f68c594ef",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "a5385d3b-4718-425d-88b0-91d4aad836d3": {
                            "name": "Indkøb (FSIII)",
                            "id": "a5385d3b-4718-425d-88b0-91d4aad836d3",
                            "visiteret": 20,
                            "disponeret": 0
                        },
                        "33d86fb4-4052-4a6c-a311-649721202588": {
                            "name": "Madservice (FSIII) (ÆL)",
                            "id": "33d86fb4-4052-4a6c-a311-649721202588",
                            "visiteret": 0,
                            "disponeret": 0
                        }
                    }
                },
                "48-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 1160,
                        "disponeret": 1090
                    },
                    "procedures": {
                        "114ea45f-63f6-46e2-bc43-c9d3f8cf083d": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "114ea45f-63f6-46e2-bc43-c9d3f8cf083d",
                            "visiteret": 1120,
                            "disponeret": 1040
                        },
                        "a5385d3b-4718-425d-88b0-91d4aad836d3": {
                            "name": "Indkøb (FSIII)",
                            "id": "a5385d3b-4718-425d-88b0-91d4aad836d3",
                            "visiteret": 20,
                            "disponeret": 20
                        },
                        "03125f5d-1f30-4989-8d0a-ba0f68c594ef": {
                            "name": "Klippekort  (FSIII) (ÆL)",
                            "id": "03125f5d-1f30-4989-8d0a-ba0f68c594ef",
                            "visiteret": 0,
                            "disponeret": 30
                        },
                        "ff8459c9-7874-40e4-a95f-8433c2f7542e": {
                            "name": "Praktisk hjælp i hjemmet (FSIII) (ÆL)",
                            "id": "ff8459c9-7874-40e4-a95f-8433c2f7542e",
                            "visiteret": 20,
                            "disponeret": 0
                        },
                        "dd6f0b0a-32d8-4363-ad2f-86f6ff72b1b8": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "dd6f0b0a-32d8-4363-ad2f-86f6ff72b1b8",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "33d86fb4-4052-4a6c-a311-649721202588": {
                            "name": "Madservice (FSIII) (ÆL)",
                            "id": "33d86fb4-4052-4a6c-a311-649721202588",
                            "visiteret": 0,
                            "disponeret": 0
                        }
                    }
                }
            }
        }
    },
    {
        "id": "d4a8b5be-dbee-42a2-9733-3d4cb83349ee",
        "cpr": "1234567891",
        "name": "Vumer Testmøller",
        "teamId": 1,
        "pathwayData": {
            "Forløb 1": {
                "47-2025": {
                    "status": "green",
                    "total": {
                        "visiteret": 70,
                        "disponeret": 20
                    },
                    "procedures": {
                        "f9b6ce6f-f9cd-43b1-9b98-206a79f2d8c0": {
                            "name": "Praktisk hjælp i hjemmet (FSIII) (ÆL)",
                            "id": "f9b6ce6f-f9cd-43b1-9b98-206a79f2d8c0",
                            "visiteret": 70,
                            "disponeret": 20
                        }
                    }
                },
                "48-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 70,
                        "disponeret": 70
                    },
                    "procedures": {
                        "f9b6ce6f-f9cd-43b1-9b98-206a79f2d8c0": {
                            "name": "Praktisk hjælp i hjemmet (FSIII) (ÆL)",
                            "id": "f9b6ce6f-f9cd-43b1-9b98-206a79f2d8c0",
                            "visiteret": 70,
                            "disponeret": 70
                        }
                    }
                }
            }
        }
    },
    {
        "id": "382bc73e-db96-435d-8cc5-002b1fc3994f",
        "cpr": "9988555410",
        "name": "Lis Hansen",
        "teamId": 1,
        "pathwayData": {
            "Forløb 4": {
                "47-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 910,
                        "disponeret": 200
                    },
                    "procedures": {
                        "286c76b4-15f8-4eb1-be70-9c0e04454f47": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "286c76b4-15f8-4eb1-be70-9c0e04454f47",
                            "visiteret": 840,
                            "disponeret": 180
                        },
                        "1f704ce9-ffce-469e-ad5c-8e455ceb1eee": {
                            "name": "Praktisk hjælp i hjemmet (FSIII) (ÆL)",
                            "id": "1f704ce9-ffce-469e-ad5c-8e455ceb1eee",
                            "visiteret": 70,
                            "disponeret": 20
                        },
                        "0ac44213-532b-4eeb-8c0f-d95bab4ca447": {
                            "name": "Madservice (FSIII) (ÆL)",
                            "id": "0ac44213-532b-4eeb-8c0f-d95bab4ca447",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "29c65a86-511e-481d-ad6e-301f7d7ed955": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "29c65a86-511e-481d-ad6e-301f7d7ed955",
                            "visiteret": 0,
                            "disponeret": 0
                        }
                    }
                },
                "48-2025": {
                    "status": "green",
                    "total": {
                        "visiteret": 910,
                        "disponeret": 910
                    },
                    "procedures": {
                        "286c76b4-15f8-4eb1-be70-9c0e04454f47": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "286c76b4-15f8-4eb1-be70-9c0e04454f47",
                            "visiteret": 840,
                            "disponeret": 840
                        },
                        "1f704ce9-ffce-469e-ad5c-8e455ceb1eee": {
                            "name": "Praktisk hjælp i hjemmet (FSIII) (ÆL)",
                            "id": "1f704ce9-ffce-469e-ad5c-8e455ceb1eee",
                            "visiteret": 70,
                            "disponeret": 70
                        },
                        "0ac44213-532b-4eeb-8c0f-d95bab4ca447": {
                            "name": "Madservice (FSIII) (ÆL)",
                            "id": "0ac44213-532b-4eeb-8c0f-d95bab4ca447",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "29c65a86-511e-481d-ad6e-301f7d7ed955": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "29c65a86-511e-481d-ad6e-301f7d7ed955",
                            "visiteret": 0,
                            "disponeret": 0
                        }
                    }
                }
            }
        }
    },
    {
        "id": "c75202a8-5b1a-4c86-9c3d-81eab87fb4a5",
        "cpr": "9999999990",
        "name": "Jannie jannertest",
        "teamId": 1,
        "pathwayData": {
            "Forløb 3": {
                "47-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 85,
                        "disponeret": 30
                    },
                    "procedures": {
                        "b434b602-ec86-4fa3-85d0-c87a0f45cb0e": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "b434b602-ec86-4fa3-85d0-c87a0f45cb0e",
                            "visiteret": 40,
                            "disponeret": 30
                        },
                        "99b36728-8dc9-4239-8ac3-f20b46c65023": {
                            "name": "Madservice (FSIII) (ÆL)",
                            "id": "99b36728-8dc9-4239-8ac3-f20b46c65023",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "25e03e36-9ed3-42c4-87d1-4d0bedeacb20": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "25e03e36-9ed3-42c4-87d1-4d0bedeacb20",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "6fcdf7a5-7180-49d7-9740-dd02c46d7b19": {
                            "name": "Praktisk hjælp i hjemmet (FSIII) (ÆL)",
                            "id": "6fcdf7a5-7180-49d7-9740-dd02c46d7b19",
                            "visiteret": 15,
                            "disponeret": 0
                        },
                        "3822e763-858e-421b-b80d-a362a1b622a1": {
                            "name": "Indkøb (FSIII)",
                            "id": "3822e763-858e-421b-b80d-a362a1b622a1",
                            "visiteret": 30,
                            "disponeret": 0
                        }
                    }
                },
                "48-2025": {
                    "status": "red",
                    "total": {
                        "visiteret": 85,
                        "disponeret": 105
                    },
                    "procedures": {
                        "b434b602-ec86-4fa3-85d0-c87a0f45cb0e": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "b434b602-ec86-4fa3-85d0-c87a0f45cb0e",
                            "visiteret": 40,
                            "disponeret": 105
                        },
                        "99b36728-8dc9-4239-8ac3-f20b46c65023": {
                            "name": "Madservice (FSIII) (ÆL)",
                            "id": "99b36728-8dc9-4239-8ac3-f20b46c65023",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "25e03e36-9ed3-42c4-87d1-4d0bedeacb20": {
                            "name": "Genoptræning (FSIII) (ÆL)",
                            "id": "25e03e36-9ed3-42c4-87d1-4d0bedeacb20",
                            "visiteret": 0,
                            "disponeret": 0
                        },
                        "6fcdf7a5-7180-49d7-9740-dd02c46d7b19": {
                            "name": "Praktisk hjælp i hjemmet (FSIII) (ÆL)",
                            "id": "6fcdf7a5-7180-49d7-9740-dd02c46d7b19",
                            "visiteret": 15,
                            "disponeret": 0
                        },
                        "3822e763-858e-421b-b80d-a362a1b622a1": {
                            "name": "Indkøb (FSIII)",
                            "id": "3822e763-858e-421b-b80d-a362a1b622a1",
                            "visiteret": 30,
                            "disponeret": 0
                        }
                    }
                }
            }
        }
    },
    {
        "id": "ef4da811-17a8-4b54-b187-949468a70412",
        "cpr": "9999999992",
        "name": "Dijan Larsen",
        "teamId": 1,
        "pathwayData": {
            "Forløb 1": {
                "48-2025": {
                    "status": "yellow",
                    "total": {
                        "visiteret": 25,
                        "disponeret": 50
                    },
                    "procedures": {
                        "7887bfb9-4af3-4a45-a42f-bf421d0e9d4c": {
                            "name": "Praktisk hjælp i hjemmet (FSIII) (ÆL)",
                            "id": "7887bfb9-4af3-4a45-a42f-bf421d0e9d4c",
                            "visiteret": 25,
                            "disponeret": 50
                        }
                    }
                },
                "47-2025": {
                    "status": "yellow",
                    "total": {
                        "visiteret": 25,
                        "disponeret": 0
                    },
                    "procedures": {
                        "7887bfb9-4af3-4a45-a42f-bf421d0e9d4c": {
                            "name": "Praktisk hjælp i hjemmet (FSIII) (ÆL)",
                            "id": "7887bfb9-4af3-4a45-a42f-bf421d0e9d4c",
                            "visiteret": 25,
                            "disponeret": 0
                        }
                    }
                }
            }
        }
    },
    {
        "id": "7d404089-b963-4d7d-aa3e-64aee693fc52",
        "cpr": "1717171717",
        "name": "Migrering Frederikstest",
        "teamId": 1,
        "pathwayData": {
            "Forløb 5": {
                "48-2025": {
                    "status": "yellow",
                    "total": {
                        "visiteret": 1755,
                        "disponeret": 1367
                    },
                    "procedures": {
                        "0f1d594a-d438-43bc-8394-c24aa09f53ec": {
                            "name": "Praktisk hjaelp i hjemmet (FSIII) (ÆL)",
                            "id": "0f1d594a-d438-43bc-8394-c24aa09f53ec",
                            "visiteret": 210,
                            "disponeret": 180
                        },
                        "1f2177ca-3b13-4565-b4c9-05e577d01fa9": {
                            "name": "Personlig hjælp og pleje (FSIII) (ÆL)",
                            "id": "1f2177ca-3b13-4565-b4c9-05e577d01fa9",
                            "visiteret": 1530,
                            "disponeret": 1170
                        },
                        "cb254f93-ccf6-46a8-b82e-f6ff59330f96": {
                            "name": "Dialog med borger om tilrettelæggelse af forløb (FSIII) (ÆL)",
                            "id": "cb254f93-ccf6-46a8-b82e-f6ff59330f96",
                            "visiteret": 0,
                            "disponeret": 2
                        },
                        "73c989cf-ec57-498a-94b0-9b0147f8eb3e": {
                            "name": "Indkøb (FSIII)",
                            "id": "73c989cf-ec57-498a-94b0-9b0147f8eb3e",
                            "visiteret": 15,
                            "disponeret": 15
                        },
                        "5a68971f-c370-451e-b2fc-894088e7a5af": {
                            "name": "Klippekort  (FSIII) (ÆL)",
                            "id": "5a68971f-c370-451e-b2fc-894088e7a5af",
                            "visiteret": 0,
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
                },
                "47-2025": {
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
]
};