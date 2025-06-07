import Joi from "joi"

export const validationRegister = (data) => {
    const  schema = Joi.object({
        username: Joi.string().min(3).max(50).required(),
        email:Joi.string().email().required(),
        password:Joi.string().min(6).required()
    })

    return schema.validate(data)
}

export const validationlogin = (data) => {
    const  schema = Joi.object({
        email:Joi.string().email().required(),
        password:Joi.string().min(6).required()
    })

    return schema.validate(data)
}
