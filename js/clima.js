// Función para buscar clima
function buscarClima() {
    const ubicacion = document.getElementById('ubicacion').value.trim();
    const lat = document.getElementById('calle1').value.trim();
    const lon = document.getElementById('calle2').value.trim();

    let url = '';

    // Construir la URL dependiendo de los valores
    if (ubicacion) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ubicacion)}&appid=9e122cd782b2d0333f5fe4e7fa192062&units=metric&lang=es`;
    } else if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=9e122cd782b2d0333f5fe4e7fa192062&units=metric&lang=es`;

    } else {
        mostrarClima(false);
        alert("Por favor, ingresa una ubicación o las coordenadas (latitud y longitud).");
        return;
    }

    axios.get(url)
    .then(function(response) {
        mostrarClima(false);

        const data = response.data;

        // Obtiene las temperaturas máxima y mínima desde el JSON
        const tempMax = data.main.temp_max;
        const tempMin = data.main.temp_min;
        const feelsLike = data.main.feels_like;

        // Actualiza los campos en la tarjeta
        document.getElementById('descripcion').textContent = data.weather[0].description;
        document.getElementById('temperatura').textContent = `${data.main.temp}°C`;
        document.getElementById('temp-max').textContent = tempMax !== undefined ? `${tempMax}°C` : 'No disponible';
        document.getElementById('temp-min').textContent = tempMin !== undefined ? `${tempMin}°C` : 'No disponible';
        document.getElementById('feels-like').textContent = feelsLike !== undefined ? `Sensación de: ${feelsLike}°C` : 'No disponible';
        document.getElementById('humedad').textContent = `${data.main.humidity}%`;
        document.getElementById('pais').textContent = `${data.name}, ${data.sys.country}`;
        document.getElementById('fecha').textContent = new Date().toLocaleDateString('es-ES');

        // Actualizar ícono del clima
        const icono = data.weather[0].icon;
        document.getElementById('icono-clima').innerHTML = `<img src="https://openweathermap.org/img/wn/${icono}@2x.png" alt="icono clima">`;

        // Llamar a la función hablar con los resultados obtenidos
        const texto = `El clima en ${data.name}, ${data.sys.country} es de ${data.weather[0].description} con una temperatura actual de ${data.main.temp} grados Celsius. 
        La temperatura máxima será de ${tempMax} grados y la mínima de ${tempMin} grados. Sensación térmica: ${feelsLike} grados. Humedad: ${data.main.humidity}%.`;
        hablar(texto);

    })
    .catch(function(error) {
        mostrarClima(false);
        console.error("Error al realizar la solicitud:", error);
        alert("No se pudo obtener el clima. Intenta nuevamente más tarde.");
    });
}

// Función para mostrar el cargando
function mostrarClima(visible) {
    const climaLoader = document.getElementById('clima-loader');
    climaLoader.style.display = visible ? 'block' : 'none';
}

// Función para buscar dirección
function buscarDireccion() {
    let calle1 = document.getElementById("calle1").value.trim(); 
    let calle2 = document.getElementById("calle2").value.trim(); 

    // latitud y longitud geolocalización
    if (esCoordenada(calle1) && esCoordenada(calle2)) {
        obtenerPorCoordenadas(calle1, calle2);
    }
    // calle y altura
    else if (esNumero(calle2)) {
        obtenerPorCalleYAltura(calle1, calle2);
    }
    // cruce entre dos calles
    else if (calle1 && calle2) {
        obtenerPorInterseccion(calle1, calle2);
    } else {
        alert("Por favor ingrese una opción válida para realizar la búsqueda.");
    }
}

// Función que obtiene la ubicación actual del usuario
function obtenerUbicacionActual() {
    if (navigator.geolocation) {
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(function(position) {
            const latitud = position.coords.latitude;
            const longitud = position.coords.longitude;

            // Llamar a la función para obtener la dirección usando las coordenadas
            obtenerPorCoordenadas(latitud, longitud);
        }, function(error) {
            alert("No se pudo obtener la ubicación.");
        }, options);
    } else {
        alert("La geolocalización no es compatible con este navegador.");
    }
}

