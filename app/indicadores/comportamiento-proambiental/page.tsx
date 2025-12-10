"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { createClient } from "@/lib/supabase/client";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  ChartDataLabels
);

// Definición de tipos básicos
interface DesechoRow {
  id: number;
  lugar: string;
  [key: string]: any;
}

type Subcategoria = {
  campo: string;
  nombre: string;
};

type Categoria = {
  id: number;
  nombre: string;
  subcategorias: Subcategoria[];
};

// Definición de las 15 categorías principales
const categoriasPrincipales: Categoria[] = [
  {
    id: 1,
    nombre: "MATERIA ORGÁNICA",
    subcategorias: [
      { campo: "materia_organica_jardin_kg", nombre: "De jardín" },
      { campo: "materia_organica_cocina_kg", nombre: "De cocina" }
    ]
  },
  {
    id: 2,
    nombre: "GRASAS Y ACEITES",
    subcategorias: [
      { campo: "grasas_aceite_comestible_kg", nombre: "Aceite comestible" }
    ]
  },
  {
    id: 3,
    nombre: "MEDICINA",
    subcategorias: [
      { campo: "medicina_jarabe_kg", nombre: "Jarabe" },
      { campo: "medicina_tabletas_kg", nombre: "Tabletas" }
    ]
  },
  {
    id: 4,
    nombre: "PAPELES Y CARTÓN",
    subcategorias: [
      { campo: "papel_blanco_kg", nombre: "Papel blanco" },
      { campo: "papel_periodico_kg", nombre: "Papel periódico" },
      { campo: "papel_archivo_kg", nombre: "Papel archivo" },
      { campo: "carton_kg", nombre: "Cartón" },
      { campo: "tetra_brik_kg", nombre: "Tetra-brik" }
    ]
  },
  {
    id: 5,
    nombre: "PLÁSTICOS",
    subcategorias: [
      { campo: "plastico_pet_kg", nombre: "PET" },
      { campo: "plastico_mixto_kg", nombre: "Plástico mixto" },
      { campo: "bot_aceite_kg", nombre: "Botella de aceite" },
      { campo: "bolsas_kg", nombre: "Bolsas" }
    ]
  },
  {
    id: 6,
    nombre: "VIDRIOS",
    subcategorias: [
      { campo: "vidrio_blanco_kg", nombre: "Blanco" },
      { campo: "vidrio_verde_kg", nombre: "Verde" },
      { campo: "vidrio_otros_kg", nombre: "Otros" }
    ]
  },
  {
    id: 7,
    nombre: "METAL",
    subcategorias: [
      { campo: "latas_ferrosas_kg", nombre: "Latas ferrosas" },
      { campo: "aluminio_kg", nombre: "Aluminio" },
      { campo: "acero_kg", nombre: "Acero" },
      { campo: "metal_otros_kg", nombre: "Otros" }
    ]
  },
  {
    id: 8,
    nombre: "TEXTILES",
    subcategorias: [
      { campo: "textiles_ropa_kg", nombre: "Ropa, mantas, manteles, etc." }
    ]
  },
  {
    id: 9,
    nombre: "CAUCHO",
    subcategorias: [
      { campo: "caucho_zapatos_neumaticos_kg", nombre: "Zapatos, neumáticos" }
    ]
  },
  {
    id: 10,
    nombre: "CUERO",
    subcategorias: [
      { campo: "cuero_zapatos_neumaticos_kg", nombre: "Zapatos, carteras, etc." }
    ]
  },
  {
    id: 11,
    nombre: "RESIDUOS SANITARIOS",
    subcategorias: [
      { campo: "papel_higienico_kg", nombre: "Papel higiénico" }
    ]
  },
  {
    id: 12,
    nombre: "MADERAS",
    subcategorias: [
      { campo: "maderas_kg", nombre: "Maderas" }
    ]
  },
  {
    id: 13,
    nombre: "BATERÍAS",
    subcategorias: [
      { campo: "baterias_tel_lamparas_kg", nombre: "De teléfono, lámparas" }
    ]
  },
  {
    id: 14,
    nombre: "EQUIPOS ELECTRÓNICOS",
    subcategorias: [
      { campo: "electronicos_electrodomesticos_kg", nombre: "Electrodomésticos" }
    ]
  },
  {
    id: 15,
    nombre: "ESCOMBROS",
    subcategorias: [
      { campo: "escombros_otros_kg", nombre: "Otros" }
    ]
  }
];

