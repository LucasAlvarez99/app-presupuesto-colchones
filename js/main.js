let productos = JSON.parse(localStorage.getItem("productos")) || [];
let saludoInicio = localStorage.getItem("saludoInicio") || "Hola, te paso el presupuesto de lo que hablamos:";
let saludoFinal = localStorage.getItem("saludoFinal") || "Gracias por confiar, saludos!";
let mensaje = [];
let vendedor = "";

// Variables para modo edición
let modoEdicion = false;
let indiceEdicion = null;

// Elementos DOM
const selectEmpresa = document.getElementById("selectEmpresa");
const selectProducto = document.getElementById("selectProducto");
const tamaniosContainer = document.getElementById("tamaniosContainer");
const mensajeFinal = document.getElementById("mensajeFinal");

// CARGA INICIAL
window.onload = () => {
  cargarEmpresas();
  cargarSaludo();
  renderizarProductos();
};

// GUARDAR O ACTUALIZAR PRODUCTO
function guardarProducto() {
  const titulo = document.getElementById("tituloInput").value.trim();
  const empresa = document.getElementById("empresaInput").value.trim();
  const descripcion = document.getElementById("descripcionInput").value.trim();
  const tamanios = document.getElementById("tamaniosInput").value.split(",").map(t => t.trim());
  const efectivo = document.getElementById("efectivoInput").value.split(",").map(p => p.trim());
  const lista = document.getElementById("listaInput").value.split(",").map(p => p.trim());

  if (!titulo || !empresa || tamanios.length === 0) return alert("Completa todos los campos");

  if (modoEdicion && indiceEdicion !== null) {
    // Actualizar producto existente
    productos[indiceEdicion] = { titulo, empresa, descripcion, tamanios, efectivo, lista };
    modoEdicion = false;
    indiceEdicion = null;
    document.getElementById("btnGuardarProducto").textContent = "Cargar producto";
  } else {
    // Validar duplicado
    let existente = productos.find(p => p.titulo.toLowerCase() === titulo.toLowerCase() && p.empresa.toLowerCase() === empresa.toLowerCase());
    if (existente) return alert("Ese producto ya existe para esa empresa.");
    productos.push({ titulo, empresa, descripcion, tamanios, efectivo, lista });
  }

  localStorage.setItem("productos", JSON.stringify(productos));
  renderizarProductos();
  cargarEmpresas();
  limpiarFormularioProducto();
}

// EDITAR PRODUCTO
function editarProducto(i) {
  const p = productos[i];

  document.getElementById("tituloInput").value = p.titulo;
  document.getElementById("empresaInput").value = p.empresa;
  document.getElementById("descripcionInput").value = p.descripcion;
  document.getElementById("tamaniosInput").value = p.tamanios.join(", ");
  document.getElementById("efectivoInput").value = p.efectivo.join(", ");
  document.getElementById("listaInput").value = p.lista.join(", ");

  modoEdicion = true;
  indiceEdicion = i;

  document.getElementById("btnGuardarProducto").textContent = "Actualizar producto";
}

// LIMPIAR FORMULARIO
function limpiarFormularioProducto() {
  document.getElementById("tituloInput").value = "";
  document.getElementById("empresaInput").value = "";
  document.getElementById("descripcionInput").value = "";
  document.getElementById("tamaniosInput").value = "";
  document.getElementById("efectivoInput").value = "";
  document.getElementById("listaInput").value = "";
}

// CARGAR EMPRESAS
function cargarEmpresas() {
  const empresasUnicas = [...new Set(productos.map(p => p.empresa))];
  selectEmpresa.innerHTML = `<option disabled selected>Seleccionar</option>`;
  empresasUnicas.forEach(emp => {
    selectEmpresa.innerHTML += `<option value="${emp}">${emp}</option>`;
  });
}

// CARGAR PRODUCTOS SEGÚN EMPRESA
selectEmpresa.addEventListener("change", () => {
  const empresaSeleccionada = selectEmpresa.value;
  const productosFiltrados = productos.filter(p => p.empresa === empresaSeleccionada);
  selectProducto.innerHTML = `<option disabled selected>Seleccionar</option>`;
  productosFiltrados.forEach(p => {
    selectProducto.innerHTML += `<option value="${p.titulo}">${p.titulo}</option>`;
  });
  tamaniosContainer.innerHTML = "";
});

