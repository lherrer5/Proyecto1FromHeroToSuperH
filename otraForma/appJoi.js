    const express = require("express");
    const Joi = require('joi');
    const fs = require("fs");
    const app = express();
    const PORT = 3050;

    //Agrego el middleware express.json() a la app pa analizar solicitudes entrantes (en formato JSON) y cargarla en req.body (de JSON a JS)
    app.use(express.json());


      //Requisitos para la validación de datos. 
      const nuevoProductoSchema = Joi.object({
        nombre: Joi.string().min(2).max(12).required(),
        precio: Joi.number().positive().required(),
        unidades: Joi.number().integer().positive().required(),
        categoria: Joi.string().required(),
        descripción: Joi.string().required()
      });

    // Ruta para agregar un nuevo producto
    app.post("/productos", (req, res) => {
    // utilizo el método validate de Joi para validar el objeto req.body (los datos enviados por el cliente) con el esquema
    //de validación nuevoProductoSchema. Si hay algún error de validación, devuelvo un mensaje de error al cliente utilizando el 
    //código de estado HTTP 400 (Bad Request). Si los datos son válidos, continuo con el proceso de agregar el nuevo producto.
      const { error, value } = nuevoProductoSchema.validate(req.body, {
    //para que no se detenga en el primer error, sino q envie al cliente todos los errores juntos
        abortEarly: false,
      });
      if (error) {
        // Si hay un error de validación, devolvemos un mensaje de error al cliente
        res.status(400).send(error.details[0].message);
        return;
      }
    
      // Los datos son válidos, continuamos con el proceso de agregar el nuevo producto
      const nuevoProducto = value;
    
      // Agregamos el nuevo producto al archivo productosJoi.txt
      fs.appendFile("productosJoi.txt", JSON.stringify(nuevoProducto) + "\n","utf8",(err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error al agregar el producto");
          return;
        }
    
        res.status(201).json(nuevoProducto);
      });
    });
    
// Obtener todos los productos
app.get("/productos", (req, res) => {
  fs.readFile("productosJoi.txt", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener los productos");
      return;
    }
    const productos = data.trim().split("\n").map(JSON.parse);
    res.json(productos);
  });
});

// Obtener un producto por su nombre
app.get("/productos/:nombre", (req, res) => {
  const nombre = req.params.nombre;
  fs.readFile("productosJoi.txt", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener los productos");
      return;
    }
    const productos = data.trim().split("\n").map(JSON.parse);
  //busco el primer objeto JSON en productos q tenga el nombre igual al valor de la constante "nombre" y find() devuelve el objeto encontrado o undefined si no se encuentra ningún objeto.
    const producto = productos.find(p => p.nombre === nombre);
    if (producto) {
      res.status(200).json(producto);
    } else {
      res.status(404).send("Producto no encontrado");
    }
  });
});


// Actualizar un producto existente
app.put("/productos/:nombre", (req, res) => {
  const nombre = req.params.nombre;
  // utilizo el método validate de Joi para validar el objeto req.body (los datos enviados por el cliente) con el esquema
  //de validación nuevoProductoSchema. Si hay algún error de validación, devuelvo un mensaje de error al cliente utilizando el 
  //código de estado HTTP 400 (Bad Request). Si los datos son válidos, continuo con el proceso de agregar el nuevo producto.
  const { error, value } = nuevoProductoSchema.validate(req.body, {
    //para que no se detenga en el primer error, sino q envie al cliente todos los errores juntos
        abortEarly: false,
      });
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  // Los datos son válidos, continuamos con el proceso de actualizar el producto
  const nuevoProducto = value;
  fs.readFile("productosJoi.txt", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener los productos");
      return;
    }
    let productos = data.trim().split("\n").map(JSON.parse);
    const productoIndex = productos.findIndex(p => p.nombre === nombre);
    if (productoIndex !== -1) {
      productos[productoIndex] = nuevoProducto;
      fs.writeFile("productosJoi.txt", productos.map(JSON.stringify).join("\n") + "\n", "utf8", err => {
        if (err) {
          console.error(err);
          res.status(500).send("Error al actualizar el producto");
          return;
        }
        res.status(200).json(nuevoProducto);
      });
    } else {
      res.status(404).send("Producto no encontrado");
    }
  });
});

// Actualizar parcialmente un producto existente
app.patch("/productos/:nombre", (req, res) => {
  const nombre = req.params.nombre;
  const { error, value } = nuevoProductoSchema.validate(req.body, {
    //para que no se detenga en el primer error, sino q envie al cliente todos los errores juntos
        abortEarly: false,
      });
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  const nuevoProducto = value;
  fs.readFile("productosJoi.txt", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener los productos");
      return;
    }
    let productos = data.trim().split("\n").map(JSON.parse);
    const productoIndex = productos.findIndex(p => p.nombre === nombre);
    if (productoIndex !== -1) {
      productos[productoIndex] = { ...productos[productoIndex], ...nuevoProducto };
      fs.writeFile("productosJoi.txt", productos.map(JSON.stringify).join("\n") + "\n", "utf8", err => {
        if (err) {
          console.error(err);
          res.status(500).send("Error al actualizar el producto");
          return;
        }
        res.status(200).json(productos[productoIndex]);
      });
    } else {
      res.status(404).send("Producto no encontrado");
    }
  });
});

// Eliminar un producto existente
app.delete("/productos/:nombre", (req, res) => {
  const nombre = req.params.nombre;
  fs.readFile("productosJoi.txt", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener los productos");
      return;
    }
    let productos = data.trim().split("\n").map(JSON.parse);
    const productoIndex = productos.findIndex(p => p.nombre === nombre);
    if (productoIndex !== -1) {
      productos.splice(productoIndex, 1);
      fs.writeFile("productosJoi.txt", productos.map(JSON.stringify).join("\n") + "\n", "utf8", err => {
        if (err) {
          console.error(err);
          res.status(500).send("Error al eliminar el producto");
          return;
        }
        res.status(204).send();
      });
    } else {
      res.status(404).send("Producto no encontrado");
    }
  });
});


    // Iniciar el servidor
    app.listen(PORT, () => {
    console.log(`El servidor esta escuchando en el puerto ${PORT}...`);
    });
