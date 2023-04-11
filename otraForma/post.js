const botonPost = document.getElementById('post');
const formulario = document.getElementById('formulario');

formulario.addEventListener('submit', (e) => {
    e.preventDefault();
//e.preventDefault() previene que el formulario se envíe automáticamente y cancela el comportamiento predeterminado del navegador

    const nuevoProducto = {
        nombre: document.getElementById('nombre').value,
        precio: document.getElementById('precio').value,
        unidades: document.getElementById('unidades').value,
        categoria: document.getElementById('categoria').value,
        descripcion: document.getElementById('descripcion').value
    };

    fetch('http://localhost:3031/productos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoProducto)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('respuesta-post').innerHTML = `Producto agregado correctamente con id ${data.id}`;
        })
        .catch(error => console.error(error));
});