// MOSTRAR TAMAÑOS
selectProducto.addEventListener("change", () => {
  const producto = productos.find(p => p.titulo === selectProducto.value && p.empresa === selectEmpresa.value);
  tamaniosContainer.innerHTML = "";
  if (producto) {
    producto.tamanios.forEach((t, i) => {
      tamaniosContainer.innerHTML += `
        <input type="checkbox" class="btn-check" id="tamanio${i}" autocomplete="off" value="${t}">
        <label class="btn btn-outline-secondary" for="tamanio${i}">${t}</label>
      `;
    });
  }
});

// AGREGAR AL MENSAJE
function agregarProductoAlMensaje() {
  vendedor = document.getElementById("vendedorInput").value.trim();
  if (!vendedor) return alert("Ingresá tu nombre");

  const producto = productos.find(p => p.titulo === selectProducto.value && p.empresa === selectEmpresa.value);
  if (!producto) return alert("Seleccioná un producto válido");

  const tamaniosSeleccionados = Array.from(document.querySelectorAll("#tamaniosContainer input:checked")).map(i => i.value);
  if (tamaniosSeleccionados.length === 0) return alert("Seleccioná al menos un tamaño");

  let texto = `\ncolchón ${producto.titulo.toLowerCase()} de ${producto.descripcion.toLowerCase()}\n`;
  tamaniosSeleccionados.forEach(t => {
    const idx = producto.tamanios.indexOf(t);
    const precioEf = producto.efectivo[idx] || "s/dato";
    const precioLista = producto.lista[idx] || "s/dato";
    texto += `Tamaño: ${t}\nPrecio en efectivo: ${precioEf}\nPrecio de lista: ${precioLista}\n\n`;
  });

  mensaje.push(texto);
  mostrarMensaje();
}

// MOSTRAR MENSAJE FINAL
function mostrarMensaje() {
  let final = `${saludoInicio}\n\n${mensaje.join("\n")}${saludoFinal}\n\n${vendedor ? `Atte: ${vendedor}` : ""}`;
  mensajeFinal.value = final.trim();
}

// COPIAR
function copiarMensaje() {
  navigator.clipboard.writeText(mensajeFinal.value);
  alert("Mensaje copiado ✅");
}

// GUARDAR SALUDO
function guardarSaludo() {
  saludoInicio = document.getElementById("saludoInicio").value;
  saludoFinal = document.getElementById("saludoFinal").value;
  localStorage.setItem("saludoInicio", saludoInicio);
  localStorage.setItem("saludoFinal", saludoFinal);
  alert("Saludo guardado ✅");
}

// CARGAR SALUDO
function cargarSaludo() {
  document.getElementById("saludoInicio").value = saludoInicio;
  document.getElementById("saludoFinal").value = saludoFinal;
}

// RENDERIZAR PRODUCTOS
function renderizarProductos() {
  const cont = document.getElementById("listaProductos");
  cont.innerHTML = "";
  productos.forEach((p, i) => {
    cont.innerHTML += `
      <div class="card card-producto mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <b>${p.titulo}</b> - ${p.empresa}<br>
            ${p.tamanios.join(", ")}
          </div>
          <div>
            <button class="btn btn-warning btn-sm me-2" onclick="editarProducto(${i})">✏️</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${i})">🗑️</button>
          </div>
        </div>
      </div>
    `;
  });
}

// ELIMINAR PRODUCTO
function eliminarProducto(i) {
  if (confirm("¿Eliminar este producto?")) {
    productos.splice(i, 1);
    localStorage.setItem("productos", JSON.stringify(productos));
    renderizarProductos();
    cargarEmpresas();
  }
}

// MODO OSCURO / CLARO
function toggleModoOscuro() {
  const body = document.body;
  const switchInput = document.getElementById("modoOscuroSwitch");

  body.classList.toggle("modo-oscuro");
  const esOscuro = body.classList.contains("modo-oscuro");
  localStorage.setItem("modoOscuro", esOscuro ? "true" : "false");

  if (switchInput) switchInput.checked = esOscuro;
}

// CARGAR MODO OSCURO AL INICIAR
window.addEventListener("DOMContentLoaded", () => {
  const modoGuardado = localStorage.getItem("modoOscuro") === "true";
  if (modoGuardado) {
    document.body.classList.add("modo-oscuro");
  }
  const switchInput = document.getElementById("modoOscuroSwitch");
  if (switchInput) switchInput.checked = modoGuardado;
});