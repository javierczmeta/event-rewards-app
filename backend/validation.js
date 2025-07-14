const Joi = require("joi");

const newUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    display_name: Joi.string().required(),
    password: Joi.string().min(8).required(),
    img_url: Joi.string()
        .uri({
            scheme: ["http", "https"],
        })
        .allow(""),
    dob: Joi.date().less("now").required(),
}).required();

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
}).required();

const newEventSchema = Joi.object({
    name: Joi.string().required(),
    latitude: Joi.number().required().min(-90).max(90),
    longitude: Joi.number().required().min(-180).max(180),
    image: Joi.string()
        .uri({
            scheme: ["http", "https"],
        })
        .pattern(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)
        .allow(""),
    start_time: Joi.date().required().min("now"),
    end_time: Joi.date().required().min(Joi.ref("start_time")),
    price: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string(),
}).required();

// Will allow max 3 badge_ids
const displayBadgeSchema = Joi.object({
    badges: Joi.array().items(Joi.number()).max(3).required()
}).required()

const rsvpValidation = Joi.object({
    status: Joi.string()
        .pattern(/^(Going|Maybe|Not Going)?$/)
        .required(),
}).required();

// Authentication Verification
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res
            .status(401)
            .json({ error: "You must be logged in to perform this action." });
    }
    next();
};

// ID Verification
const verifyParamstoInt = (req, res, next) => {
    const queryParams = req.params;
    for (const paramName in queryParams) {
        const paramValue = queryParams[paramName];
        if (!Number.isInteger(Number(paramValue))) {
            return res
                .status(400)
                .json({ message: `Invalid query parameter: ${paramName} has to be an integer` });
        } else {
            const parsed = parseInt(paramValue);
            queryParams[paramName] = parsed;
        }
    }
    next();
};

module.exports = {
    newUserSchema,
    loginSchema,
    newEventSchema,
    rsvpValidation,
    isAuthenticated,
    verifyParamstoInt,
    displayBadgeSchema
};