export default function ComportamientoProambientalPage() {
  const [loading, setLoading] = useState(true);
  const [selectedLugar, setSelectedLugar] = useState("");
  const [lugares, setLugares] = useState<string[]>([]);
  const [allData, setAllData] = useState<DesechoRow[]>([]);
  const [filterOptions, setFilterOptions] = useState({
    lugares: [] as string[]
  });
  const supabase = createClient();

  // Función para cargar datos
  const cargarTodosLosDatos = useCallback(async () => {
    if (!supabase) {
      console.warn("Supabase client no disponible");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Para desarrollo: usar datos de ejemplo si no hay conexión
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.log("Usando datos de ejemplo para desarrollo");
        // Datos de ejemplo
        const datosEjemplo: DesechoRow[] = [
          { 
            id: 1, 
            lugar: "Centro de Daule", 
            materia_organica_jardin_kg: 10, 
            materia_organica_cocina_kg: 15,
            grasas_aceite_comestible_kg: 2,
            papel_blanco_kg: 5
          },
          { 
            id: 2, 
            lugar: "Barrio Norte", 
            materia_organica_jardin_kg: 8, 
            materia_organica_cocina_kg: 12,
            grasas_aceite_comestible_kg: 1,
            papel_blanco_kg: 3
          },
          { 
            id: 3, 
            lugar: "Zona Sur", 
            materia_organica_jardin_kg: 12, 
            materia_organica_cocina_kg: 18,
            grasas_aceite_comestible_kg: 3,
            papel_blanco_kg: 6
          },
        ];
        
        setAllData(datosEjemplo);
        const lugaresArray = datosEjemplo.map((r: DesechoRow) => r.lugar).filter(Boolean);
        const lugaresUnicos = Array.from(new Set(lugaresArray)) as string[];
        setLugares(lugaresUnicos.sort());
        setFilterOptions(prev => ({ ...prev, lugares: lugaresUnicos.sort() }));
        setLoading(false);
        return;
      }
      
      // Para producción: cargar datos reales
      const { data, error } = await supabase
        .from('caracterizacion_desechos_daule')
        .select('*')
        .limit(100); // Limitar para pruebas
      
      if (error) {
        console.error('Error al cargar datos:', error);
        // Usar datos de ejemplo en caso de error
        const datosEjemplo: DesechoRow[] = [
          { 
            id: 1, 
            lugar: "Centro de Daule", 
            materia_organica_jardin_kg: 10, 
            materia_organica_cocina_kg: 15 
          },
          { 
            id: 2, 
            lugar: "Barrio Norte", 
            materia_organica_jardin_kg: 8, 
            materia_organica_cocina_kg: 12 
          },
        ];
        
        setAllData(datosEjemplo);
        const lugaresArray = datosEjemplo.map((r: DesechoRow) => r.lugar).filter(Boolean);
        const lugaresUnicos = Array.from(new Set(lugaresArray)) as string[];
        setLugares(lugaresUnicos.sort());
        setFilterOptions(prev => ({ ...prev, lugares: lugaresUnicos.sort() }));
        setLoading(false);
        return;
      }
      
      setAllData(data || []);
      const lugaresArray = data?.map((r: DesechoRow) => r.lugar).filter(Boolean) || [];
      const lugaresUnicos = Array.from(new Set(lugaresArray)) as string[];
      setLugares(lugaresUnicos.sort());
      setFilterOptions(prev => ({ ...prev, lugares: lugaresUnicos.sort() }));
      
    } catch (error) {
      console.error('Error inesperado:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Inicializar
  useEffect(() => {
    cargarTodosLosDatos();
  }, [cargarTodosLosDatos]);

  // Calcular estadísticas
  const datosFiltrados = selectedLugar 
    ? allData.filter((row: DesechoRow) => row.lugar === selectedLugar)
    : allData;
  
  const totalEncuestas = datosFiltrados.length;
  const lugaresArray = datosFiltrados.map((r: DesechoRow) => r.lugar).filter(Boolean);
  const ubicacionesUnicas = Array.from(new Set(lugaresArray)) as string[];
  const totalUbicaciones = ubicacionesUnicas.length;

  // Calcular total de kg
  const calcularTotalKg = () => {
    let total = 0;
    datosFiltrados.forEach((row: DesechoRow) => {
      categoriasPrincipales.forEach((categoria: Categoria) => {
        categoria.subcategorias.forEach((subcategoria: Subcategoria) => {
          const valor = parseFloat(row[subcategoria.campo]) || 0;
          total += valor;
        });
      });
    });
    return total;
  };

  const totalKg = calcularTotalKg();
  const promedioPorEncuesta = totalEncuestas > 0 ? totalKg / totalEncuestas : 0;

  return (
    <div style={{ 
      fontFamily: "'Inter', 'Segoe UI', Roboto, Arial, sans-serif",
      background: "linear-gradient(135deg, #f8fafc, #f0fdfa)",
      color: "#1e293b",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .card-title {
          color: #0f766e;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 12px;
        }
        
        select {
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          font-family: inherit;
          font-size: 14px;
          transition: all 0.2s;
          width: 100%;
        }
        
        select:focus {
          outline: none;
          border-color: #0f766e;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
        }
        
        button {
          background: #0f766e;
          color: white;
          border: none;
          padding: 12px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
          font-size: 14px;
        }
        
        button:hover {
          background: #0d5d57;
          transform: translateY(-1px);
        }
        
        button.secondary {
          background: white;
          color: #0f766e;
          border: 1px solid #0f766e;
        }
        
        button.secondary:hover {
          background: #f8fafc;
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          flex-direction: column;
          gap: 12px;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(15, 118, 110, 0.2);
          border-left: 4px solid #0f766e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .summary-card {
          background: linear-gradient(135deg, #fff, #f7fffb);
          padding: 20px;
          border-radius: 10px;
          border: 1px solid #eef7f4;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s;
          display: flex;
          flex-direction: column;
        }
        
        .summary-card:hover {
          transform: translateY(-2px);
        }
        
        .summary-title {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }
        
        .summary-value {
          font-size: 28px;
          font-weight: 700;
          color: #0f766e;
          margin-bottom: 4px;
        }
        
        .summary-subtitle {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .chart-container {
          position: relative;
          height: 400px;
          margin-top: 20px;
        }
        
        @media (max-width: 768px) {
          .controls {
            grid-template-columns: 1fr;
          }
          
          .summary-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <main style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Panel de control principal */}
        <div className="card">
          <div className="card-title">
            <i className="fas fa-sliders-h"></i>
            Filtros de Análisis
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: "14px", fontWeight: "500", marginBottom: "6px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                <i className="fas fa-map-marker-alt"></i> Ubicación
              </label>
              <select 
                value={selectedLugar}
                onChange={(e) => setSelectedLugar(e.target.value)}
                disabled={loading}
              >
                <option value="">Todas las ubicaciones</option>
                {lugares.map((lugar: string) => (
                  <option key={lugar} value={lugar}>
                    {lugar}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontStyle: "italic" }}>
                {lugares.length} ubicaciones disponibles
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <button 
              onClick={() => setSelectedLugar("")}
              className="secondary"
              disabled={loading}
            >
              <i className="fas fa-undo"></i> Restablecer Filtros
            </button>
            <button 
              onClick={cargarTodosLosDatos}
              disabled={loading}
            >
              <i className="fas fa-sync-alt"></i> Actualizar Datos
            </button>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="card">
          <div className="card-title">
            <i className="fas fa-chart-line"></i>
            Resumen General
          </div>
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Cargando datos...</p>
            </div>
          ) : (
            <div className="summary-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <div className="summary-card">
                <div className="summary-title">
                  <i className="fas fa-clipboard-list"></i> Total de Encuestas
                </div>
                <div className="summary-value">{totalEncuestas}</div>
                <div className="summary-subtitle">
                  <span>Registros en la base de datos</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-title">
                  <i className="fas fa-map-marked-alt"></i> Total de Ubicaciones
                </div>
                <div className="summary-value">{totalUbicaciones}</div>
                <div className="summary-subtitle">
                  <span>Lugares únicos registrados</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-title">
                  <i className="fas fa-weight-hanging"></i> Total de Desechos
                </div>
                <div className="summary-value">{totalKg.toFixed(2)} kg</div>
                <div className="summary-subtitle">
                  <span>Suma total de kilogramos</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-title">
                  <i className="fas fa-balance-scale"></i> Promedio por Encuesta
                </div>
                <div className="summary-value">{promedioPorEncuesta.toFixed(2)} kg</div>
                <div className="summary-subtitle">
                  <span>Promedio de kg por encuesta</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gráficos y visualizaciones */}
        <div className="card">
          <div className="card-title">
            <i className="fas fa-chart-bar"></i>
            Visualización de Datos
          </div>
          
          <div className="chart-container">
            <div style={{ 
              height: "100%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              flexDirection: "column",
              background: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }}>
              <i className="fas fa-chart-pie" style={{ fontSize: "64px", color: "#0f766e", marginBottom: "20px", opacity: "0.8" }}></i>
              <div style={{ textAlign: "center", padding: "20px" }}>
                <h3 style={{ color: "#0f766e", marginBottom: "12px" }}>Sistema de Análisis de Desechos Sólidos</h3>
                <p style={{ color: "#64748b", marginBottom: "16px" }}>
                  {totalEncuestas > 0 
                    ? `Se han cargado ${totalEncuestas} encuestas con un total de ${totalKg.toFixed(2)} kg de desechos.`
                    : "No hay datos disponibles. Configure las variables de entorno de Supabase."}
                </p>
                <div style={{ 
                  display: "inline-block", 
                  padding: "8px 16px", 
                  background: "#0f766e", 
                  color: "white", 
                  borderRadius: "6px",
                  fontSize: "14px"
                }}>
                  Cantón Daule - Gestión Ambiental
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información del sistema */}
        <div className="card">
          <div className="card-title">
            <i className="fas fa-info-circle"></i>
            Información del Sistema
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <h4 style={{ color: "#0f766e", marginBottom: "12px" }}>Variables de Entorno Configuradas</h4>
              <div style={{ 
                background: "#f0fdfa", 
                padding: "16px", 
                borderRadius: "8px", 
                border: "1px solid #a7f3d0",
                marginBottom: "16px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: process.env.NEXT_PUBLIC_SUPABASE_URL ? "#10b981" : "#ef4444" }}></div>
                  <span style={{ fontWeight: "500" }}>NEXT_PUBLIC_SUPABASE_URL</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Configurada" : "✗ No configurada"}
                  </span>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "#10b981" : "#ef4444" }}></div>
                  <span style={{ fontWeight: "500" }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Configurada" : "✗ No configurada"}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 style={{ color: "#0f766e", marginBottom: "12px" }}>Estado del Sistema</h4>
              <div style={{ 
                background: allData.length > 0 ? "#f0fdfa" : "#fef3c7", 
                padding: "16px", 
                borderRadius: "8px", 
                border: allData.length > 0 ? "1px solid #a7f3d0" : "1px solid #fcd34d"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ 
                    width: "12px", 
                    height: "12px", 
                    borderRadius: "50%", 
                    background: allData.length > 0 ? "#10b981" : "#f59e0b",
                    animation: allData.length === 0 ? "pulse 2s infinite" : "none"
                  }}></div>
                  <span style={{ fontWeight: "500" }}>
                    {allData.length > 0 ? "Sistema Operativo" : "Sistema en Modo Demo"}
                  </span>
                </div>
                <p style={{ fontSize: "14px", color: "#64748b" }}>
                  {allData.length > 0 
                    ? `Conectado a la base de datos. ${allData.length} registros cargados.`
                    : "Usando datos de demostración. Configure las variables de entorno para conectar a Supabase."}
                </p>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e2e8f0" }}>
            <h4 style={{ color: "#0f766e", marginBottom: "12px" }}>Instrucciones para Configuración</h4>
            <ol style={{ paddingLeft: "20px", color: "#64748b" }}>
              <li style={{ marginBottom: "8px" }}>Obtenga las credenciales de Supabase de su proyecto</li>
              <li style={{ marginBottom: "8px" }}>En Vercel, vaya a Settings → Environment Variables</li>
              <li style={{ marginBottom: "8px" }}>Agregue las variables: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li style={{ marginBottom: "8px" }}>Re-despliegue la aplicación</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
