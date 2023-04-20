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

// Comprobar si el archivo existe, si no existe, crearlo con un arreglo vacío
if (!fs.existsSync("./productosOrd.txt")) {
    fs.writeFileSync("./productosOrd.txt", "[]");
}

// Obtener todos los productos
app.get("/productos", (req, res) => {
    fs.readFile("productosOrd.txt", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error al obtener los productos");
            return;
        }
        //validación archivo vacio
        if (!data || data.trim() === "") {
            res.json([]);
            return;
        }
        let productos = [];
        try {
            productos = JSON.parse(data.trim());
        } catch (e) {
            console.error(e);
            res.status(500).send("Error al obtener los productos");
            return;
        }
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
        if (!data || data.trim() === "") {
            res.status(404).send("Producto no encontrado");
            return;
        }
        const productos = JSON.parse(data.trim());
        const producto = productos.find(p => p.nombre === nombre);
        if (producto) {
            res.status(200).json(producto);
        } else {
            res.status(404).send("Producto no encontrado");
        }
    });
});

//POST generando ID unico
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
        let productos = [];
        try {
            productos = JSON.parse(data);
        } catch (error) {
            console.error(error);
            res.status(500).send("Error al agregar el producto");
            return;
        }
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
        const productoNuevo = JSON.stringify(productos);
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

// Actualizar un producto por su ID
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
        let productos = JSON.parse(data.trim());
        const productoIndex = productos.findIndex((producto) => producto.id.toString() === id);
        if (productoIndex === -1) {
            res.status(404).send("Producto no encontrado");
            return;
        }
        const productoActualizado = {
            ...productos[productoIndex],
            ...value,
        };
        productos[productoIndex] = productoActualizado;

        const productoNuevo = JSON.stringify(productos, null, 2);
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

//DELETE por ID
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
        // Validar archivo vacío
        if (!data || data.trim() === "") {
            res.status(404).send("Producto no encontrado");
            return;
        }

        const productos = JSON.parse(data);
        const indiceProducto = productos.findIndex((producto) => producto.id.toString() == id);
        if (indiceProducto === -1) {
            res.status(404).send("Producto no encontrado");
            return;
        }
        const productoEliminado = productos.splice(indiceProducto, 1)[0];
        fs.writeFile("productosOrd.txt", JSON.stringify(productos), "utf8", (err) => {
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

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`El servidor esta escuchando en el puerto ${PORT}...`);
});

