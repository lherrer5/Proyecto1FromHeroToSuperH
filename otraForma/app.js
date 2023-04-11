const express = require("express");
const fs = require("fs");
//Creo mi app con función express()
const app = express();
const cors = require('cors');
//Creo puerto
const PORT = 3031;


// Middleware (q se ejecutan despues de recibir la solicitud y antes d enviar la respuesta) para parsear el body de las solicitudes
//analiza los datos enviados en la solicitud HTTP con el tipo de contenido application/json
//La función express.json() analiza estos datos JSON y los convierte en un objeto JavaScript agregandolos a la request de la solicitud
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Ruta para obtener todos los productos
app.get("/productos", (req, res) => {
  //se utiliza la función readFile del modulo fs para leer el contenido del archivo productos.txt en formato de texto (utf8). 
  //Callback se ejecuta cuando se completa la operación de lectura
  fs.readFile("productos.txt", "utf8", (err, data) => {
    //si algo sale mal, envio mensaje de error al cliente
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener los productos");
      return;
    }

    //Si la lectura del archivo es exitosa, el contenido se almacena en el segundo parametro data. 
    const productos = data.trim().split("\n").map((producto) => JSON.parse(producto));
    //.trim() se utiliza para eliminar cualquier espacio en blanco adicional que pueda existir al inicio o al final 
    //de cada línea del archivo productos.txt antes de procesar su contenido

    //.split("\n") para dividir la cadena de texto data en subcadenas más pequeñas, utilizando como separador el carácter
    //de salto de línea (\n). Como el archivo productos.txt contiene una lista de productos, cada producto se escribe en una línea separada,
    //es decir, la cadena de texto data se divide en un array de subcadenas,donde cada elemento del array es una línea del archivo.

    //.map() recorre cada elemento del array de subcadenas y aplica la función JSON.parse() a cada elemento,
    //para convertirlo en un objeto JavaScript devolviendo este nuevo array guardado en const productos

    //res.json envía el array guardado en const productos como una respuesta JSON al cliente
    res.json(productos);
  });
});

//GET con ID
app.get("/productos/:id", (req, res) => {
  //params se utiliza para para obtener el valor del parámetro id de la URL y asignarlo a la variable id
  const id = req.params.id;
  //se utiliza la función readFile del modulo fs para leer el contenido del archivo productos.txt en formato de texto (utf8) y ejecuta callback cuando se complete la lectura
  fs.readFile('productos.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al obtener el producto');
      return;
    }
    //.map() recorre cada elemento del array de subcadenas devolviendo un nuevo array que contiene el objeto dividido en líneas 
    const productos = data.trim().split('\n').map((producto) => JSON.parse(producto))
      //filter() crea nuevo array con la linea q tiene id identico al pasado en la ruta
      //.toString() convierte el id del producto a una cadena de texto para poderse comparar con ===
      .filter((producto) => producto.id.toString() === id);
    //se verifica ese nuevo array y si la long es 0 se indica q no se encontro ese pdto
    if (productos.length === 0) {
      res.status(404).send("Producto no encontrado");
      return;
    }
    //sino, envio la respuesta JSON al cliente con el primer objeto del producto que se encontró en el nuevo array y coincide con id
    res.json(productos[0]);
  });
});


// Ruta para agregar un nuevo producto con id dado por cliente
// app.post("/productos", (req, res) => {
//   //req.body es un objeto que contiene los datos enviados por el cliente en la solicitud POST
//   const nuevoProducto = req.body;
//   //la función appendFile() del módulo fs de Node.js agrega el contenido de nuevoProducto al final del archivo productos.txt".
//   //Convierto el objeto nuevoProducto a una cadena de texto JSON y agrego un separador de línea ("\n") al final de la cadena
//   //pa que c/producto esté en una línea separada.
//   fs.appendFile("productos.txt", JSON.stringify(nuevoProducto) + "\n","utf8",(err) => {
//       if (err) {
//         console.error(err);
//         res.status(500).send("Error al agregar el producto");
//         return;
//       }
//      //Envío la respuesta HTTP con código 201 (creado) y el JSON del producto que se agregó al archivo
//       res.status(201).json(nuevoProducto);
//     }
//   );
// });

