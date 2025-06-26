const Joi = require("joi");

const newUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    display_name: Joi.string().required(),
    password: Joi.string().min(8).required(),
    img_url: Joi.string()
        .uri({
            scheme: ["http", "https"],
        })
        .pattern(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)
        .allow(""),
    dob: Joi.date().less("now").required(),
}).required();

module.exports = { newUserSchema };
