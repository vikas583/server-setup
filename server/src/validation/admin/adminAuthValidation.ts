import Joi from 'joi';


export const adminSignupSchema = Joi.object({
    name: Joi.string().min(3).max(30),
    email: Joi.string().email().required(),
    adminRoleId: Joi.number().strict().required(),
    password: Joi.string().min(8).required(),
})

export const adminLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})
