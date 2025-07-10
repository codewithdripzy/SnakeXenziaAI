import Joi from "joi";

const saveModelValidator = Joi.object({
    modelId: Joi.string().required(),
    model: Joi.object({
        highScore: Joi.number().required(),
        highEpisode: Joi.number().required(),
        livingStreak: Joi.number().required(),
        deathCount: Joi.number().required(),
        learningRate: Joi.number().required(),
        discountFactor: Joi.number().required(),
        q: Joi.object().pattern(Joi.string(), Joi.array().items(Joi.number())),
    }).required(),
});

export { saveModelValidator };
    