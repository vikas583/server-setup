import Joi, { number } from "joi";

export const projectCreationSchema = Joi.object({
    projectName: Joi.string().min(1).max(30).pattern(/^[A-Za-z0-9\s\-_']+$/).required().messages({
        'string.pattern.base': 'Project name can only contain letters, numbers, spaces, hyphens, underscores, and apostrophes',
        'string.min': 'Project name must be at least 1 character long',
        'string.max': 'Project name must be at most 30 characters long',
        'string.empty': 'Project name cannot be empty',
        'any.required': 'Project name is required',
    }),
    description: Joi.string().max(250).allow('').optional().messages({
        'string.max': 'Description must be at most 250 characters long',
    }),
    clientName: Joi.string().min(1).max(30).pattern(/^[A-Za-z0-9\s\-_]+$/).required().messages({
        'string.base': 'Client name is required',
        'string.min': 'Client name must be at least 1 character long',
        'string.max': 'Client name must be at most 30 characters long',
        'string.pattern.base': 'Client name can only contain letters, numbers, spaces, hyphens, and underscores',
        'string.empty': 'Client name cannot be empty',
    }),
    collaborators: Joi.array().items(
        Joi.object({
            id: Joi.number().integer().required(),
            name: Joi.string().required(),
            email: Joi.string().email().required()
        })
    ).optional(),
    regulations: Joi.array().items(
        Joi.object({
            id: Joi.number().integer().required(),
            name: Joi.string().required(),
            scope: Joi.string().required(),
            regulationDetails: Joi.array().items(Joi.number())
        })
    ).required()
})

export const projectUpdationSchema = Joi.object({
    projectId: Joi.number(),
    projectName: Joi.string().min(1).max(30).pattern(/^[A-Za-z0-9\s\-_']+$/).optional().messages({
        'string.pattern.base': 'Project name can only contain letters, numbers, spaces, hyphens, underscores, and apostrophes',
        'string.min': 'Project name must be at least 1 character long',
        'string.max': 'Project name must be at most 30 characters long',
        'string.empty': 'Project name cannot be empty',
    }),
    description: Joi.string().max(250).allow('').optional(),
    clientName: Joi.string().min(1).max(30).pattern(/^[A-Za-z0-9\s\-_]+$/).optional().messages({
        'string.pattern.base': 'Client name can only contain letters, numbers, spaces, hyphens, and underscores',
        'string.min': 'Client name must be at least 1 character long',
        'string.max': 'Client name must be at most 30 characters long',
        'string.empty': 'Client name cannot be empty',
    }),
    collaboratorsAdded: Joi.array().items(Joi.number()).optional(),
    collaboratorsDeleted: Joi.array().items(Joi.number()).optional()
})

export const projectScopeEditSchema = Joi.object({
    projectId: Joi.number(),
    projectRegulationId: Joi.number(),
    regulationDetailsAdded: Joi.array().items(Joi.number()).optional(),
    regulationDetailsDeleted: Joi.array().items(Joi.number()).optional(),
})
