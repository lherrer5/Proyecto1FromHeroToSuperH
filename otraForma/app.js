const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3030;

// Middleware para parsear el body de las solicitudes
app.use(express.json());

// Ruta para obtener todos los productos
app.get("/productos", (req, res) => {
  //se utiliza la función readFile del modulo fs para leer el contenido del archivo productos.txt en formato de texto (utf8). 
  //Callback se ejecuta cuando se completa la operación de lectura
    fs.readFile("productos.txt", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      //envio mensaje de error al cliente
      res.status(500).send("Error al obtener los productos");
      return;
    }
  
    //Si la lectura del archivo es exitosa, el contenido se almacena en data. 
    const productos = data
    //.trim() se utiliza para eliminar cualquier espacio en blanco adicional que pueda existir al inicio 
    //o al final de cada línea del archivo "productos.txt" antes de procesar su contenido
      .trim()
    //split("\n") se utiliza para dividir la cadena de texto data en subcadenas más pequeñas, utilizando como 
    //separador el carácter de salto de línea (\n). Como el archivo "productos.txt" contiene una lista de productos, 
    //cada producto se escribe en una línea separada. Al utilizar split("\n"), la cadena de texto data se divide en un array 
    //de subcadenas, donde cada elemento del array es una línea del archivo "productos.txt".
      .split("\n")
      //Data se procesa para convertir cada línea en un objeto JavaScript mediante el método map y JSON.parse
      //.map() recorre cada elemento del array de subcadenas (que se obtuvo al dividir la cadena de texto data) y aplica la función 
      //JSON.parse() a cada elemento, para convertirlo en un objeto JavaScript devolviendo un nuevo array que contiene los objetos 
      //JavaScript resultantes
      .map((producto) => JSON.parse(producto));
      //res.json envía la lista de objetos como una respuesta JSON al cliente
    res.json(productos);
  });
});

//GET con ID

app.get("/productos/:id", (req, res) => {

    const id = req.params.id;
    //const resultado = req.body;
    //la función readFile() del módulo fs de Node.js lee el archivo productos.txt de forma asíncrona y 
    //toma la callback que se ejecutará cuando se complete la lectura
      fs.readFile('productos.txt', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error al actualizar el producto');
          return;
        }
     //.map() recorre cada elemento del array de subcadenas devolviendo un nuevo array que contiene el objeto dividido en líneas 
        let productos = data.trim().split('\n').map((producto) => JSON.parse(producto))
        .filter((producto) => producto.id.toString() === id);
      
        if (productos.length === 0) {
          res.status(404).send("Producto no encontrado");
          return;
        }
        res.json(productos[0]);
      });
    });


// Ruta para agregar un nuevo producto
app.post("/productos", (req, res) => {
  //req.body es un objeto que contiene los datos enviados por el cliente en la solicitud POST
  const nuevoProducto = req.body;
  //la función appendFile() del módulo fs de Node.js agrega el contenido de nuevoProducto al final del archivo productos.txt".
  //Convierto el objeto nuevoProducto a una cadena de texto JSON y agrego un separador de línea ("\n") al final de la cadena
  //pa que c/producto esté en una línea separada.
  fs.appendFile("productos.txt", JSON.stringify(nuevoProducto) + "\n","utf8",(err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error al agregar el producto");
        return;
      }
  //res.status(201) genera el código de estado HTTP de la respuesta en "201 Created", 
  //lo que indica que se ha creado un nuevo recurso en el servidor
  //.json(nuevoProducto) hace q nuevoProducto se convierta en un objeto JSON y se envíe al cliente como la respuesta
      res.status(201).json(nuevoProducto);
    }
  );
});


//Ruta para actualizar completamente un producto
app.put('/productos/:id', (req, res) => {
  // Extraigo el id del producto de la URL
  const id = req.params.id;
  //req.body es el objeto que contiene los datos enviados por el cliente en la solicitud PUT
  const datosActualizados = req.body;
//la función readFile() del módulo fs de Node.js lee el archivo productos.txt de forma asíncrona y 
//toma la callback que se ejecutará cuando se complete la lectura
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
    Object.assign(productoActualizado, datosActualizados);
    // Escribimos el objeto actualizado en el archivo productos.txt
    const contenidoActualizado = productos.map((producto) => JSON.stringify(producto)).join('\n');
    fs.writeFile('productos.txt', contenidoActualizado, 'utf8', (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error al actualizar el producto');
        return;
      }
      // Enviamos el objeto actualizado como respuesta
      res.json(productoActualizado);
    });
  });
});

