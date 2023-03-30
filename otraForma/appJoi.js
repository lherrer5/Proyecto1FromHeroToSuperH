    const express = require("express");
    const Joi = require('joi');
    const fs = require("fs");
    const app = express();
    const PORT = 3050;

    // Middleware para parsear el body de las solicitudes
    app.use(express.json());


      //Esquema validación para tus datos. Por ejemplo, podrías definir un esquema de validación para el objeto nuevoProducto en la ruta POST /productos
      const nuevoProductoSchema = Joi.object({
        nombre: Joi.string().required(),
        descripción: Joi.string().required(),
        precio: Joi.number().positive().required(),
        unidades: Joi.number().integer().positive().required()
      });

    // Ruta para agregar un nuevo producto
    app.post("/productos", (req, res) => {
    // utilizo el método validate de Joi para validar el objeto req.body (los datos enviados por el cliente) con el esquema
    //de validación nuevoProductoSchema. Si hay algún error de validación, devuelvo un mensaje de error al cliente utilizando el 
    //código de estado HTTP 400 (Bad Request). Si los datos son válidos, continuo con el proceso de agregar el nuevo producto.
      const { error, value } = nuevoProductoSchema.validate(req.body);
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
    res.status(200).json(productos);
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
  const { error, value } = nuevoProductoSchema.validate(req.body);
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
  const { error, value } = nuevoProductoSchema.validate(req.body);
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
