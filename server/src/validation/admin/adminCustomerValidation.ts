import Joi from 'joi';


export const adminAccountCreation = Joi.object({
    accountName: Joi.string()
        .min(3)
        .max(100)
        .pattern(/^[a-zA-Z0-9-]+$/)
        .required()
        .messages({
            'string.pattern.base': 'Account name must contain only letters, numbers, and hyphens'
        }),
    addressLine1: Joi.optional(),
    city: Joi.optional(),
    state: Joi.optional(),
    country: Joi.optional(),
    postalCode: Joi.optional()
})
