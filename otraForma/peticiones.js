const botonGet = document.getElementById('get');
botonGet.addEventListener('click', () => {
    const productosDiv = document.getElementById('productos');

    fetch('http://localhost:3031/productos')
        .then(response => response.json())
        .then(data => {
            const listaProductos = document.createElement('ul');

            data.forEach(producto => {
                const itemProducto = document.createElement('li');
                itemProducto.textContent = `Nombre: ${producto.nombre}, Precio: ${producto.precio}, Unidades: ${producto.unidades}, Categoría: ${producto.categoria}, Descripción: ${producto.descripción}`;
                listaProductos.appendChild(itemProducto);
            });

            productosDiv.appendChild(listaProductos);
        })
        .catch(error => console.error(error));
});
