import { useState, useEffect, useRef, useCallback } from 'react';
import { SimulatorInputs, SimulatorResult } from './types';
import { runSimulationApi, fetchUserBaselineApi } from './api';

const DEFAULT_INPUTS: SimulatorInputs = {
  carKmMonthly: 390,
  vehicleSubtype: 'petrol',
  electricityKwhMonthly: 320,
  renewablePct: 0,
  dietPattern: 'mixed',
  flightKmYearly: 1500,
  wasteKgMonthly: 45,
};

export function useSimulator() {
  const [inputs, setInputs] = useState<SimulatorInputs>(DEFAULT_INPUTS);
  const [result, setResult] = useState<SimulatorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [baselineInputs, setBaselineInputs] = useState<SimulatorInputs>(DEFAULT_INPUTS);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load actual user baseline on mount
  useEffect(() => {
    fetchUserBaselineApi().then((b) => {
      setBaselineInputs(b);
      setInputs(b);
    });
  }, []);

  const runSimulation = useCallback((currentInputs: SimulatorInputs) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      try {
        const res = await runSimulationApi(currentInputs, controller.signal);
        setResult(res);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Simulation error:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);
  }, []);

  useEffect(() => {
    runSimulation(inputs);
  }, [inputs, runSimulation]);

  const resetToBaseline = useCallback(() => {
    setInputs(baselineInputs);
  }, [baselineInputs]);

  return {
    inputs,
    setInputs,
    result,
    loading,
    resetToBaseline,
  };
}
