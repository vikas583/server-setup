import Joi from "joi";

export const userCreationSchema = Joi.object({
    firstName: Joi.string()
        .pattern(/^[A-Za-z]+$/)
        .required()
        .min(1)
        .max(30)
        .messages({
            'string.pattern.base': 'First name must contain only alphabetic characters',
            'string.empty': 'First name cannot be empty',
            'any.required': 'First name is required'
        }),
    lastName: Joi.string()
        .pattern(/^[A-Za-z]+$/)
        .required()
        .min(1)
        .max(30)
        .messages({
            'string.pattern.base': 'Last name must contain only alphabetic characters',
            'string.empty': 'Last name cannot be empty',
            'any.required': 'Last name is required'
        }),
    email: Joi.string().required(),
    roleId: Joi.number().required()
})

export const initialUserUpdateSchema = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string()
        .pattern(/^[A-Za-z]+$/)
        .required()
        .min(1)
        .max(30)
        .messages({
            'string.pattern.base': 'First name must contain only alphabetic characters',
            'string.empty': 'First name cannot be empty',
            'any.required': 'First name is required'
        }),
    lastName: Joi.string()
        .pattern(/^[A-Za-z]+$/)
        .required()
        .min(1)
        .max(30)
        .messages({
            'string.pattern.base': 'Last name must contain only alphabetic characters',
            'string.empty': 'Last name cannot be empty',
            'any.required': 'Last name is required'
        }),
    position: Joi.optional()
    // .pattern(/^[A-Za-z\s]+$/)
    // .required()
    // .messages({
    //     'string.pattern.base': 'Position must contain only alphabetic characters and spaces',
    //     'string.empty': 'Position cannot be empty',
    //     'any.required': 'Position is required'
    // })
})

export const userUpdateSchema = Joi.object({
    firstName: Joi.string()
        .pattern(/^[A-Za-z]+$/)
        .required()
        .messages({
            'string.pattern.base': 'First name must contain only alphabetic characters',
            'string.empty': 'First name cannot be empty',
            'any.required': 'First name is required'
        }),
    lastName: Joi.string()
        .pattern(/^[A-Za-z]+$/)
        .required()
        .messages({
            'string.pattern.base': 'Last name must contain only alphabetic characters',
            'string.empty': 'Last name cannot be empty',
            'any.required': 'Last name is required'
        }),
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'string.empty': 'Email cannot be empty',
        'any.required': 'Email is required'
    }),
    roleId: Joi.number().required(),
    userId: Joi.number().required()
})

export const initialSetupMFAValidationSchema = Joi.object({
    token: Joi.string().pattern(/^[0-9]+$/).required().length(6).messages({
        'string.pattern.base': 'Token must contain only numeric characters',
        'string.empty': 'Token cannot be empty',
        'any.required': 'Token is required',
        'string.length': 'Token must be 6 digits long'
    })
})

export const initialSetupPasswordValidationSchema = Joi.object({
    password: Joi.string()
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#])[A-Za-z\d@$!%*?&\-_#]{8,30}$/)
        .min(8)
        .max(30)
        .messages({
            'string.empty': 'Password cannot be empty',
            'any.required': 'Password is required',
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password must be at most 30 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        }),
    confirmPassword: Joi.string()
        .required()
        .valid(Joi.ref('password'))
        .messages({
            'any.only': 'Passwords do not match'
        })
})

export const sendPasswordResetLinkSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'string.empty': 'Email cannot be empty',
        'any.required': 'Email is required'
    })
})
