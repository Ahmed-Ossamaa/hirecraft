export enum ExperienceLevel {
  ENTRY_LEVEL = 'ENTRY_LEVEL',
  SKILLED = 'SKILLED',
  SENIOR = 'SENIOR',
  EXPERT = 'EXPERT',
}

export const EXPERIENCE_LEVEL_RANK: Record<ExperienceLevel, number> = {
  [ExperienceLevel.ENTRY_LEVEL]: 1,
  [ExperienceLevel.SKILLED]: 2,
  [ExperienceLevel.SENIOR]: 3,
  [ExperienceLevel.EXPERT]: 4,
};
