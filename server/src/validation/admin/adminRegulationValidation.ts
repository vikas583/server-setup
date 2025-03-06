import Joi from 'joi';


export const adminRegualtionCreate = Joi.object({
    name: Joi.string().required(),
    version: Joi.string().required(),
    regVersion: Joi.string().required()
})

// Define the validation schema for Detail
const detailSchema = Joi.object({
    step: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    chapter: Joi.string().required(),
    topic: Joi.string().required(),
    regulationId: Joi.number().required()
});

// Define the validation schema for RegulationDetailCreateRequest
export const regulationDetailCreate = Joi.object({
    details: Joi.array().items(detailSchema).required(),
});
