"use client";

import { useEffect, useState, useCallback } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, ChartData } from "chart.js";
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

// Definición de tipos
type DesechoRow = {
  id: number;
  lugar: string;
  [key: string]: any;
};

type Subcategoria = {
  campo: string;
  nombre: string;
};

type Categoria = {
  id: number;
  nombre: string;
  subcategorias: Subcategoria[];
};

type DetalleCategoria = {
  categoria: string;
  total: number;
  subcategorias: Array<{
    nombre: string;
    valor: number;
  }>;
};

type ResumenCategorias = {
  categorias: string[];
  valores: number[];
  totalSum: number;
  detalles: DetalleCategoria[];
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

// Mapeo de nombres abreviados para gráficos
const nombresCortos: Record<string, string> = {
  "MATERIA ORGÁNICA": "Materia Orgánica",
  "GRASAS Y ACEITES": "Grasas/Aceites",
  "MEDICINA": "Medicina",
  "PAPELES Y CARTÓN": "Papel/Cartón",
  "PLÁSTICOS": "Plásticos",
  "VIDRIOS": "Vidrios",
  "METAL": "Metal",
  "TEXTILES": "Textiles",
  "CAUCHO": "Caucho",
  "CUERO": "Cuero",
  "RESIDUOS SANITARIOS": "Residuos Sanitarios",
  "MADERAS": "Maderas",
  "BATERÍAS": "Baterías",
  "EQUIPOS ELECTRÓNICOS": "Equipos Electrónicos",
  "ESCOMBROS": "Escombros"
};

export default function ComportamientoProambientalPage() {
  // Estados
  const [allData, setAllData] = useState<DesechoRow[]>([]);
  const [currentData, setCurrentData] = useState<DesechoRow[]>([]);
  const [filterOptions, setFilterOptions] = useState({
    lugares: [] as string[]
  });
  const [selectedLugar, setSelectedLugar] = useState("");
  const [currentChartType, setCurrentChartType] = useState<"bar" | "pie" | "line">("bar");
  const [resumenCategorias, setResumenCategorias] = useState<ResumenCategorias>({
    categorias: [],
    valores: [],
    totalSum: 0,
    detalles: []
  });
  const [loading, setLoading] = useState(true);
  const [chartInstance, setChartInstance] = useState<ChartJS | null>(null);

  // Inicializar Supabase client
  const supabase = createClient();

  // Función para cargar todos los datos
  const cargarTodosLosDatos = useCallback(async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('caracterizacion_desechos_daule')
        .select('*');
      
      if (error) {
        console.error('Error al cargar datos:', error);
        return;
      }
      
      setAllData(data || []);
      setCurrentData(data || []);
      
      // Extraer ubicaciones únicas
      const lugaresUnicos = [...new Set(data?.map(r => r.lugar).filter(Boolean))] as string[];
      setFilterOptions(prev => ({ ...prev, lugares: lugaresUnicos.sort() }));
      
    } catch (error) {
      console.error('Error inesperado:', error);
    }
  }, [supabase]);

  // Calcular resumen por categorías
  const calcularResumenPorCategorias = useCallback((rows: DesechoRow[]): ResumenCategorias => {
    if (!rows || rows.length === 0) {
      return {
        categorias: [],
        valores: [],
        totalSum: 0,
        detalles: []
      };
    }
    
    const valoresPorCategoria = Array(categoriasPrincipales.length).fill(0);
    const detallesPorCategoria: DetalleCategoria[] = [];
    
    // Calcular totales por categoría
    rows.forEach(row => {
      categoriasPrincipales.forEach((categoria, idx) => {
        categoria.subcategorias.forEach(subcategoria => {
          const valor = parseFloat(row[subcategoria.campo]) || 0;
          valoresPorCategoria[idx] += valor;
        });
      });
    });
    
    // Preparar detalles para la tabla
    categoriasPrincipales.forEach((categoria, idx) => {
      const totalCategoria = valoresPorCategoria[idx];
      
      // Calcular subtotales por subcategoría
      const subcategoriasConValores = categoria.subcategorias.map(subcategoria => {
        let subtotal = 0;
        rows.forEach(row => {
          subtotal += parseFloat(row[subcategoria.campo]) || 0;
        });
        return {
          nombre: subcategoria.nombre,
          valor: subtotal
        };
      }).filter(sub => sub.valor > 0);
      
      if (totalCategoria > 0 || subcategoriasConValores.length > 0) {
        detallesPorCategoria.push({
          categoria: categoria.nombre,
          total: totalCategoria,
          subcategorias: subcategoriasConValores
        });
      }
    });
    
    const totalSum = valoresPorCategoria.reduce((a, b) => a + b, 0);
    
    // Filtrar categorías con valores > 0 y usar nombres cortos para gráficos
    const categoriasConValores: string[] = [];
    const valoresFiltrados: number[] = [];
    
    detallesPorCategoria.forEach((detalle) => {
      if (detalle.total > 0) {
        categoriasConValores.push(nombresCortos[detalle.categoria] || detalle.categoria);
        valoresFiltrados.push(detalle.total);
      }
    });
    
    return {
      categorias: categoriasConValores,
      valores: valoresFiltrados,
      totalSum: totalSum,
      detalles: detallesPorCategoria
    };
  }, []);

  // Calcular intervalo dinámico
  const calcularIntervaloDinamico = (maxValue: number) => {
    if (maxValue === 0) return { max: 10, stepSize: 2 };
    
    let yAxisMax: number;
    
    if (maxValue < 5) {
      yAxisMax = Math.ceil(maxValue * 1.5);
    } else if (maxValue < 20) {
      yAxisMax = Math.ceil(maxValue * 1.3);
    } else if (maxValue < 100) {
      yAxisMax = Math.ceil(maxValue * 1.2);
    } else if (maxValue < 500) {
      yAxisMax = Math.ceil(maxValue * 1.15);
    } else {
      yAxisMax = Math.ceil(maxValue * 1.1);
    }
    
    const rangos = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
    let intervalo = 1;
    
    for (let i = 0; i < rangos.length; i++) {
      if (yAxisMax / rangos[i] <= 15) {
        intervalo = rangos[i];
        break;
      }
    }
    
    yAxisMax = Math.ceil(yAxisMax / intervalo) * intervalo;
    
    if (yAxisMax <= maxValue) {
      yAxisMax = maxValue + intervalo;
    }
    
    return { max: yAxisMax, stepSize: intervalo };
  };

  // Convertir HEX a RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Renderizar gráfico
  const renderChart = useCallback((labels: string[], values: number[], chartType: "bar" | "pie" | "line") => {
    // Destruir gráfico anterior si existe
    if (chartInstance) {
      chartInstance.destroy();
    }

    const canvas = document.getElementById('mainChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calcular porcentajes
    const totalSum = values.reduce((a, b) => a + b, 0);
    const percentages = values.map(v => totalSum > 0 ? ((v / totalSum) * 100) : 0);
    const percentageLabels = percentages.map(p => p.toFixed(1) + '%');
    
    // Calcular intervalo dinámico
    const maxValue = Math.max(...values, 0);
    const { max: yAxisMax, stepSize } = calcularIntervaloDinamico(maxValue);
    
    // Colores
    const colors = [
      '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#a855f7', '#6366f1',
      '#14b8a6', '#f43f5e', '#8b5cf6'
    ].slice(0, labels.length);
    
    // Configuración base
    const baseConfig = {
      data: {
        labels: labels,
        datasets: [{
          label: 'Peso (kg)',
          data: values,
          backgroundColor: chartType === 'line' ? '#0f766e' : colors,
          borderColor: chartType === 'line' ? '#0f766e' : colors.map(c => c.replace(')', ', 0.8)').replace('rgb', 'rgba')),
          borderWidth: chartType === 'line' ? 3 : 1,
          pointBackgroundColor: colors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: chartType === 'line' ? 6 : 0,
          pointHoverRadius: chartType === 'line' ? 8 : 0,
          fill: chartType === 'line' ? {
            target: 'origin',
            above: 'rgba(15, 118, 110, 0.1)'
          } as const : undefined,
          tension: chartType === 'line' ? 0.4 : 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: chartType === 'pie',
            position: 'right' as const,
            labels: {
              font: {
                size: 11
              }
            }
          },
          title: {
            display: true,
            text: `Distribución de Desechos Sólidos por Categoría - ${chartType === 'bar' ? 'Gráfico de Barras' : chartType === 'pie' ? 'Gráfico Circular' : 'Gráfico de Líneas'}`,
            font: {
              size: 16,
              weight: 'bold' as const
            },
            padding: 20
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                const value = context.parsed !== undefined ? context.parsed : context.raw;
                label += value.toFixed(2) + ' kg';
                const percentage = totalSum > 0 ? (value / totalSum * 100).toFixed(1) : 0;
                label += ` (${percentage}%)`;
                return label;
              }
            }
          }
        }
      }
    };

    // Configuración específica por tipo
    const typeSpecificConfigs = {
      bar: {
        scales: {
          y: {
            beginAtZero: true,
            max: yAxisMax,
            title: {
              display: true,
              text: 'Peso (kg)',
              font: { size: 14, weight: 'bold' as const },
              padding: { top: 20, bottom: 10 }
            },
            ticks: {
              callback: function(value: number) {
                return Number.isInteger(value) ? value.toString() : value.toFixed(1);
              },
              padding: 20,
              stepSize: stepSize,
              maxTicksLimit: 15,
              font: { size: 12 }
            },
            grid: { drawBorder: false }
          },
          x: {
            title: {
              display: true,
              text: 'Categorías de Desechos',
              font: { size: 14, weight: 'bold' as const },
              padding: { top: 10, bottom: 20 }
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              padding: 10,
              font: { size: 11 },
              autoSkip: true,
              maxTicksLimit: 15
            },
            grid: { display: false }
          }
        },
        barPercentage: 0.7,
        categoryPercentage: 0.8,
        plugins: {
          datalabels: {
            display: true,
            color: '#1e293b',
            font: { weight: 'bold', size: 12 },
            formatter: function(value: number, context: any) {
              return percentageLabels[context.dataIndex];
            },
            anchor: 'end' as const,
            align: 'top' as const,
            offset: 15,
            clamp: true
          }
        }
      },
      line: {
        scales: {
          y: {
            beginAtZero: true,
            max: yAxisMax,
            title: {
              display: true,
              text: 'Peso (kg)',
              font: { size: 14, weight: 'bold' as const },
              padding: { top: 20, bottom: 10 }
            },
            ticks: {
              callback: function(value: number) {
                return Number.isInteger(value) ? value.toString() : value.toFixed(1);
              },
              padding: 20,
              stepSize: stepSize,
              maxTicksLimit: 15,
              font: { size: 12 }
            },
            grid: { drawBorder: false }
          },
          x: {
            title: {
              display: true,
              text: 'Categorías de Desechos',
              font: { size: 14, weight: 'bold' as const },
              padding: { top: 10, bottom: 20 }
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              padding: 10,
              font: { size: 11 },
              autoSkip: true,
              maxTicksLimit: 15
            },
            grid: { display: false }
          }
        },
        plugins: {
          datalabels: {
            display: true,
            color: '#1e293b',
            font: { weight: 'bold', size: 12 },
            formatter: function(value: number, context: any) {
              return percentageLabels[context.dataIndex];
            },
            anchor: 'center' as const,
            align: 'top' as const,
            offset: 20,
            clamp: true
          }
        }
      },
      pie: {
        elements: {
          arc: {
            borderWidth: 1.5,
            borderColor: '#ffffff',
            hoverBorderWidth: 2.5,
            hoverBorderColor: '#ffffff'
          }
        },
        plugins: {
          datalabels: {
            display: true,
            color: function(context: any) {
              const backgroundColor = context.dataset.backgroundColor[context.dataIndex];
              const rgb = hexToRgb(backgroundColor);
              const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
              return brightness > 128 ? '#1e293b' : '#ffffff';
            },
            font: { weight: 'bold', size: 12 },
            formatter: function(value: number, context: any) {
              const percentage = percentages[context.dataIndex];
              if (percentage > 3) {
                return percentageLabels[context.dataIndex];
              }
              return '';
            },
            anchor: 'center' as const,
            align: 'center' as const,
            offset: 0,
            textAlign: 'center' as const
          }
        }
      }
    };

    // Combinar configuración
    const finalConfig: any = {
      type: chartType,
      data: baseConfig.data,
      options: {
        ...baseConfig.options,
        ...(typeSpecificConfigs[chartType] || {}),
        layout: {
          padding: {
            top: chartType === 'pie' ? 20 : 50,
            bottom: chartType === 'pie' ? 20 : 70,
            left: chartType === 'pie' ? 10 : 30,
            right: chartType === 'pie' ? 10 : 30
          }
        }
      },
      plugins: [ChartDataLabels]
    };

    const newChart = new ChartJS(ctx, finalConfig);
    setChartInstance(newChart);
  }, [chartInstance]);

  // Actualizar datos según filtros
  const actualizarDatos = useCallback(() => {
    if (!allData.length) return;

    let filteredData = allData;
    
    if (selectedLugar) {
      filteredData = allData.filter(row => row.lugar === selectedLugar);
    }
    
    setCurrentData(filteredData);
    const resumen = calcularResumenPorCategorias(filteredData);
    setResumenCategorias(resumen);
    
    // Renderizar gráfico después de un pequeño delay para asegurar que el canvas esté listo
    setTimeout(() => {
      if (resumen.categorias.length > 0) {
        renderChart(resumen.categorias, resumen.valores, currentChartType);
      }
    }, 100);
    
    setLoading(false);
  }, [allData, selectedLugar, calcularResumenPorCategorias, renderChart, currentChartType]);

  // Resetear filtros
  const resetFilters = () => {
    setSelectedLugar("");
  };

  // Cambiar tipo de gráfico
  const changeChartType = (type: "bar" | "pie" | "line") => {
    setCurrentChartType(type);
    if (resumenCategorias.categorias.length > 0) {
      renderChart(resumenCategorias.categorias, resumenCategorias.valores, type);
    }
  };

  // Inicializar
  useEffect(() => {
    const initApp = async () => {
      await cargarTodosLosDatos();
    };
    
    initApp();
  }, [cargarTodosLosDatos]);

  // Actualizar cuando cambian los filtros
  useEffect(() => {
    actualizarDatos();
  }, [actualizarDatos]);

  // Calcular estadísticas
  const ubicacionesUnicas = [...new Set(currentData.map(r => r.lugar).filter(Boolean))];
  const totalEncuestas = currentData.length;
  const totalUbicaciones = ubicacionesUnicas.length;
  const totalKg = resumenCategorias.totalSum;
  const promedioPorEncuesta = totalEncuestas > 0 ? totalKg / totalEncuestas : 0;

  // Variables CSS inline
  const styles = {
    root: {
      '--primary': '#0f766e',
      '--primary-light': '#14b8a6',
      '--primary-dark': '#0d5d57',
      '--secondary': '#2d4cc8',
      '--accent': '#7c3aed',
      '--bg1': '#f8fafc',
      '--bg2': '#f0fdfa',
      '--card': '#ffffff',
      '--muted': '#64748b',
      '--success': '#10b981',
      '--warning': '#f59e0b',
      '--danger': '#ef4444',
      '--border': '#e2e8f0',
      '--shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      '--radius': '12px',
    } as React.CSSProperties
  };

  return (
    <div style={styles}>
      <style jsx>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Inter', 'Segoe UI', Roboto, Arial, sans-serif;
          background: linear-gradient(135deg, var(--bg1), var(--bg2));
          color: #1e293b;
          line-height: 1.6;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          padding: 20px;
        }
        
        main {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .card {
          background: var(--card);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
          margin-bottom: 24px;
          border: 1px solid var(--border);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .card-title {
          color: var(--primary);
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }
        
        .controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .control-group {
          display: flex;
          flex-direction: column;
        }
        
        .control-group label {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 6px;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .filter-info {
          font-size: 11px;
          color: var(--muted);
          margin-top: 4px;
          font-style: italic;
        }
        
        select {
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: white;
          font-family: inherit;
          font-size: 14px;
          transition: all 0.2s;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230f766e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          appearance: none;
          padding-right: 40px;
        }
        
        select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
        }
        
        button {
          background: var(--primary);
          color: white;
          border: none;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 14px;
        }
        
        button:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }
        
        button.secondary {
          background: white;
          color: var(--primary);
          border: 1px solid var(--primary);
        }
        
        button.secondary:hover {
          background: var(--bg1);
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }
        
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
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
          color: var(--muted);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }
        
        .summary-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 4px;
        }
        
        .summary-subtitle {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .positive {
          color: var(--success);
        }
        
        .negative {
          color: var(--danger);
        }
        
        .chart-container {
          position: relative;
          height: 550px;
          margin-top: 20px;
        }
        
        .chart-container-sm {
          position: relative;
          height: 350px;
          margin-top: 20px;
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        
        .tab {
          padding: 12px 20px;
          cursor: pointer;
          font-weight: 500;
          color: var(--muted);
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        
        .tab.active {
          color: var(--primary);
          border-bottom: 2px solid var(--primary);
        }
        
        .tab-content {
          display: none;
        }
        
        .tab-content.active {
          display: block;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }
        
        th, td {
          padding: 14px 12px;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        
        th {
          font-weight: 600;
          color: var(--muted);
          font-size: 14px;
          background-color: #f8fafc;
        }
        
        tr:hover {
          background-color: #f8fafc;
        }
        
        .total-row {
          background-color: #f0f9ff;
          font-weight: 600;
        }
        
        .total-row td {
          border-top: 2px solid var(--primary);
          border-bottom: 2px solid var(--primary);
        }
        
        .category-header {
          background-color: #f0f9ff;
          font-weight: 600;
          color: var(--primary);
          border-top: 2px solid var(--primary-light);
        }
        
        .subcategory-row {
          background-color: #f8fafc;
        }
        
        .subcategory-row td:first-child {
          padding-left: 40px;
        }
        
        .category-total-row {
          background-color: #e6f7f4;
          font-weight: 600;
          color: var(--primary-dark);
          border-bottom: 1px solid var(--primary-light);
        }
        
        .category-total-row td:first-child {
          padding-left: 20px;
        }
        
        .separator-row {
          height: 16px;
          background-color: #f8fafc;
        }
        
        .separator-row td {
          border: none;
          padding: 0;
          height: 16px;
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
          border-left: 4px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .chart-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .chart-action-btn {
          padding: 6px 12px;
          border-radius: 6px;
          background: white;
          border: 1px solid var(--border);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .chart-action-btn:hover {
          background: var(--bg1);
          border-color: var(--primary-light);
        }
        
        .chart-action-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        
        canvas {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
        }
        
        @media (max-width: 768px) {
          .controls {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            justify-content: center;
          }
          
          .chart-container {
            height: 450px;
          }
          
          .summary-cards {
            grid-template-columns: 1fr;
          }
          
          .chart-actions {
            justify-content: center;
          }
          
          .chart-action-btn {
            padding: 8px 12px;
            font-size: 13px;
          }
          
          .subcategory-row td:first-child {
            padding-left: 30px;
          }
          
          .category-total-row td:first-child {
            padding-left: 15px;
          }
        }
      `}</style>

      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <main>
        {/* Panel de control principal */}
        <div className="card">
          <div className="card-title">
            <i className="fas fa-sliders-h"></i>
            Filtros de Análisis
          </div>
          
          <div className="controls">
            <div className="control-group">
              <label htmlFor="selectLugar">
                <i className="fas fa-map-marker-alt"></i> Ubicación
              </label>
              <select 
                id="selectLugar" 
                value={selectedLugar}
                onChange={(e) => setSelectedLugar(e.target.value)}
                disabled={loading}
              >
                <option value="">Todas las ubicaciones</option>
                {filterOptions.lugares.map(lugar => (
                  <option key={lugar} value={lugar}>
                    {lugar}
                  </option>
                ))}
              </select>
              <div className="filter-info">
                {filterOptions.lugares.length} ubicaciones disponibles
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              onClick={resetFilters} 
              className="secondary"
              disabled={loading}
            >
              <i className="fas fa-undo"></i> Restablecer Filtros
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
            <div className="summary-cards">
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
          
          <div className="chart-actions">
            <div 
              className={`chart-action-btn ${currentChartType === 'bar' ? 'active' : ''}`}
              onClick={() => changeChartType('bar')}
            >
              <i className="fas fa-chart-bar"></i> Barras
            </div>
            <div 
              className={`chart-action-btn ${currentChartType === 'pie' ? 'active' : ''}`}
              onClick={() => changeChartType('pie')}
            >
              <i className="fas fa-chart-pie"></i> Torta
            </div>
            <div 
              className={`chart-action-btn ${currentChartType === 'line' ? 'active' : ''}`}
              onClick={() => changeChartType('line')}
            >
              <i className="fas fa-chart-line"></i> Líneas
            </div>
          </div>
          
          <div className="tabs">
            <div className="tab active">
              Distribución por Categoría
            </div>
          </div>
          
          <div className="tab-content active">
            <div className="chart-container">
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Cargando gráfico...</p>
                </div>
              ) : (
                <canvas id="mainChart"></canvas>
              )}
            </div>
          </div>
        </div>

        {/* Tabla resumen */}
        <div className="card">
          <div className="card-title">
            <i className="fas fa-table"></i>
            Tabla Resumen por Categorías
          </div>
          
          <div className="table-responsive">
            <table id="tableResumen">
              <thead>
                <tr>
                  <th>Categoría / Subcategoría</th>
                  <th style={{textAlign: 'right'}}>Peso (kg)</th>
                  <th style={{textAlign: 'right'}}>% del Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} style={{textAlign: 'center', padding: '40px', color: 'var(--muted)'}}>
                      Cargando datos...
                    </td>
                  </tr>
                ) : resumenCategorias.detalles.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{textAlign: 'center', padding: '40px', color: 'var(--muted)'}}>
                      No hay datos disponibles para los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  <>
                    {resumenCategorias.detalles.map((detalle, index) => {
                      const porcentajeCategoria = resumenCategorias.totalSum > 0 ? 
                        ((detalle.total / resumenCategorias.totalSum) * 100).toFixed(2) + '%' : '0.00%';
                      
                      return (
                        <React.Fragment key={detalle.categoria}>
                          {index > 0 && (
                            <tr className="separator-row">
                              <td colSpan={3}></td>
                            </tr>
                          )}
                          
                          <tr className="category-header">
                            <td><strong>{detalle.categoria}</strong></td>
                            <td style={{textAlign: 'right'}}></td>
                            <td style={{textAlign: 'right'}}></td>
                          </tr>
                          
                          {detalle.subcategorias.map(subcategoria => {
                            const porcentajeSubcategoria = resumenCategorias.totalSum > 0 ? 
                              ((subcategoria.valor / resumenCategorias.totalSum) * 100).toFixed(2) + '%' : '0.00%';
                            
                            return (
                              <tr key={subcategoria.nombre} className="subcategory-row">
                                <td>{subcategoria.nombre}</td>
                                <td style={{textAlign: 'right'}}>{subcategoria.valor.toFixed(2)}</td>
                                <td style={{textAlign: 'right'}}>{porcentajeSubcategoria}</td>
                              </tr>
                            );
                          })}
                          
                          <tr className="category-total-row">
                            <td><strong>TOTAL {detalle.categoria}</strong></td>
                            <td style={{textAlign: 'right'}}><strong>{detalle.total.toFixed(2)}</strong></td>
                            <td style={{textAlign: 'right'}}><strong>{porcentajeCategoria}</strong></td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                    
                    {resumenCategorias.detalles.length > 0 && (
                      <tr className="total-row">
                        <td><strong>TOTAL GENERAL</strong></td>
                        <td style={{textAlign: 'right'}}>
                          <strong>{resumenCategorias.totalSum.toFixed(2)}</strong>
                        </td>
                        <td style={{textAlign: 'right'}}><strong>100.00%</strong></td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}