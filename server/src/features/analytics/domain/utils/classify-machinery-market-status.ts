export type MachineryMarketStatus = 'SHORTAGE' | 'BALANCED' | 'SURPLUS';

/**
 * Classifies the market status of machinery based on supply and demand metrics.
 * @param supplyToDemandRatio - The ratio of supply to demand for the machinery.
 * @param distinctWorkersSupply - The number of distinct workers supplying the machinery.
 * @returns The market status of the machinery: 'SHORTAGE', 'BALANCED', or 'SURPLUS'.
 */
export function classifyMachineryMarketStatus(
  supplyToDemandRatio: number | null,
  distinctWorkersSupply: number,
): MachineryMarketStatus {
  if (supplyToDemandRatio === null) {
    return distinctWorkersSupply > 0 ? 'SURPLUS' : 'BALANCED';
  }

  if (supplyToDemandRatio < 1) {
    return 'SHORTAGE';
  }

  if (supplyToDemandRatio > 3) {
    return 'SURPLUS';
  }

  return 'BALANCED';
}
