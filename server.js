// ══════════════════════════════════════════════════════════════
// server.js — Backend Principal COMPLETO
// Quiniela Mundial 2026 — Segunda Fase
// Creado por Mario Vitale
// BRACKET OFICIAL ACTUALIZADO: 28 JUN 2026
// ══════════════════════════════════════════════════════════════

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const path      = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ✅ FIX VERCEL — trust proxy
app.set('trust proxy', 1);

// ══════════════════════════════════════════════════════════════
// MODO LOCAL vs PRODUCCIÓN
// ══════════════════════════════════════════════════════════════
const MODO_LOCAL = !process.env.SUPABASE_URL || process.env.MODO === 'local';
console.log(`\n🔧 Modo: ${MODO_LOCAL ? '🖥️  LOCAL (memoria)' : '☁️  PRODUCCIÓN (Supabase)'}`);

// ══════════════════════════════════════════════════════════════
// BASE DE DATOS EN MEMORIA (MODO LOCAL)
// ══════════════════════════════════════════════════════════════
const DB = {
  participantes: [],
  partidos:      [],
  predicciones:  [],
  awards:        [{ id: 'BALON_ORO', nombre: 'Balón de Oro', puntos: 30, ganador: null }],
  pred_awards:   []
};

// ══════════════════════════════════════════════════════════════
// BRACKET OFICIAL FIFA 2026 — ACTUALIZADO 28 JUN 2026
// DATOS 100% REALES VERIFICADOS
// ══════════════════════════════════════════════════════════════
const BRACKET_DATOS = [

  // ─────────────────────────────────────────────────────────
  // RONDA DE 32 — R32 (Jun 28 – Jul 3)
  // ─────────────────────────────────────────────────────────
  {
    id: 'M73', ronda: 'R32',
    sede: 'SoFi Stadium · Inglewood, CA',
    fecha: '2026-06-28', hora: '15:00',
    local_nombre: 'Sudáfrica',       local_code: 'RSA', local_bandera: '🇿🇦',
    visitante_nombre: 'Canadá',      visitante_code: 'CAN', visitante_bandera: '🇨🇦',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M74', ronda: 'R32',
    sede: 'Gillette Stadium · Foxborough, MA',
    fecha: '2026-06-29', hora: '12:00',
    local_nombre: 'Alemania',        local_code: 'GER', local_bandera: '🇩🇪',
    visitante_nombre: 'Paraguay',    visitante_code: 'PAR', visitante_bandera: '🇵🇾',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M75', ronda: 'R32',
    sede: 'Estadio BBVA · Monterrey, México',
    fecha: '2026-06-29', hora: '15:00',
    local_nombre: 'Países Bajos',    local_code: 'NED', local_bandera: '🇳🇱',
    visitante_nombre: 'Marruecos',   visitante_code: 'MAR', visitante_bandera: '🇲🇦',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M76', ronda: 'R32',
    sede: 'NRG Stadium · Houston, TX',
    fecha: '2026-06-29', hora: '19:00',
    local_nombre: 'Brasil',          local_code: 'BRA', local_bandera: '🇧🇷',
    visitante_nombre: 'Japón',       visitante_code: 'JPN', visitante_bandera: '🇯🇵',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M77', ronda: 'R32',
    sede: 'MetLife Stadium · East Rutherford, NJ',
    fecha: '2026-06-30', hora: '12:00',
    local_nombre: 'Francia',         local_code: 'FRA', local_bandera: '🇫🇷',
    visitante_nombre: 'Suecia',      visitante_code: 'SWE', visitante_bandera: '🇸🇪',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M78', ronda: 'R32',
    sede: 'AT&T Stadium · Arlington, TX',
    fecha: '2026-06-30', hora: '15:00',
    local_nombre: 'Costa de Marfil', local_code: 'CIV', local_bandera: '🇨🇮',
    visitante_nombre: 'Noruega',     visitante_code: 'NOR', visitante_bandera: '🇳🇴',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M79', ronda: 'R32',
    sede: 'Estadio Azteca · Ciudad de México',
    fecha: '2026-06-30', hora: '19:00',
    local_nombre: 'México',          local_code: 'MEX', local_bandera: '🇲🇽',
    visitante_nombre: 'Ecuador',     visitante_code: 'ECU', visitante_bandera: '🇪🇨',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M80', ronda: 'R32',
    sede: 'Mercedes-Benz Stadium · Atlanta, GA',
    fecha: '2026-07-01', hora: '12:00',
    local_nombre: 'Inglaterra',      local_code: 'ENG', local_bandera: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    visitante_nombre: 'DR Congo',    visitante_code: 'COD', visitante_bandera: '🇨🇩',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M81', ronda: 'R32',
    sede: "Levi's Stadium · Santa Clara, CA",
    fecha: '2026-07-01', hora: '15:00',
    local_nombre: 'Estados Unidos',  local_code: 'USA', local_bandera: '🇺🇸',
    visitante_nombre: 'Bosnia-Herzegovina', visitante_code: 'BIH', visitante_bandera: '🇧🇦',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M82', ronda: 'R32',
    sede: 'Lumen Field · Seattle, WA',
    fecha: '2026-07-01', hora: '19:00',
    local_nombre: 'Bélgica',         local_code: 'BEL', local_bandera: '🇧🇪',
    visitante_nombre: 'Senegal',     visitante_code: 'SEN', visitante_bandera: '🇸🇳',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M83', ronda: 'R32',
    sede: 'BMO Field · Toronto, Canadá',
    fecha: '2026-07-02', hora: '12:00',
    local_nombre: 'Portugal',        local_code: 'POR', local_bandera: '🇵🇹',
    visitante_nombre: 'Ghana',       visitante_code: 'GHA', visitante_bandera: '🇬🇭',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M84', ronda: 'R32',
    sede: 'SoFi Stadium · Inglewood, CA',
    fecha: '2026-07-02', hora: '15:00',
    local_nombre: 'España',          local_code: 'ESP', local_bandera: '🇪🇸',
    visitante_nombre: 'Austria',     visitante_code: 'AUT', visitante_bandera: '🇦🇹',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M85', ronda: 'R32',
    sede: 'BC Place · Vancouver, Canadá',
    fecha: '2026-07-02', hora: '19:00',
    local_nombre: 'Suiza',           local_code: 'SUI', local_bandera: '🇨🇭',
    visitante_nombre: 'Argelia',     visitante_code: 'ALG', visitante_bandera: '🇩🇿',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M86', ronda: 'R32',
    sede: 'Hard Rock Stadium · Miami Gardens, FL',
    fecha: '2026-07-03', hora: '12:00',
    local_nombre: 'Argentina',       local_code: 'ARG', local_bandera: '🇦🇷',
    visitante_nombre: 'Cabo Verde',  visitante_code: 'CPV', visitante_bandera: '🇨🇻',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M87', ronda: 'R32',
    sede: 'Arrowhead Stadium · Kansas City, MO',
    fecha: '2026-07-03', hora: '15:00',
    local_nombre: 'Colombia',        local_code: 'COL', local_bandera: '🇨🇴',
    visitante_nombre: 'Croacia',     visitante_code: 'CRO', visitante_bandera: '🇭🇷',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M88', ronda: 'R32',
    sede: 'AT&T Stadium · Arlington, TX',
    fecha: '2026-07-03', hora: '19:00',
    local_nombre: 'Australia',       local_code: 'AUS', local_bandera: '🇦🇺',
    visitante_nombre: 'Egipto',      visitante_code: 'EGY', visitante_bandera: '🇪🇬',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },

  // ─────────────────────────────────────────────────────────
  // RONDA DE 16 — R16 (Jul 4–7)
  // ─────────────────────────────────────────────────────────
  {
    id: 'M89', ronda: 'R16',
    sede: 'Lincoln Financial Field · Philadelphia, PA',
    fecha: '2026-07-04', hora: '15:00',
    local_nombre: 'Ganador M74',     local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M77', visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M90', ronda: 'R16',
    sede: 'NRG Stadium · Houston, TX',
    fecha: '2026-07-04', hora: '19:00',
    local_nombre: 'Ganador M73',     local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M75', visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M91', ronda: 'R16',
    sede: 'MetLife Stadium · East Rutherford, NJ',
    fecha: '2026-07-05', hora: '15:00',
    local_nombre: 'Ganador M76',     local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M78', visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M92', ronda: 'R16',
    sede: 'Estadio Azteca · Ciudad de México',
    fecha: '2026-07-05', hora: '19:00',
    local_nombre: 'Ganador M79',     local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M80', visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M93', ronda: 'R16',
    sede: 'BMO Field · Toronto, Canadá',
    fecha: '2026-07-06', hora: '15:00',
    local_nombre: 'Ganador M83',     local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M84', visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M94', ronda: 'R16',
    sede: "Levi's Stadium · Santa Clara, CA",
    fecha: '2026-07-06', hora: '19:00',
    local_nombre: 'Ganador M81',     local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M82', visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M95', ronda: 'R16',
    sede: 'Hard Rock Stadium · Miami Gardens, FL',
    fecha: '2026-07-07', hora: '15:00',
    local_nombre: 'Ganador M86',     local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M88', visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M96', ronda: 'R16',
    sede: 'BC Place · Vancouver, Canadá',
    fecha: '2026-07-07', hora: '19:00',
    local_nombre: 'Ganador M85',     local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M87', visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },

  // ─────────────────────────────────────────────────────────
  // CUARTOS DE FINAL — QF (Jul 9–11)
  // ─────────────────────────────────────────────────────────
  {
    id: 'M97', ronda: 'QF',
    sede: 'Gillette Stadium · Foxborough, MA',
    fecha: '2026-07-09', hora: '19:00',
    local_nombre: 'Ganador M89',     local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M90', visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M98', ronda: 'QF',
    sede: 'SoFi Stadium · Inglewood, CA',
    fecha: '2026-07-10', hora: '19:00',
    local_nombre: 'Ganador M93',     local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M94', visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M99', ronda: 'QF',
    sede: 'Hard Rock Stadium · Miami Gardens, FL',
    fecha: '2026-07-11', hora: '15:00',
    local_nombre: 'Ganador M91',     local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M92', visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M100', ronda: 'QF',
    sede: 'Arrowhead Stadium · Kansas City, MO',
    fecha: '2026-07-11', hora: '19:00',
    local_nombre: 'Ganador M95',      local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M96',  visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },

  // ─────────────────────────────────────────────────────────
  // SEMIFINALES — SF (Jul 14–15)
  // ─────────────────────────────────────────────────────────
  {
    id: 'M101', ronda: 'SF',
    sede: 'AT&T Stadium · Arlington, TX',
    fecha: '2026-07-14', hora: '19:00',
    local_nombre: 'Ganador M97',      local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M98',  visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },
  {
    id: 'M102', ronda: 'SF',
    sede: 'Mercedes-Benz Stadium · Atlanta, GA',
    fecha: '2026-07-15', hora: '19:00',
    local_nombre: 'Ganador M99',      local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M100', visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },

  // ─────────────────────────────────────────────────────────
  // TERCER PUESTO — 3P (Jul 18)
  // ─────────────────────────────────────────────────────────
  {
    id: 'M103', ronda: '3P',
    sede: 'Hard Rock Stadium · Miami Gardens, FL',
    fecha: '2026-07-18', hora: '15:00',
    local_nombre: 'Perdedor M101',    local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Perdedor M102',visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  },

  // ─────────────────────────────────────────────────────────
  // FINAL — F (Jul 19)
  // ─────────────────────────────────────────────────────────
  {
    id: 'M104', ronda: 'F',
    sede: 'MetLife Stadium · East Rutherford, NJ',
    fecha: '2026-07-19', hora: '15:00',
    local_nombre: 'Ganador M101',     local_code: 'TBD', local_bandera: '🏳️',
    visitante_nombre: 'Ganador M102', visitante_code: 'TBD', visitante_bandera: '🏳️',
    estado: 'PENDIENTE',
    goles_local: null, goles_visitante: null, fue_a_penales: false, ganador_code: null
  }
];

// Cargar bracket en memoria al arrancar
DB.partidos = JSON.parse(JSON.stringify(BRACKET_DATOS));

// ══════════════════════════════════════════════════════════════
// SUPABASE (solo en producción)
// ══════════════════════════════════════════════════════════════
let supabase = null;
if (!MODO_LOCAL) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  console.log('☁️  Supabase conectado');
}

// ══════════════════════════════════════════════════════════════
// ADAPTADOR DE BASE DE DATOS
// ══════════════════════════════════════════════════════════════
const db = {

  async getPartidos(ronda) {
    if (MODO_LOCAL) {
      return ronda ? DB.partidos.filter(p => p.ronda === ronda) : [...DB.partidos];
    }
    let q = supabase.from('partidos_elim').select('*').order('id');
    if (ronda) q = q.eq('ronda', ronda);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async getPartido(id) {
    if (MODO_LOCAL) return DB.partidos.find(p => p.id === id) || null;
    const { data } = await supabase.from('partidos_elim').select('*').eq('id', id).single();
    return data;
  },

  async updatePartido(id, updates) {
    if (MODO_LOCAL) {
      const idx = DB.partidos.findIndex(p => p.id === id);
      if (idx !== -1) DB.partidos[idx] = { ...DB.partidos[idx], ...updates };
      return DB.partidos[idx];
    }
    const { data, error } = await supabase
      .from('partidos_elim').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async getParticipantes() {
    if (MODO_LOCAL) return [...DB.participantes];
    const { data, error } = await supabase
      .from('participantes_elim').select('*').order('fecha_reg', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getParticipante(email) {
    if (MODO_LOCAL) return DB.participantes.find(p => p.email === email) || null;
    const { data } = await supabase
      .from('participantes_elim').select('*').eq('email', email).single();
    return data;
  },

  async getParticipanteById(id) {
    if (MODO_LOCAL) return DB.participantes.find(p => p.id === id) || null;
    const { data } = await supabase
      .from('participantes_elim').select('*').eq('id', id).single();
    return data;
  },

  async addParticipante(data) {
    if (MODO_LOCAL) {
      const nuevo = {
        ...data,
        id: 'P' + Date.now(),
        puntos_total: 0, pts_r32: 0, pts_r16: 0, pts_qf: 0,
        pts_sf: 0, pts_3p: 0, pts_final: 0, pts_award: 0,
        aciertos: 0, fallos: 0, pendientes: 32,
        posicion: null, award_ganado: null,
        fecha_reg: new Date().toISOString()
      };
      DB.participantes.push(nuevo);
      return nuevo;
    }
    const { data: nuevo, error } = await supabase
      .from('participantes_elim').insert(data).select().single();
    if (error) throw error;
    return nuevo;
  },

  async updateParticipante(id, updates) {
    if (MODO_LOCAL) {
      const idx = DB.participantes.findIndex(p => p.id === id);
      if (idx !== -1) DB.participantes[idx] = { ...DB.participantes[idx], ...updates };
      return DB.participantes[idx];
    }
    const { data, error } = await supabase
      .from('participantes_elim').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteParticipante(id) {
    if (MODO_LOCAL) {
      DB.participantes = DB.participantes.filter(p => p.id !== id);
      DB.predicciones  = DB.predicciones.filter(p => p.participante_id !== id);
      DB.pred_awards   = DB.pred_awards.filter(p => p.participante_id !== id);
      return;
    }
    await supabase.from('predicciones_elim').delete().eq('participante_id', id);
    await supabase.from('predicciones_awards').delete().eq('participante_id', id);
    await supabase.from('participantes_elim').delete().eq('id', id);
  },

  async existeEmail(email) {
    if (MODO_LOCAL) return DB.participantes.some(p => p.email === email);
    const { data } = await supabase
      .from('participantes_elim').select('id').eq('email', email).single();
    return !!data;
  },

  async getPrediccionesByParticipante(id) {
    if (MODO_LOCAL) return DB.predicciones.filter(p => p.participante_id === id);
    const { data } = await supabase
      .from('predicciones_elim').select('*').eq('participante_id', id);
    return data || [];
  },

  async getPrediccionesByPartido(id) {
    if (MODO_LOCAL) return DB.predicciones.filter(p => p.partido_id === id);
    const { data } = await supabase
      .from('predicciones_elim').select('*').eq('partido_id', id);
    return data || [];
  },

  async upsertPrediccion(data) {
    if (MODO_LOCAL) {
      const idx = DB.predicciones.findIndex(
        p => p.partido_id === data.partido_id && p.participante_id === data.participante_id
      );
      if (idx !== -1) DB.predicciones[idx] = { ...DB.predicciones[idx], ...data };
      else DB.predicciones.push({ ...data, id: 'PR' + Date.now() });
      return;
    }
    const { error } = await supabase
      .from('predicciones_elim')
      .upsert(data, { onConflict: 'participante_id,partido_id' });
    if (error) throw error;
  },

  async updatePrediccion(id, updates) {
    if (MODO_LOCAL) {
      const idx = DB.predicciones.findIndex(p => p.id === id);
      if (idx !== -1) DB.predicciones[idx] = { ...DB.predicciones[idx], ...updates };
      return;
    }
    await supabase.from('predicciones_elim').update(updates).eq('id', id);
  },

  async getBalonOro() {
    if (MODO_LOCAL) return DB.awards.find(a => a.id === 'BALON_ORO');
    const { data } = await supabase
      .from('awards_elim').select('*').eq('id', 'BALON_ORO').single();
    return data;
  },

  async setBalonOro(ganador) {
    if (MODO_LOCAL) {
      const idx = DB.awards.findIndex(a => a.id === 'BALON_ORO');
      if (idx !== -1) DB.awards[idx].ganador = ganador;
      return;
    }
    await supabase.from('awards_elim').update({ ganador }).eq('id', 'BALON_ORO');
  },

  async getPredAward(participante_id) {
    if (MODO_LOCAL)
      return DB.pred_awards.find(
        p => p.participante_id === participante_id && p.award_id === 'BALON_ORO'
      ) || null;
    const { data } = await supabase
      .from('predicciones_awards').select('*')
      .eq('participante_id', participante_id).eq('award_id', 'BALON_ORO').single();
    return data;
  },

  async getAllPredAwards() {
    if (MODO_LOCAL) return DB.pred_awards.filter(p => p.award_id === 'BALON_ORO');
    const { data } = await supabase
      .from('predicciones_awards').select('*').eq('award_id', 'BALON_ORO');
    return data || [];
  },

  async upsertPredAward(data) {
    if (MODO_LOCAL) {
      const idx = DB.pred_awards.findIndex(
        p => p.participante_id === data.participante_id && p.award_id === data.award_id
      );
      if (idx !== -1) DB.pred_awards[idx] = { ...DB.pred_awards[idx], ...data };
      else DB.pred_awards.push({ ...data, id: 'A' + Date.now() });
      return;
    }
    await supabase
      .from('predicciones_awards')
      .upsert(data, { onConflict: 'participante_id,award_id' });
  },

  async updatePredAward(id, updates) {
    if (MODO_LOCAL) {
      const idx = DB.pred_awards.findIndex(p => p.id === id);
      if (idx !== -1) DB.pred_awards[idx] = { ...DB.pred_awards[idx], ...updates };
      return;
    }
    await supabase.from('predicciones_awards').update(updates).eq('id', id);
  },

  async getRanking() {
    if (MODO_LOCAL) {
      return DB.participantes
        .filter(p => p.confirmado)
        .sort((a, b) => (b.puntos_total || 0) - (a.puntos_total || 0))
        .map((p, i) => ({ ...p, posicion: i + 1 }));
    }
    const { data } = await supabase
      .from('participantes_elim')
      .select('id,nombre,email,pais,puntos_total,aciertos,fallos,pendientes,posicion,pts_r32,pts_r16,pts_qf,pts_sf,pts_3p,pts_final,pts_award,award_ganado')
      .eq('confirmado', true)
      .order('puntos_total', { ascending: false });
    return data || [];
  }
};

// ══════════════════════════════════════════════════════════════
// SISTEMA DE PUNTOS — PROTOCOLO OFICIAL MARIO VITALE
// ══════════════════════════════════════════════════════════════
const PTS = {
  R32:  { ganador: 3,  marcador: 3, penales: 1 },
  R16:  { ganador: 5,  marcador: 3, penales: 1 },
  QF:   { ganador: 8,  marcador: 4, penales: 2 },
  SF:   { ganador: 12, marcador: 5, penales: 2 },
  '3P': { ganador: 8,  marcador: 4, penales: 2 },
  F:    { ganador: 20, marcador: 8, penales: 3 }
};
const PTS_BALON_ORO = 30;

// ══════════════════════════════════════════════════════════════
// MIDDLEWARES
// ══════════════════════════════════════════════════════════════
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIX — Sin caché para HTML (evita 304 en Vercel)
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({
  windowMs:    15 * 60 * 1000,
  max:         500,
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown',
  message:     { ok: false, error: 'Demasiadas solicitudes. Intenta más tarde.' }
});
app.use('/api/', limiter);

// ══════════════════════════════════════════════════════════════
// CREDENCIALES ADMIN
// ══════════════════════════════════════════════════════════════
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'mundial2026';

function authAdmin(req, res, next) {
  const u = req.headers['usuario']  || req.body?.usuario  || '';
  const p = req.headers['password'] || req.body?.password || '';
  if (u === ADMIN_USER && p === ADMIN_PASS) return next();
  res.status(401).json({ ok: false, error: 'No autorizado.' });
}

// ══════════════════════════════════════════════════════════════
// RUTAS
// ══════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    sistema:   'Quiniela Mundial 2026 — Segunda Fase',
    autor:     'Mario Vitale',
    modo:      MODO_LOCAL ? 'local' : 'produccion',
    bracket:   'OFICIAL 28-JUN-2026',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/admin/login', (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password)
    return res.status(400).json({ ok: false, error: 'usuario y password requeridos.' });
  if (usuario === ADMIN_USER && password === ADMIN_PASS)
    return res.json({ ok: true, usuario, mensaje: 'Login exitoso.' });
  res.status(401).json({ ok: false, error: 'Credenciales incorrectas.' });
});

app.get('/api/partidos', async (req, res) => {
  try {
    const partidos = await db.getPartidos(req.query.ronda);
    res.json(partidos);
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get('/api/ranking', async (req, res) => {
  try {
    const ranking  = await db.getRanking();
    const partidos = await db.getPartidos();
    const jugados    = partidos.filter(p => p.estado === 'FINALIZADO').length;
    const pendientes = partidos.length - jugados;
    const liderPts   = ranking[0]?.puntos_total || 0;
    const promedio   = ranking.length
      ? Math.round(ranking.reduce((s, p) => s + (p.puntos_total || 0), 0) / ranking.length) : 0;
    const lider    = ranking[0] || {};
    const desglose = {
      r32:   lider.pts_r32   || 0,
      r16:   lider.pts_r16   || 0,
      qf:    lider.pts_qf    || 0,
      sf:    lider.pts_sf    || 0,
      '3p':  lider.pts_3p    || 0,
      final: lider.pts_final || 0,
      award: lider.pts_award || 0
    };
    res.json({
      ranking,
      stats: { participantes: ranking.length, jugados, pendientes, lider_pts: liderPts, promedio },
      desglose_lider: desglose
    });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get('/api/participante', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ ok: false, error: 'Email requerido.' });
  try {
    const part = await db.getParticipante(email.toLowerCase().trim());
    if (!part)            return res.status(404).json({ ok: false, error: 'Participante no encontrado.' });
    if (!part.confirmado) return res.status(403).json({ ok: false, error: 'Tu pago aún no ha sido confirmado.' });
    const preds    = await db.getPrediccionesByParticipante(part.id);
    const partidos = await db.getPartidos();
    const award    = await db.getPredAward(part.id);
    const predsMap = {};
    preds.forEach(p => {
      predsMap[p.partido_id] = {
        ganador_pred:     p.ganador_pred,
        goles_local_pred: p.goles_local_pred,
        goles_vis_pred:   p.goles_visitante_pred,
        penales_pred:     p.penales_pred,
        puntos:           p.puntos || 0
      };
    });
    const partidosMap = {};
    partidos.forEach(p => { partidosMap[p.id] = p; });
    res.json({
      participante: { ...part, balon_oro: award?.prediccion || part.balon_oro || '' },
      predicciones: predsMap,
      partidos:     partidosMap
    });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/registro', async (req, res) => {
  const { nombre, email, pais, telefono, metodo_pago, balon_oro, balon_oro_pais } = req.body;
  if (!nombre?.trim())    return res.status(400).json({ ok: false, error: 'Nombre requerido.' });
  if (!email?.trim())     return res.status(400).json({ ok: false, error: 'Email requerido.' });
  if (!pais?.trim())      return res.status(400).json({ ok: false, error: 'País requerido.' });
  if (!metodo_pago)       return res.status(400).json({ ok: false, error: 'Método de pago requerido.' });
  if (!balon_oro?.trim()) return res.status(400).json({ ok: false, error: 'Balón de Oro requerido.' });

  // Cierre de registro: 28 Jun 2026 · 14:59 UTC-4
  const CIERRE = new Date('2026-06-28T14:59:00-04:00');
  if (new Date() > CIERRE)
    return res.status(403).json({ ok: false, error: 'El período de registro ha cerrado.' });

  const emailLower = email.toLowerCase().trim();
  try {
    const existe = await db.existeEmail(emailLower);
    if (existe) return res.status(409).json({ ok: false, error: 'Este email ya está registrado.' });
    const nuevo = await db.addParticipante({
      nombre: nombre.trim(), email: emailLower, pais: pais.trim(),
      telefono: telefono?.trim() || null, metodo_pago,
      balon_oro: balon_oro.trim(), balon_oro_pais: balon_oro_pais?.trim() || null,
      confirmado: false
    });
    await db.upsertPredAward({
      participante_id: nuevo.id, award_id: 'BALON_ORO',
      prediccion: balon_oro.trim(), puntos: 0
    });
    res.json({ ok: true, participante_id: nuevo.id });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/prediccion', async (req, res) => {
  const { partido_id, ganador_pred, goles_local_pred, goles_vis_pred, penales_pred, email } = req.body;
  if (!partido_id || !ganador_pred || !email)
    return res.status(400).json({ ok: false, error: 'Datos incompletos.' });
  try {
    const part = await db.getParticipante(email.toLowerCase().trim());
    if (!part)            return res.status(404).json({ ok: false, error: 'Participante no encontrado.' });
    if (!part.confirmado) return res.status(403).json({ ok: false, error: 'Pago no confirmado.' });
    const partido = await db.getPartido(partido_id);
    if (partido?.estado === 'FINALIZADO')
      return res.status(403).json({ ok: false, error: 'El partido ya finalizó.' });
    await db.upsertPrediccion({
      participante_id: part.id, partido_id, ganador_pred,
      goles_local_pred: goles_local_pred ?? null,
      goles_visitante_pred: goles_vis_pred ?? null,
      penales_pred: penales_pred || false,
      puntos: 0, calculado: false,
      fecha_pred: new Date().toISOString()
    });
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

// ── ADMIN ──────────────────────────────────────────────────────

app.get('/api/admin/dashboard', authAdmin, async (req, res) => {
  try {
    const parts    = await db.getParticipantes();
    const partidos = await db.getPartidos();
    res.json({
      total:            parts.length,
      confirmados:      parts.filter(p => p.confirmado).length,
      pendientes_pago:  parts.filter(p => !p.confirmado && !p.rechazado).length,
      jugados:          partidos.filter(p => p.estado === 'FINALIZADO').length,
      predicciones:     0
    });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get('/api/admin/participantes', authAdmin, async (req, res) => {
  try {
    res.json({ participantes: await db.getParticipantes() });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.put('/api/admin/participante/:id', authAdmin, async (req, res) => {
  const { confirmado, rechazado, notas } = req.body;
  try {
    const updates = {};
    if (confirmado !== undefined) {
      updates.confirmado    = confirmado;
      updates.fecha_confirm = confirmado ? new Date().toISOString() : null;
    }
    if (rechazado !== undefined) updates.rechazado = rechazado;
    if (notas     !== undefined) updates.notas     = notas;
    await db.updateParticipante(req.params.id, updates);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.delete('/api/admin/participante/:id', authAdmin, async (req, res) => {
  try {
    await db.deleteParticipante(req.params.id);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.put('/api/admin/partido/:id', authAdmin, async (req, res) => {
  const {
    estado, goles_local, goles_visitante, fue_a_penales, ganador_code,
    local_nombre, visitante_nombre, local_code, visitante_code,
    local_bandera, visitante_bandera, fecha, hora
  } = req.body;
  try {
    const updates = {};
    if (estado            !== undefined) updates.estado            = estado;
    if (goles_local       !== undefined) updates.goles_local       = goles_local;
    if (goles_visitante   !== undefined) updates.goles_visitante   = goles_visitante;
    if (fue_a_penales     !== undefined) updates.fue_a_penales     = fue_a_penales;
    if (ganador_code      !== undefined) updates.ganador_code      = ganador_code;
    if (local_nombre      !== undefined) updates.local_nombre      = local_nombre;
    if (visitante_nombre  !== undefined) updates.visitante_nombre  = visitante_nombre;
    if (local_code        !== undefined) updates.local_code        = local_code;
    if (visitante_code    !== undefined) updates.visitante_code    = visitante_code;
    if (local_bandera     !== undefined) updates.local_bandera     = local_bandera;
    if (visitante_bandera !== undefined) updates.visitante_bandera = visitante_bandera;
    if (fecha             !== undefined) updates.fecha             = fecha;
    if (hora              !== undefined) updates.hora              = hora;
    await db.updatePartido(req.params.id, updates);
    if (estado === 'FINALIZADO') {
      await calcularPuntosPartido(req.params.id);
      await recalcularRanking();
    }
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/admin/poblar-bracket', authAdmin, async (req, res) => {
  try {
    if (MODO_LOCAL) {
      DB.partidos = JSON.parse(JSON.stringify(BRACKET_DATOS));
    } else {
      const { error } = await supabase
        .from('partidos_elim').upsert(BRACKET_DATOS, { onConflict: 'id' });
      if (error) throw error;
    }
    res.json({ ok: true, insertados: BRACKET_DATOS.length, bracket: 'OFICIAL 28-JUN-2026' });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/admin/init', authAdmin, async (req, res) => {
  try {
    if (MODO_LOCAL) {
      DB.partidos = JSON.parse(JSON.stringify(BRACKET_DATOS));
      return res.json({ ok: true, msg: 'Bracket oficial cargado en memoria', total: BRACKET_DATOS.length });
    }
    const { error: e1 } = await supabase
      .from('partidos_elim').upsert(BRACKET_DATOS, { onConflict: 'id' });
    if (e1) throw e1;
    const { error: e2 } = await supabase
      .from('awards_elim')
      .upsert([{ id: 'BALON_ORO', nombre: 'Balón de Oro', puntos: 30, ganador: null }],
              { onConflict: 'id' });
    if (e2) throw e2;
    res.json({ ok: true, msg: 'Supabase inicializado con bracket oficial', partidos: BRACKET_DATOS.length });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/admin/recalcular', authAdmin, async (req, res) => {
  try {
    const partidos = await db.getPartidos();
    let procesados = 0;
    for (const p of partidos.filter(x => x.estado === 'FINALIZADO'))
      procesados += await calcularPuntosPartido(p.id);
    await recalcularRanking();
    res.json({ ok: true, procesados });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/admin/recalcular/:id', authAdmin, async (req, res) => {
  try {
    const procesados = await calcularPuntosPartido(req.params.id);
    await recalcularRanking();
    res.json({ ok: true, procesados });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/admin/balon-oro', authAdmin, async (req, res) => {
  const { ganador } = req.body;
  if (!ganador) return res.status(400).json({ ok: false, error: 'Nombre requerido.' });
  try {
    await db.setBalonOro(ganador);
    const preds = await db.getAllPredAwards();
    for (const pred of preds) {
      const acerto = pred.prediccion?.toLowerCase().trim() === ganador.toLowerCase().trim();
      await db.updatePredAward(pred.id, { acerto, puntos: acerto ? PTS_BALON_ORO : 0 });
      await db.updateParticipante(pred.participante_id, {
        pts_award: acerto ? PTS_BALON_ORO : 0, award_ganado: acerto
      });
    }
    await recalcularRanking();
    res.json({ ok: true, ganador });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/admin/ranking/actualizar', authAdmin, async (req, res) => {
  try {
    await recalcularRanking();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get('/api/pdf/:tipo', async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quiniela-${req.params.tipo}-${Date.now()}.pdf"`);
    doc.pipe(res);
    doc.fontSize(20).text('⚽ Quiniela Mundial 2026 — Segunda Fase', { align: 'center' });
    doc.fontSize(12).text('Creado por Mario Vitale', { align: 'center' });
    doc.moveDown();
    if (req.params.tipo === 'ranking') {
      const ranking = await db.getRanking();
      doc.fontSize(16).text('🏆 RANKING GENERAL', { underline: true }).moveDown(0.5);
      ranking.forEach((p, i) =>
        doc.fontSize(11).text(`${i+1}. ${p.nombre} (${p.pais}) — ${p.puntos_total||0} pts`)
      );
    } else if (req.params.tipo === 'bracket') {
      const partidos = await db.getPartidos();
      const rondas   = ['R32','R16','QF','SF','3P','F'];
      const nombres  = { R32:'Ronda de 32', R16:'Octavos', QF:'Cuartos', SF:'Semis', '3P':'3er Puesto', F:'FINAL' };
      for (const r of rondas) {
        const ps = partidos.filter(p => p.ronda === r);
        if (!ps.length) continue;
        doc.moveDown().fontSize(14).text(`── ${nombres[r]} ──`, { underline: true });
        ps.forEach(p => {
          const score = p.estado === 'FINALIZADO' ? `${p.goles_local}-${p.goles_visitante}` : 'vs';
          doc.fontSize(10).text(`  ${p.id}: ${p.local_nombre} ${score} ${p.visitante_nombre} | ${p.sede}`);
        });
      }
    }
    doc.end();
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/admin/emails/masivo', authAdmin, async (req, res) => {
  res.json({ ok: true, enviados: 0, errores: 0, mensaje: 'Email configurar en producción.' });
});

// ══════════════════════════════════════════════════════════════
// MOTOR DE CÁLCULO DE PUNTOS
// ══════════════════════════════════════════════════════════════
async function calcularPuntosPartido(partidoId) {
  const partido = await db.getPartido(partidoId);
  if (!partido || partido.estado !== 'FINALIZADO') return 0;
  const ptsRonda = PTS[partido.ronda] || PTS['R32'];
  const preds    = await db.getPrediccionesByPartido(partidoId);
  let procesados = 0;

  for (const pred of preds) {
    let pts = 0;

    // ✅ Puntos por acertar el ganador
    if (pred.ganador_pred === partido.ganador_code) {
      pts += ptsRonda.ganador;

      // ✅ Puntos extra por marcador exacto
      if (
        pred.goles_local_pred     === partido.goles_local &&
        pred.goles_visitante_pred === partido.goles_visitante
      ) {
        pts += ptsRonda.marcador;
      }

      // ✅ Puntos extra por predecir penales correctamente
      if (partido.fue_a_penales && pred.penales_pred) {
        pts += ptsRonda.penales;
      }
    }

    await db.updatePrediccion(pred.id, { puntos: pts, calculado: true });
    procesados++;
  }

  return procesados;
}

// ══════════════════════════════════════════════════════════════
// RECALCULAR RANKING COMPLETO
// ══════════════════════════════════════════════════════════════
async function recalcularRanking() {
  const parts       = await db.getParticipantes();
  const confirmados = parts.filter(p => p.confirmado);

  for (const part of confirmados) {
    const preds    = await db.getPrediccionesByParticipante(part.id);
    const partidos = await db.getPartidos();
    const award    = await db.getPredAward(part.id);

    const porRonda = { R32: 0, R16: 0, QF: 0, SF: 0, '3P': 0, F: 0 };
    let aciertos = 0, fallos = 0, pendientes = 0;

    for (const pred of preds) {
      const partido = partidos.find(p => p.id === pred.partido_id);
      const ronda   = partido?.ronda || 'R32';
      const pts     = pred.puntos || 0;

      porRonda[ronda] = (porRonda[ronda] || 0) + pts;

      if (pred.calculado && pts > 0) aciertos++;
      else if (pred.calculado)       fallos++;
      else                           pendientes++;
    }

    const ptsAward = award?.puntos || 0;
    const total    = Object.values(porRonda).reduce((s, v) => s + v, 0) + ptsAward;

    await db.updateParticipante(part.id, {
      puntos_total: total,
      pts_r32:      porRonda['R32'],
      pts_r16:      porRonda['R16'],
      pts_qf:       porRonda['QF'],
      pts_sf:       porRonda['SF'],
      pts_3p:       porRonda['3P'],
      pts_final:    porRonda['F'],
      pts_award:    ptsAward,
      aciertos,
      fallos,
      pendientes
    });
  }

  // ✅ Asignar posiciones ordenadas por puntos
  const ranking = (await db.getParticipantes())
    .filter(p => p.confirmado)
    .sort((a, b) => (b.puntos_total || 0) - (a.puntos_total || 0));

  for (let i = 0; i < ranking.length; i++) {
    await db.updateParticipante(ranking[i].id, { posicion: i + 1 });
  }
}

// ══════════════════════════════════════════════════════════════
// 404 + ERROR HANDLER
// ══════════════════════════════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Ruta no encontrada.' });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
});

// ══════════════════════════════════════════════════════════════
// ARRANQUE — Compatible Vercel + Node tradicional
// ══════════════════════════════════════════════════════════════
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('\n══════════════════════════════════════════════════════');
    console.log('  ⚽  QUINIELA MUNDIAL 2026 — SEGUNDA FASE');
    console.log('  👤  Creado por Mario Vitale');
    console.log(`  🚀  Puerto  : ${PORT}`);
    console.log(`  🔧  Modo    : ${MODO_LOCAL ? 'LOCAL (memoria)' : 'PRODUCCIÓN (Supabase)'}`);
    console.log('  📋  Bracket : OFICIAL 28-JUN-2026 ✅');
    console.log('  🏟️  R32     : M73–M88 con equipos reales');
    console.log('══════════════════════════════════════════════════════\n');
  });
}

// ✅ EXPORT PARA VERCEL
module.exports = app;

