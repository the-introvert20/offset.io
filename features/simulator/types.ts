export interface SimulatorInputs {
  carKmMonthly: number;
  vehicleSubtype: string;
  electricityKwhMonthly: number;
  renewablePct: number;
  dietPattern: string;
  flightKmYearly: number;
  wasteKgMonthly: number;
}

export interface SimulatorResult {
  baselineAnnualKg: number;
  simulatedAnnualKg: number;
  reductionKg: number;
  reductionPct: number;
}
