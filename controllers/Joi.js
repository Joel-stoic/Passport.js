import Joi from "joi";

export const userShema=Joi.object({
    name:Joi.string().min(3).max(10).required(),
    email:Joi.string.email().required(),
    password:Joi.string().min(6).required()
})



