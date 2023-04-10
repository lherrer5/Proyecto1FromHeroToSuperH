
// const botonGet = document.getElementById('get');
// botonGet.addEventListener('click', () => {
//     const productosDiv = document.getElementById('productos');

//     fetch('http://localhost:3031/productos')
//         .then(response => response.json())
//         .then(data => {
//             for (let i = 0; i < data.length; i++) {
//                 const producto = data[i];
//                 const productoDiv = document.createElement('div');
//                 productoDiv.classList.add('producto');
//                 productoDiv.textContent = `Nombre: ${producto.nombre}, Precio: ${producto.precio}, Unidades: ${producto.unidades}, Categoría: ${producto.categoria}, Descripción: ${producto.descripcion}`;
//                 productosDiv.appendChild(productoDiv);
//             }
//         })
//         .catch(error => console.error(error));
// });

const botonGet = document.getElementById('get');
botonGet.addEventListener('click', () => {
    const productosDiv = document.getElementById('productos');

    fetch('http://localhost:3031/productos')
        .then(response => response.json())
        .then(data => {
            data.forEach(producto => {
                const productoDiv = document.createElement('div');
                productoDiv.classList.add('producto');

                const listaProducto = document.createElement('ul');
                listaProducto.classList.add('lista-producto');

                const nombreProducto = document.createElement('li');
                nombreProducto.textContent = `Nombre: ${producto.nombre}`;
                listaProducto.appendChild(nombreProducto);

                const precioProducto = document.createElement('li');
                precioProducto.textContent = `Precio: ${producto.precio}`;
                listaProducto.appendChild(precioProducto);

                const unidadesProducto = document.createElement('li');
                unidadesProducto.textContent = `Unidades: ${producto.unidades}`;
                listaProducto.appendChild(unidadesProducto);

                const categoriaProducto = document.createElement('li');
                categoriaProducto.textContent = `Categoría: ${producto.categoria}`;
                listaProducto.appendChild(categoriaProducto);

                const descripcionProducto = document.createElement('li');
                descripcionProducto.textContent = `Descripción: ${producto.descripción}`;
                listaProducto.appendChild(descripcionProducto);

                productoDiv.appendChild(listaProducto);
                productosDiv.appendChild(productoDiv);
            });
        })
        .catch(error => console.error(error));
});
