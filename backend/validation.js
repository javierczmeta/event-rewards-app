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

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
}).required()

// Authentication Verification
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res
            .status(401)
            .json({ error: "You must be logged in to perform this action." });
    }
    next();
};

module.exports = { newUserSchema, loginSchema, isAuthenticated };
