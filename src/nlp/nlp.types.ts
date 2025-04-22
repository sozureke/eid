export interface ClassificationInput {
  title: string
  details?: string
  dueFlavour?: string
  categoryTag?: string
  fuelTags?: string[]
}

export interface ClassificationResult {
  label: string
  score: number
}