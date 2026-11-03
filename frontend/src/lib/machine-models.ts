// AWA Modula specs, shared by the landing page and project pages.
export const MACHINE_MODELS = [
  {
    id: "250",
    name: "AWA Modula 250",
    water: 2500, // L / day
    hot: 2000, // L / hour
    air: 8000, // m³ / hour
    scale: 0.86,
    audience: "Boutique hotels, residential complexes, light industry.",
  },
  {
    id: "500",
    name: "AWA Modula 500",
    water: 5000,
    hot: 4000,
    air: 16000,
    scale: 1,
    audience: "Hospitals, large resorts, data centers, manufacturing.",
  },
  {
    id: "1000",
    name: "AWA Modula 1000",
    water: 10000,
    hot: 8000,
    air: 32000,
    scale: 1.13,
    audience: "Industrial parks, bottling lines, remote communities.",
  },
] as const;

export type MachineModel = (typeof MACHINE_MODELS)[number];

/** Finds the spec for a project's free-text model name, e.g. "AWA Modula 500". */
export const findMachineModel = (name?: string): MachineModel | undefined =>
  MACHINE_MODELS.find((m) => m.name.toLowerCase() === name?.trim().toLowerCase());
