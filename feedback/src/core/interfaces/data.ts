interface ModelStruct {
    modelId: string;
    model: ModelData; // Replace 'any' with the actual type of your model
    writePassword?: string; // Optional field for write password
}

interface ModelData {
    highScore: number;
    highEpisode: number;
    livingStreak: number;
    deathCount: number;
    learningRate: number;
    discountFactor: number;
    q: Record<string, number[]>; // Assuming 'q' is an object with string keys and array of numbers as values
}

export type { ModelStruct, ModelData };