//POST con ID único (pdto nuevo)
app.post("/productos", (req, res) => {
  //se utiliza la función readFile del modulo fs para leer el contenido del archivo productos.txt en formato de texto (utf8) y ejecuta callback cuando se complete la lectura
  fs.readFile("productos.txt", "utf8", (err, data) => {
    //si algo sale mal, envio mensaje de error al cliente
    if (err) {
      console.error(err);
      res.status(500).send("Error al agregar el producto");
      return;
    }
    //.map() recorre cada elemento del array de subcadenas devolviendo un nuevo array que contiene el objeto dividido en líneas
    const productos = data.trim().split("\n").map((producto) => JSON.parse(producto));
    //req.body es el objeto que contiene los datos enviados por el cliente en la solicitud POST
    const nuevoProducto = req.body;
    // genero un id único para el producto que se agregará (el id será igual a la cantidad de productos existentes + 1)
    //reduce() para iterar sobre el array de productos y encontrar el valor máximo de ID en archivo. producto.id es el id del pdto actual q se está comparando
    //con max q es el id max actual. Si el ID >max, evalua true y devuelve producto.id como el nuevo valor máximo, y si es false devuelve max como el id mayor encontrado.
    //El segundo argumento de la función reduce() establece el valor inicial de max en 0
    const maxId = productos.reduce((max, producto) => {
      return producto.id > max ? producto.id : max
    }, 0);
    //sumo 1 al valor máximo del ID encontrado en la línea anterior para obtener el nuevo ID para el nuevo producto
    const idNuevoProducto = maxId + 1;
    // creo el objeto 'productoConId' que incluye el nuevo id generado y las propiedades del nuevo producto obtenidas del body
    const productoConId = {
      id: idNuevoProducto,
      nombre: nuevoProducto.nombre,
      precio: nuevoProducto.precio,
      unidades: nuevoProducto.unidades,
      categoria: nuevoProducto.categoria,
      descripción: nuevoProducto.descripción
    };
    // agrego el nuevo producto al final del array de productos
    productos.push(productoConId);
    //Con .map itero sobre c/pdto en productos (q ya contiene el nuevo pdto) convirtiendolo en lineas de cadena JSON,
    //y las uno con join(). Guardo esta cadena en productoNuevo para poderlo guardar correctamente el el archivo productos
    const productoNuevo = productos.map((producto) => JSON.stringify(producto)).join('\n');
    fs.writeFile("productos.txt", productoNuevo, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error al agregar el producto");
        return;
      }
      //Envío la respuesta HTTP con código 201 (creado) y el JSON del producto que se agregó al archivo
      res.status(201).json(productoConId);
      //res.json(productoConId);
    });
  });
});


//Ruta para actualizar completamente un producto existente
app.put('/productos/:id', (req, res) => {
  // Extraigo el id del producto de la URL
  const id = req.params.id;
  //req.body es el objeto que contiene los datos enviados por el cliente en la solicitud PUT
  const datosActualizados = req.body;
  //se utiliza la función readFile del modulo fs para leer el contenido del archivo productos.txt en formato de texto (utf8) y ejecuta callback cuando se complete la lectura
  fs.readFile('productos.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al actualizar el producto');
      return;
    }
    //.map() recorre cada elemento del array de subcadenas devolviendo un nuevo array que contiene el objeto dividido en líneas 
    const productos = data.trim().split('\n').map((producto) => JSON.parse(producto));
    // busco el producto en el array que tiene el mismo id que el proporcionado en la URL (.find m devuelve el 1er elemnt q coincide)
    //Si se encuentra, se almacena en la const productoActualizado
    const productoActualizado = productos.find((producto) => producto.id.toString() === id);
    if (!productoActualizado) {
      // Si no se encuentra ningún producto con ese ID, devolvemos un error 404
      res.status(404).send('Producto no encontrado');
      return;
    }

    // Actualizamos el objeto del producto encontrado con los nuevos datos de la solicitud HTTP
    //Object.assign es un método d JavaScript q se utiliza pa copiar los valores d una o + propiedades d un objeto A a un objeto destino B
    //En este caso, copio datosActualizados a productoActualizado
    Object.assign(productoActualizado, datosActualizados);
    //Con .map itero sobre c/pdto en productos (q ya contiene el pdto actualizado) convirtiendolo en lineas de cadena JSON,
    //y las uno con join(). Guardo esta cadena en contenidoActualizado para poderlo guardar correctamente el el archivo productos
    const contenidoActualizado = productos.map((producto) => JSON.stringify(producto)).join('\n');
    // Escribo el objeto actualizado en el archivo productos.txt con func writeFile() del módulo fs de Node
    fs.writeFile('productos.txt', contenidoActualizado, 'utf8', (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error al actualizar el producto');
        return;
      }
      // Envio el objeto actualizado como respuesta en formato JSON
      res.json(productoActualizado);
    });
  });
});

