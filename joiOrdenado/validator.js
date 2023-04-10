const Joi = require('joi');

//el validador toma el esquema y devuelve la func payload con la info q queremos validar ya revisada
const validator= (schema)=>(payload)=>
    schema.validate(payload, {abortEarly: false});

const nuevoProductoSchema = Joi.object({
    id: Joi.number().optional(),
    nombre: Joi.string().min(2).max(12).required(),
    precio: Joi.number().positive().required(),
    unidades: Joi.number().integer().positive().required(),
    categoria: Joi.string().required(),
    descripción: Joi.string().required()
});

exports.validateSignup= validator(nuevoProductoSchema)