// Función que determina si un valor es una coordenada válida
function esCoordenada(valor) {
    return !isNaN(valor) && valor.indexOf('.') !== -1;
}

// Función que determina si un valor es un número (altura)
function esNumero(valor) {
    return !isNaN(valor) && valor.indexOf('.') === -1;
}

// Función que busca por intersección de calles
function obtenerPorInterseccion(calle1, calle2) {
    let url = `https://servicios.usig.buenosaires.gob.ar/normalizar/?direccion=${encodeURIComponent(calle1)}%20y%20${encodeURIComponent(calle2)}`;

    document.getElementById("resultado").innerHTML = "Buscando...";

    // solicitud a la API
    axios.get(url)
        .then(function(response) {
            console.log(response); 

            let resultadoHTML = "";

            if (response.data.direccionesNormalizadas && response.data.direccionesNormalizadas.length > 0) {
                response.data.direccionesNormalizadas.forEach(function(resultado) {
                    const detalles = `
                        <ul>
                            <li><strong>Dirección:</strong> ${resultado.direccion}</li>
                            <li><strong>Calle:</strong> ${resultado.nombre_calle}</li>
                            <li><strong>Calle de cruce:</strong> ${resultado.nombre_calle_cruce}</li>
                            <li><strong>Localidad:</strong> ${resultado.nombre_localidad}</li>
                            <li><strong>Partido:</strong> ${resultado.nombre_partido}</li>
                            <li><strong>Tipo de búsqueda:</strong> ${resultado.tipo}</li>
                        </ul>
                    `;
                    resultadoHTML += detalles;

                    // Concatenamos los campos en un texto para ser leído
                    const texto = `Dirección: ${resultado.direccion}, Calle: ${resultado.nombre_calle}, Calle de cruce: ${resultado.nombre_calle_cruce}, Localidad: ${resultado.nombre_localidad}, Partido: ${resultado.nombre_partido}, Tipo de búsqueda: ${resultado.tipo}`;
                    
                    // Llamamos a la función hablar con el texto
                    hablar(texto);
                });

                document.getElementById("resultado").innerHTML = `Direcciones encontradas: ${resultadoHTML}`;
            } else {
                document.getElementById("resultado").innerHTML = "No se encontraron resultados para esta intersección de calles.";
                hablar("No se encontraron resultados para esta intersección de calles.");
            }
        })
        .catch(function(error) {
            console.error("Error al realizar la solicitud:", error);
            document.getElementById("resultado").innerHTML = "La API no está disponible en este momento. Intenta más tarde.";
            hablar("La API no está disponible en este momento. Intenta más tarde.");
        });
}



// Función que busca por coordenadas
function obtenerPorCoordenadas(latitud, longitud) {
    let url = `https://geocode.xyz/${latitud},${longitud}?json=1`;

    document.getElementById("resultado").innerHTML = "Buscando...";

    axios.get(url)
        .then(function(response) {
            console.log(response); 

            if (response.data.error) {
                document.getElementById("resultado").innerHTML = "No se encontró ninguna dirección para estas coordenadas.";
                hablar("No se encontró ninguna dirección para estas coordenadas.");
            } else {
                const direccion = `${response.data.staddress}, ${response.data.city}, ${response.data.country}`;
                document.getElementById("resultado").innerHTML = `Dirección encontrada: ${direccion}`;
                hablar(`Dirección encontrada: ${direccion}`);
            }
        })
        .catch(function(error) {
            console.error("Error al realizar la solicitud:", error);
            document.getElementById("resultado").innerHTML = "La API no está disponible en este momento. Intenta más tarde.";
            hablar("La API no está disponible en este momento. Intenta más tarde.");
        });
}



