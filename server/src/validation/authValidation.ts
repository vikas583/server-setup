import Joi from 'joi';

export const signupSchema = Joi.object({
    name: Joi.string().min(3).max(30),
    password: Joi.string().min(8).required(),
    email: Joi.string().email().required(),
    companyName: Joi.string().required()
});


export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})
