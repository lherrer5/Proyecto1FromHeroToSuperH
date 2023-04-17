const express = require("express");
const { validateSignup } = require("./validator");
const { validateActProducto } = require("./validator");
const { validateDelProducto } = require("./validator");
const fs = require("fs");
const app = express();
const cors = require('cors');
const PORT = 3060;

app.use(express.json());
app.use(cors());

// Obtener todos los productos
app.get("/productos", (req, res) => {
    fs.readFile("productosOrd.txt", "utf8", (err, data) => {
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
    fs.readFile("productosOrd.txt", "utf8", (err, data) => {
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


//POST con ID único (pdto nuevo)
app.post("/productos", (req, res) => {
    const { error, value } = validateSignup(req.body, { abortEarly: false });
    if (error) {
        console.log(error);
        return res.status(400).send(error.details);
    }

    const nuevoProducto = value;
    fs.readFile("productosOrd.txt", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error al agregar el producto");
            return;
        }
        const productos = data.trim().split("\n").map((producto) => JSON.parse(producto));
        const maxId = productos.reduce((max, producto) => {
            return producto.id > max ? producto.id : max;
        }, 0);
        const idNuevoProducto = maxId + 1;
        const productoConId = {
            id: idNuevoProducto,
            nombre: nuevoProducto.nombre,
            precio: nuevoProducto.precio,
            unidades: nuevoProducto.unidades,
            categoria: nuevoProducto.categoria,
            descripción: nuevoProducto.descripción,
        };
        productos.push(productoConId);
        const productoNuevo = productos.map((producto) => JSON.stringify(producto)).join("\n");
        fs.writeFile("productosOrd.txt", productoNuevo, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error al agregar el producto");
                return;
            }
            res.status(201).json(productoConId);
        });
    });
});


// Ruta para actualizar solo una pequeña parte de un pdto existente
app.patch("/productos/:id", (req, res) => {
    const id = req.params.id;
    const { error, value } = validateActProducto(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    fs.readFile("productosOrd.txt", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error al actualizar el producto");
            return;
        }
        let productos = data.trim().split("\n").map((producto) => JSON.parse(producto));
        const productoIndex = productos.findIndex((producto) => producto.id.toString() === id);
        if (productoIndex === -1) {
            res.status(404).send("Producto no encontrado");
            return;
        }
        const productoActualizado = {
            ...productos[productoIndex],
            ...value
        };
        productos[productoIndex] = productoActualizado;

        const productoNuevo = productos.map((producto) => JSON.stringify(producto)).join("\n");
        fs.writeFile("productosOrd.txt", productoNuevo, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error al actualizar el producto");
                return;
            }
            res.json(productoActualizado);
        });
    });
});


// Ruta para eliminar un producto existente con ID
app.delete("/productos/:id", (req, res) => {
    const { error } = validateDelProducto(req.params);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    const id = req.params.id;
    fs.readFile("productosOrd.txt", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error al eliminar el producto");
            return;
        }
        const productos = data.trim().split("\n").map((producto) => JSON.parse(producto));
        const indiceProducto = productos.findIndex((producto) => producto.id.toString() === id);
        if (indiceProducto === -1) {
            res.status(404).send("Producto no encontrado");
            return;
        }
        const productoEliminado = productos.splice(indiceProducto, 1)[0];
        fs.writeFile("productosOrd.txt", productos.map((producto) => JSON.stringify(producto)).join("\n"), "utf8", (err) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error al eliminar el producto");
                return;
            }
            res.json(productoEliminado);
        }
        );
    });
});


// app.delete("/productos/:id", (req, res) => {
//     const id = req.params.id;
//     fs.readFile("productosOrd.txt", "utf8", (err, data) => {
//         if (err) {
//             console.error(err);
//             res.status(500).send("Error al eliminar el producto");
//             return;
//         }
//         const productos = data.trim().split("\n").map((producto) => JSON.parse(producto));
//         const indiceProducto = productos.findIndex((producto) => producto.id.toString() === id);
//         if (indiceProducto === -1) {
//             res.status(404).send("Producto no encontrado");
//             return;
//         }
//         const productoEliminado = productos.splice(indiceProducto, 1)[0];
//         fs.writeFile("productosOrd.txt", productos.map((producto) => JSON.stringify(producto)).join("\n"), "utf8", (err) => {
//             if (err) {
//                 console.error(err);
//                 res.status(500).send("Error al eliminar el producto");
//                 return;
//             }
//             res.json(productoEliminado);
//         }
//         );
//     });
// });

// Eliminar un producto existente con NOMBRE
app.delete("/productos/:nombre", (req, res) => {
    const nombre = req.params.nombre;
    fs.readFile("productosOrd.txt", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error al obtener los productos");
            return;
        }
        let productos = data.trim().split("\n").map(JSON.parse);
        const productoIndex = productos.findIndex(p => p.nombre === nombre);
        if (productoIndex !== -1) {
            productos.splice(productoIndex, 1);
            fs.writeFile("productosOrd.txt", productos.map(JSON.stringify).join("\n") + "\n", "utf8", err => {
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