// Función que busca por calle y altura
function obtenerPorCalleYAltura(calle, altura) {
    let url = `https://servicios.usig.buenosaires.gob.ar/normalizar/?direccion=${encodeURIComponent(calle)}%20${encodeURIComponent(altura)}`;

    document.getElementById("resultado").innerHTML = "Buscando...";

    axios.get(url)
        .then(function(response) {
            console.log(response); 

            let resultadoHTML = "";

            if (response.data.direccionesNormalizadas && response.data.direccionesNormalizadas.length > 0) {
                response.data.direccionesNormalizadas.forEach(function(resultado) {
                    const detalles = `
                        <ul>
                            <li><strong>Dirección:</strong> ${resultado.direccion}</li>
                            <li><strong>Calle:</strong> ${resultado.nombre_calle}</li>
                            <li><strong>Calle de cruce:</strong> ${resultado.nombre_calle_cruce}</li>
                            <li><strong>Localidad:</strong> ${resultado.nombre_localidad}</li>
                            <li><strong>Partido:</strong> ${resultado.nombre_partido}</li>
                            <li><strong>Tipo de búsqueda:</strong> ${resultado.tipo}</li>
                        </ul>
                    `;
                    resultadoHTML += detalles;

                    // Concatenamos los campos en un texto para ser leído
                    const texto = `Dirección: ${resultado.direccion}, Calle: ${resultado.nombre_calle}, Calle de cruce: ${resultado.nombre_calle_cruce}, Localidad: ${resultado.nombre_localidad}, Partido: ${resultado.nombre_partido}, Tipo de búsqueda: ${resultado.tipo}`;
                    
                    // Llamamos a la función hablar con el texto
                    hablar(texto);
                });

                document.getElementById("resultado").innerHTML = `Direcciones encontradas: ${resultadoHTML}`;
            } else {
                document.getElementById("resultado").innerHTML = "No se encontraron resultados para esta calle y altura.";
                hablar("No se encontraron resultados para esta intersección de calles.");
            }
        })
        .catch(function(error) {
            console.error("Error al realizar la solicitud:", error);
            document.getElementById("resultado").innerHTML = "La API no está disponible en este momento. Intenta más tarde.";
            hablar("La API no está disponible en este momento. Intenta más tarde.");
        });
}

// Lista de ciudades
const ciudadesDisponibles = [
    'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata',
    'San Miguel de Tucumán', 'Salta', 'Santa Fe', 'Posadas', 'Neuquén', 'Resistencia',
    'Washington, D.C.', 'Beijing', 'Nueva Delhi', 'Moscú', 'Berlín', 'Londres', 
    'París', 'Brasilia', 'Tokio', 'Ottawa', 'Sídney', 'Ciudad de México', 
    'Roma', 'Madrid', 'Pretoria', 'Seúl', 'Riad', 
    'Yakarta', 'Ankara', 'El Cairo', 'Islamabad', 'Daca', 
    'Abuja', 'Hanói', 'Manila', 'Varsovia', 'Kiev', 'Bogotá', 
    'Santiago', 'Lima', 'Teherán', 'Bangkok', 'Jartum', 'Jerusalén', 'Kuala Lumpur', 
    'Bagdad', 'Kabul', 'Nairobi', 'Katmandú', 'Astaná', 'Tashkent', 
    'Chisináu', 'Bucarest', 'Budapest', 'Minsk', 'Berna', 'Estocolmo', 
    'Oslo', 'Copenhague', 'Helsinki', 'Accra', 'Amán', 
    'Harare', 'Banjul', 'Juba', 'Yuba', 'Ginebra', 
    'Lagos', 'Tegucigalpa', 'Addis Abeba', 'Quito', 'Caracas', 'Marrakech', 'Bratislava', 'Damasco', 
    'Beirut', 'Kinshasa', 'Rabat', 'Mogadiscio', 'Luanda', 'Maputo', 'Ulaanbaatar', 
    'Antananarivo', 'Yamoussoukro', 'Ouagadougou', 'Lomé', 'Malabo', 'Mombasa', 'Belgrado', 'Viena', 
    'Dublín', 'Asunción', 'Guatemala', 'Algiers', 'Amman', 'Addis Ababa', 'Almaty', 'Andorra la Vella', 
    'Apia', 'Athens', 'Baku', 'Bangui', 'Basseterre', 'Bissau', 'Bucharest', 
    'Cairo', 'Canberra', 'Castries', 'Colombo', 'Conakry', 'Copenhagen', 'Dhaka', 'Dili', 'Djibouti', 
    'Dodoma', 'Durban', 'Hong Kong'
];

