const Joi = require('joi');
// const mongoose = require('mongoose')

const addContactSchema = Joi.object({
    name: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    email: Joi.string()
        .email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "net"] },
          }),

    phone: Joi.string()
        .pattern(/^\(\d{3}\) \d{3}-\d{4}$/)
        .required(),

    favorite: Joi.bool(),

})

const favoriteJoiSchema = Joi.object({
    favorite: Joi.boolean().required(),
});
   


module.exports = {
    addContactSchema,
    favoriteJoiSchema,
}