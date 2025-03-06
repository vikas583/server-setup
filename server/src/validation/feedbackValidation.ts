import Joi from "joi";

export const feedbackCaptureRequestSchema = Joi.object({
    feedbackResp: Joi.array().items(
        Joi.object({
            feedbackId: Joi.number().integer().required(),
            questionId: Joi.number().integer().required(),
            response: Joi.string().required()
        })
    ).required()
})