// Función para mostrar las ciudades en el dropdown
function mostrarCiudades() {
    let input = document.getElementById('ubicacion').value.trim();
    let dropdown = document.getElementById('myDropdown');
    
    // Limpiar el contenido previo
    dropdown.innerHTML = '';
    
    // Mostrar el dropdown solo si el campo tiene texto
    if (input !== '') {
        let opciones = ciudadesDisponibles.filter(ciudad => ciudad.toLowerCase().includes(input.toLowerCase()));
        
        // Si hay opciones, mostrar el dropdown
        if (opciones.length > 0) {
            dropdown.style.display = 'block';
            
            // Crear las opciones del dropdown
            opciones.forEach(function(ciudad) {
                let option = document.createElement('a');
                option.textContent = ciudad;
                option.href = '#'; // No tiene que llevar a ningún lado
                option.onclick = function() {
                    document.getElementById('ubicacion').value = ciudad; // Rellenar el campo con la ciudad seleccionada
                    dropdown.style.display = 'none'; // Ocultar el dropdown
                    buscarClima(); // Llamar a la función de búsqueda del clima
                };
                dropdown.appendChild(option);
            });
        } else {
            dropdown.style.display = 'none'; // Si no hay resultados, ocultar el dropdown
        }
    } else {
        dropdown.style.display = 'none'; // Si no hay texto, ocultar el dropdown
    }
}


// Variable global para controlar la síntesis de voz
let sintetizador = window.speechSynthesis;
let mensajeActual = null; // Para almacenar el mensaje en uso
let muteado = false; // Para controlar el estado de mute

// Función para hablar (Play)
function hablar(texto) {
    if (muteado) return; // No hablar si está muteado

    // Si hay un mensaje en curso, detenerlo antes de iniciar otro
    if (mensajeActual) {
        sintetizador.cancel();
    }

    // Crear un nuevo mensaje
    mensajeActual = new SpeechSynthesisUtterance(texto);
    mensajeActual.lang = "es-ES"; // Establece el idioma a español

    // Evento para limpiar el mensaje una vez terminado
    mensajeActual.onend = function () {
        mensajeActual = null;
    };

    sintetizador.speak(mensajeActual);
}

// Función para manejar el mute/unmute con el checkbox
document.getElementById("checkboxInput").addEventListener("change", function() {
    muteado = this.checked; // Cambiar el estado de mute según si el checkbox está marcado

    if (muteado) {
        // Si está muteado, cancelamos cualquier síntesis de voz en curso
        if (sintetizador.speaking) {
            sintetizador.cancel(); // Detener la síntesis de voz
        }
    }
});


// Función para pausar
function pausar() {
    if (sintetizador.speaking && !sintetizador.paused) {
        sintetizador.pause();
    }
}

// Función para reanudar
function reanudar() {
    if (sintetizador.paused) {
        sintetizador.resume();
    }
}

// Función para detener
function detener() {
    sintetizador.cancel();
    mensajeActual = null; // Limpia el mensaje actual
}

document.getElementById("pauseButton").addEventListener("click", pausar);
document.getElementById("playButton").addEventListener("click", reanudar);

// Detener cualquier síntesis de voz al recargar la página
window.onload = function() {
    if (sintetizador.speaking) {
        sintetizador.cancel(); // Detener cualquier mensaje en curso al cargar la página
    }
};
