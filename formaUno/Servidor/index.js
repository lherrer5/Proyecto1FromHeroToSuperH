//Importo express
const express= require('express');

//Importo routers
//const routerHombre=require('../Routers/hombre')
const routerMujer=require('../formaUno/Routers/mujer')

//Creo mi app con función express()
const app= express();

//Simulo una base de datos con el archivo productos.txt y lo importo con sintaxis de desestructuracion
const {infoProductos}= require('../formaUno/Datos/productos');

//Routers: Me permiten optimizar codigo reusando parte del path
//Indico uso especifico con el camino asociado a mi constante 
//app.use('/api/v1/products/hombre', routerHombre);
app.use('/api/v1/products/mujer', routerMujer);

app.get('/', (req,res)=>{
    res.send('Bienvenido a mi sitio')
});

app.get('/api/v1/products', (req,res)=>{
    res.send(infoProductos)
    //pa enviarlo en formato json: res.send(JSON.stringify(infoCursos))
});

//para que mi servidor empiece a escuchar solicitudes. Le especifico el puerto en 1er argumento y 2do funcion flecha q indica q hacer al escuchar 
//En la realidad cuando publico mi app en servicio externo, se me asigna el puerto dinamicamente por lo que pa tomar el puerto de las variables de 
// ambiente, uso process.env.port
const PORT= process.env.port||3020;

//la función se corre cuando el servidor empieza a escuchar
app.listen(PORT, ()=>{
    console.log(`El servidor esta escuchando en el puerto ${PORT}...`);
})