// Ruta para actualizar para actualizar solo una pequeña parte de un pdto existente
app.patch("/productos/:id", (req, res) => {
//extraigo el parámetro :id de la URL y lo almaceno en la variable id
  const id = req.params.id;
//req.body es el objeto que contiene los datos enviados por el cliente en la solicitud PATCH
  const datosActualizados = req.body;
//la función readFile() del módulo fs de Node.js lee el archivo productos.txt de forma asíncrona y 
//toma la callback que se ejecutará cuando se complete la lectura
  fs.readFile("productos.txt", "utf8", (err, data) => {
//Si ocurre un error al leer el archivo, se devuelve un error 500 al cliente.
    if (err) {
      console.error(err);
      res.status(500).send("Error al actualizar el producto");
      return;
    }
//El contenido del archivo se divide en líneas y se parsea cada línea en un objeto JSON. 
//Estos objetos se almacenan en un array llamado productos.
    let productos = data
//.map() recorre cada elemento del array de subcadenas devolviendo un nuevo array que contiene el objeto dividido en líneas 
      .trim().split("\n").map((producto) => JSON.parse(producto))
      .filter((producto) => producto.id.toString() === id
      );
    if (productos.length === 0) {
      res.status(404).send("Producto no encontrado");
      return;
    }
    const productoActualizado = productos[0];
    Object.assign(productoActualizado, datosActualizados); 
    fs.writeFile("productos.txt", productos.map((producto) => JSON.stringify(producto)).join("\n"), "utf8", (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error al actualizar el producto");
        return;
      }
      res.json(productoActualizado);
    });
  });
});


// Ruta para eliminar un producto existente
app.delete("/productos/:id", (req, res) => {
//extraigo el parámetro :id de la URL y lo almaceno en la variable id
  const id = req.params.id;
//la función readFile() del módulo fs de Node.js lee el archivo productos.txt de forma asíncrona y 
//toma la callback que se ejecutará cuando se complete la lectura  
  fs.readFile("productos.txt", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al eliminar el producto");
      return;
    }
//El contenido del archivo se divide en líneas y se parsea cada línea en un objeto JSON. 
//Estos objetos se almacenan en un array llamado productos.
    let productos = data
      .trim()
      .split("\n")
//.map() recorre cada elemento del array de subcadenas devolviendo un nuevo array que contiene el objeto dividido en líneas 
      .map((producto) => JSON.parse(producto));
//busco el índice del objeto producto que coincide con el valor de id extraído de la solicitud HTTP utilizando el método findIndex().
    const indiceProducto = productos.findIndex(
      (producto) => producto.id.toString() === id
    );
//Si no se encuentra ningún objeto producto que coincida con el id, se devuelve una respuesta de error al cliente
    if (indiceProducto === -1) {
      res.status(404).send("Producto no encontrado");
      return;
    }
//elimino el objeto producto correspondiente del array productos utilizando el método splice()
//El método devuelve un nuevo array con el/los elemento(s) eliminado(s), en este caso, un array que contiene un solo objeto producto. 
//productoEliminado almacena el objeto producto eliminado
    const productoEliminado = productos.splice(indiceProducto, 1)[0];
//.map recorre el array y transforma cada objeto del array productos en una cadena de texto JSON
//Estas cadenas de texto son unidas en una sola cadena utilizando el método join(), y separadas por un salto de línea (\n).
//esa cadena resultante de join se utiliza para escribir los datos de los productos aún existentes en el archivo productos.txt
//mediante la función fs.writeFile().
    fs.writeFile("productos.txt",productos.map((producto) => JSON.stringify(producto)).join("\n"),"utf8",(err) => {
//Si ocurre un error al escribir el archivo, se devuelve un error 500 al cliente. 
        if (err) {
          console.error(err);
          res.status(500).send("Error al eliminar el producto");
          return;
        }
//sino, se devuelve una respuesta JSON con el objeto de los productos aún existentes.
        res.json(productoEliminado);
      }
    );
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`El servidor esta escuchando en el puerto ${PORT}...`);
});
