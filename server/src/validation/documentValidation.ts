import Joi from "joi";

export const documentDeleteSchema = Joi.object({
    docId: Joi.number().required().messages({
        'number.base': 'Document ID must be a number',
        'number.empty': 'Document ID is required',
        'number.required': 'Document ID is required',
    }),
    projectId: Joi.number().required().messages({
        'number.base': 'Project ID must be a number',
        'number.empty': 'Project ID is required',
        'number.required': 'Project ID is required',
    }),
})