// Ruta para actualizar solo una pequeña parte de un pdto existente
app.patch("/productos/:id", (req, res) => {
  // Extraigo el id del producto de la URL
  const id = req.params.id;
  //req.body es el objeto que contiene los datos enviados por el cliente en la solicitud PATCH
  const datosActualizados = req.body;
  //se utiliza la función readFile del modulo fs para leer el contenido del archivo productos.txt en formato de texto (utf8) y ejecuta callback cuando se complete la lectura
  fs.readFile("productos.txt", "utf8", (err, data) => {
    //si algo sale mal, envio mensaje de error al cliente
    if (err) {
      console.error(err);
      res.status(500).send("Error al actualizar el producto");
      return;
    }
    //.map() recorre cada elemento del array de subcadenas devolviendo un nuevo array que contiene el objeto dividido en líneas
    const productos = data.trim().split("\n").map((producto) => JSON.parse(producto))
      .filter((producto) => producto.id.toString() === id
      );
    //filter() crea nuevo array con la linea q tiene id identico al pasado en la ruta
    //.toString() convierte el id del producto a una cadena de texto para poderse comparar ===

    if (productos.length === 0) {
      //se verifica ese nuevo array y si la long es 0 se indica q no se encontró el pdto  
      res.status(404).send("Producto no encontrado");
      return;
    }

    //guardo el pdto filtrado en productoActualizado
    const productoActualizado = productos[0];
    //con Object.assign copio los valores de las propiedades del objeto datosActualizados al objeto productoActualizado
    Object.assign(productoActualizado, datosActualizados);
    // Escribo el objeto actualizado en el archivo productos.txt con func writeFile() 
    //Con el método JSON.stringify convierto el pdto de JSON a cadena de texto 
    //.join pa unir todos los JSON (si son varios) en una sola cadena con saltos de línea \n entre cada objeto 
    fs.writeFile("productos.txt", productos.map((producto) => JSON.stringify(producto)).join("\n"), "utf8", (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error al actualizar el producto");
        return;
      }
      // Envio el objeto actualizado como respuesta en formato JSON
      res.json(productoActualizado);
    });
  });
});


// Ruta para eliminar un producto existente
app.delete("/productos/:id", (req, res) => {
  // Extraigo el id del producto de la URL
  const id = req.params.id;
  //se utiliza la función readFile del modulo fs para leer el contenido del archivo productos.txt en formato de texto (utf8) y ejecuta callback cuando se complete la lectura
  fs.readFile("productos.txt", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al eliminar el producto");
      return;
    }
    //.map() recorre cada elemento del array de subcadenas devolviendo un nuevo array que contiene el objeto dividido en líneas
    const productos = data.trim().split("\n").map((producto) => JSON.parse(producto));

    //busco el índice del objeto producto que coincide con el valor de id extraído de la solicitud HTTP utilizando el método findIndex().
    const indiceProducto = productos.findIndex((producto) => producto.id.toString() === id);
    //Si no se encuentra ningún objeto producto que coincida con el id, se devuelve una respuesta de error al cliente
    if (indiceProducto === -1) {
      res.status(404).send("Producto no encontrado");
      return;
    }
    //elimino el pdto correspondiente del array productos utilizando el método splice()
    //El método devuelve un nuevo array con el/los elemento(s) eliminado(s), en este caso, un array que contiene un solo  producto. 
    //productoEliminado almacena el producto eliminado
    const productoEliminado = productos.splice(indiceProducto, 1)[0];

    //.map recorre el array y transforma cada objeto del array productos en una cadena de texto JSON con el método JSON.stringify 
    //Estas cadenas de texto son unidas en una sola cadena utilizando el método join(), y separadas por un salto de línea (\n).
    //esa cadena resultante de join se utiliza para escribir los datos de los productos aún existentes en el archivo productos.txt
    //mediante la función fs.writeFile().
    fs.writeFile("productos.txt", productos.map((producto) => JSON.stringify(producto)).join("\n"), "utf8", (err) => {
      //si algo sale mal, envio mensaje de error al cliente 
      if (err) {
        console.error(err);
        res.status(500).send("Error al eliminar el producto");
        return;
      }
      //sino, se devuelve una respuesta JSON con el objeto eliminado                                                               .
      res.json(productoEliminado);
    }
    );
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`El servidor esta escuchando en el puerto ${PORT}...`);
});
