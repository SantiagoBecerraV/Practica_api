const BASE_URL = 'https://corsproxy.io/?https://api.football-data.org/v4'
const API_KEY = '2c68a335e5814919bc42add322a7bfbf'


async function consumirAPI(endpoint) {
  try {
    const respuesta = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'X-Auth-Token': API_KEY
      }
    })

    const datos = await respuesta.json()

    if (!respuesta.ok) {
      throw new Error(datos.message || 'Error al consultar la API.')
    }

    return datos

  } catch (error) {
    alert(error.message)
  }
}


async function mostrarTabla() {
  const endpoint = '/competitions/PL/standings'
  const datos = await consumirAPI(endpoint)

  if (!datos) return

  mostrarResultadoTabla(datos.standings[0].table)
}


function mostrarSeccionPartidos() {
  const contenido = document.getElementById('contenido')

  contenido.innerHTML = `
    <div class="filtro">
      <input type="number" id="inputJornada" placeholder="Jornada (1-38)" min="1" max="38">
      <button onclick="buscarPartidos()">Buscar</button>
    </div>
    <div id="listaPartidos">
      <p class="mensaje">Escribe una jornada y presiona Buscar</p>
    </div>
  `
}


async function buscarPartidos() {
  const jornada = document.getElementById('inputJornada').value

  if (!jornada) {
    alert('Debes ingresar una jornada.')
    return
  }

  const endpoint = `/competitions/PL/matches?matchday=${jornada}`
  const datos = await consumirAPI(endpoint)

  if (!datos) return

  if (datos.matches.length === 0) {
    alert('No hay partidos para esta jornada.')
    return
  }

  mostrarResultadoPartidos(datos.matches)
}


async function mostrarGoleadores() {
  const endpoint = '/competitions/PL/scorers?limit=20'
  const datos = await consumirAPI(endpoint)

  if (!datos) return

  mostrarResultadoGoleadores(datos.scorers)
}


function mostrarResultadoTabla(tabla) {
  const contenido = document.getElementById('contenido')

  if (tabla.length === 0) {
    contenido.innerHTML = '<p class="mensaje">No hay datos disponibles.</p>'
    return
  }

  contenido.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Equipo</th>
          <th>PJ</th>
          <th>PG</th>
          <th>PE</th>
          <th>PP</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
        ${tabla.map(item => `
          <tr>
            <td>${item.position}</td>
            <td>
              <img src="${item.team.crest}" alt="${item.team.name}">
              ${item.team.name}
            </td>
            <td>${item.playedGames}</td>
            <td>${item.won}</td>
            <td>${item.draw}</td>
            <td>${item.lost}</td>
            <td><strong>${item.points}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}


function mostrarResultadoPartidos(partidos) {
  const listaPartidos = document.getElementById('listaPartidos')

  listaPartidos.innerHTML = partidos.map(partido => {
    const local = partido.homeTeam.name
    const visitante = partido.awayTeam.name
    const fecha = new Date(partido.utcDate).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric'
    })

    let marcador = '— vs —'
    if (partido.status === 'FINISHED') {
      marcador = `${partido.score.fullTime.home} - ${partido.score.fullTime.away}`
    } else {
      marcador = new Date(partido.utcDate).toLocaleTimeString('es-CO', {
        hour: '2-digit', minute: '2-digit'
      })
    }

    return `
      <div class="tarjeta-partido">
        <div>
          <div class="equipos">${local} vs ${visitante}</div>
          <div class="fecha">${fecha}</div>
        </div>
        <div class="marcador">${marcador}</div>
      </div>
    `
  }).join('')
}

function mostrarResultadoGoleadores(goleadores) {
  const contenido = document.getElementById('contenido')

  if (goleadores.length === 0) {
    contenido.innerHTML = '<p class="mensaje">No hay goleadores disponibles.</p>'
    return
  }

  contenido.innerHTML = goleadores.map((item, index) => `
    <div class="tarjeta-goleador">
      <div class="posicion-badge">${index + 1}</div>
      <div>
        <div class="nombre">${item.player.name}</div>
        <div class="equipo">${item.team.name}</div>
      </div>
      <div class="goles">${item.goals} ⚽</div>
    </div>
  `).join('')
}