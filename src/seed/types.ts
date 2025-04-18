export type DueFlavourString = 'today' | 'this_week' | 'eventually' | 'fate'
export type FuelTag =
  | 'guilt'
  | 'hope'
  | 'ambition'
  | 'social_pressure'
  | 'curiosity'
  | 'fear_of_missing_out'
  | 'escapism'
export type CategoryTag =
  | 'social_pressure'
  | 'existential'
  | 'passive_aggressive'
  | 'escapism'
  | 'absurd'
  | 'tuesday_thing'

export interface SeedPreset {
  title: string
  details?: string
  fuel: FuelTag[]
  category: CategoryTag
  due_flavour: DueFlavourString
}

export type CriteriaType =
  | { type: 'void_time'; minutes: number }
  | { type: 'void_sessions'; count: number }
  | { type: 'thought_created'; count: number }
  | { type: 'thought_completed'; count: number }
  | { type: 'streak_void_days'; days: number }
  | { type: 'fuel_used'; fuel: FuelTag; count: number }
  | { type: 'category_used'; category: CategoryTag; count: number }

export interface SeedAchievement {
  code: string
  title: string
  description?: string
  icon?: string
  criteria: CriteriaType
}
