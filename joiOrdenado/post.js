const botonPost = document.getElementById("post");

botonPost.addEventListener("click", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const precio = document.getElementById("precio").value;
  const unidades = document.getElementById("unidades").value;
  const categoria = document.getElementById("categoria").value;
  const descripcion = document.getElementById("descripcion").value;

  const nuevoProducto = {
    nombre: nombre,
    precio: precio,
    unidades: unidades,
    categoria: categoria,
    descripción: descripcion,
  };

  fetch("http://localhost:3060/productos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nuevoProducto),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al agregar el producto");
      }
      return response.json();
    })
    .then((producto) => {
      alert(`Producto ${producto.nombre} agregado con éxito!`);
      formulario.reset();
    })
    .catch((error) => {
      console.error(error);
      alert("Error al agregar el producto");
    });
});
