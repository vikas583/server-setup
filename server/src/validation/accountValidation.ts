import Joi from "joi";

export const initialBillingInfoUpdateSchema = Joi.object({
    companyName: Joi.string().min(1).max(30).required().pattern(/^[A-Za-z0-9\s\-&'.]+$/).messages({
        'string.min': 'Company name must be at least 1 character long',
        'string.max': 'Company name must be at most 30 characters long',
        'string.empty': 'Company name cannot be empty',
        'any.required': 'Company name is required',
        'string.pattern.base': 'Company name can only contain letters, numbers, spaces, hyphens, ampersands, apostrophes, and periods   ',
    }), //only letters, numbers, spaces, hyphens, ampersands, apostrophes, and periods  
    addressLine1: Joi.string().min(1).max(50).pattern(/^[A-Za-z0-9\s]+$/).required().messages({
        'string.min': 'Address line 1 must be at least 1 character long',
        'string.max': 'Address line 1 must be at most 50 characters long',
        'string.empty': 'Address line 1 cannot be empty',
        'any.required': 'Address line 1 is required',
        'string.pattern.base': 'Address line 1 can only contain letters, numbers, and spaces',
    }), //only letters, numbers, and spaces
    addressLine2: Joi.string().allow('').max(50).pattern(/^[A-Za-z0-9\s]+$/).optional().messages({
        'string.max': 'Address line 2 must be at most 50 characters long',
        'string.pattern.base': 'Address line 2 can only contain letters, numbers, and spaces',
    }), //only letters, numbers, and spaces
    co: Joi.string().allow('').max(30).pattern(/^[A-Za-z\s]+$/).optional().messages({
        'string.max': 'Care/of must be at most 30 characters long',
        'string.pattern.base': 'Care/of can only contain letters and spaces',
    }), //only letters and spaces
    country: Joi.string().min(1).max(30).pattern(/^[A-Za-z\s]+$/).required().messages({
        'string.min': 'Country must be at least 1 character long',
        'string.max': 'Country must be at most 30 characters long',
        'string.empty': 'Country cannot be empty',
        'any.required': 'Country is required',
        'string.pattern.base': 'Country can only contain letters and spaces',
    }), //only letters and spaces
    city: Joi.string().min(1).max(30).pattern(/^[A-Za-z\s]+$/).required().messages({
        'string.min': 'City must be at least 1 character long',
        'string.max': 'City must be at most 30 characters long',
        'string.empty': 'City cannot be empty',
        'any.required': 'City is required',
        'string.pattern.base': 'City can only contain letters and spaces',
    }), //only letters and spaces
    state: Joi.string().min(2).max(30).pattern(/^[A-Za-z\s]+$/).required().messages({
        'string.min': 'State must be at least 2 characters long',
        'string.max': 'State must be at most 30 characters long',
        'string.empty': 'State cannot be empty',
        'any.required': 'State is required',
        'string.pattern.base': 'State can only contain letters and spaces',
    }), //only letters and spaces
    postalCode: Joi.string().min(5).max(6).pattern(/^[A-Za-z0-9\s]+$/).required().messages({
        'string.min': 'Postal code must be at least 5 characters long',
        'string.max': 'Postal code must be at most 6 characters long',
        'string.empty': 'Postal code cannot be empty',
        'any.required': 'Postal code is required',
        'string.pattern.base': 'Postal code can only contain letters, numbers, and spaces',
    }), //only letters, numbers, and spaces
})
