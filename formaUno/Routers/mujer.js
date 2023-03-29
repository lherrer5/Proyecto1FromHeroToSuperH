const express= require('express');
//Importo cursos
const{mujer}=require('../Datos/productos').infoProductos
const routerMujer=express.Router();

//Las funciones middleware (q se ejecutan despues de recibir la solicitud y antes d enviar la respuesta),
//m sirve para procesar .body en formato json. OJo va antes de las rutas
//tienen acceso al obj de la solic, al objt de la respuesta y a next()(func q se llama pa ejecutar el prox middleware)
routerMujer.use(express.json());


routerMujer.get('/', (req,res)=>{
    res.send(JSON.stringify(mujer))
});

routerMujer.get('/:nombre', (req,res)=>{
    const nombre= req.params.nombre.toLocaleLowerCase();
    const resultados= mujer.filter(pdto=>pdto.nombre===nombre);
    if(resultados.length===0){
        return res.status(404).send(`No se encontraron cursos de ${nombre}`);
    }
    res.send(JSON.stringify(resultados));
});

routerMujer.post('/', (req,res)=>{
    //deberia validar q si sea formato json
    //Extraigo el cuerpo de la req con req.body
    let pdtoNuevo=req.body;
    //lo agrego al arreglo q estoy importando const{matematicas}, en la realidad seria la base de datos
    mujer.push(pdtoNuevo);
    //envio el nuevo arreglo al cliente
    res.send(JSON.stringify(mujer));
});

//Exporto router
module.exports= routerMujer;