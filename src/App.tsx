import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Building2, Ruler, TrendingUp, Calculator, AlertCircle, CheckCircle, Info, ChevronRight, ChevronLeft, MapPin, Home, Search, Map, Share2, TreeDeciduous, CheckSquare, Square, Copy, Tractor, Sun, CloudSun, LucideIcon } from 'lucide-react';

// --- ESTILOS E FONTES ---
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
    
    body { font-family: 'Montserrat', sans-serif; }
    
    input[type=range] {
      height: 12px;
      border-radius: 999px;
    }
    
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 28px;
      width: 28px;
      border-radius: 50%;
      background: #2563eb;
      border: 3px solid white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      margin-top: -2px;
      cursor: pointer;
      transition: transform 0.1s;
    }
    input[type=range]::-webkit-slider-thumb:active {
      transform: scale(1.1);
      background: #1d4ed8;
    }

    input[type=range]::-moz-range-thumb {
      height: 28px;
      width: 28px;
      border-radius: 50%;
      background: #2563eb;
      border: 3px solid white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      cursor: pointer;
    }

    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

// --- TIPAGEM ---
interface ImovelState {
  endereco: string;
  bairro: string;
  tipo: string;
  areaTotal: string;
  areaConstruida: string;
  ano: string;
  valorPedido: string;
  isRural: boolean;
  orientacao: 'Nascente' | 'Poente';
  formatoTerreno: 'Regular' | 'Irregular';
  frente: string;
  lateral: string;
  fundo: string;
  latDir: string;
  latEsq: string;
}

interface MarketDataState {
  precoMedioM2: string;
  fatorAjusteMax: number;
}

// Assinatura de índice para permitir acesso dinâmico (ex: scores['localizacao'])
interface CategoryScores {
  [key: string]: number;
}

interface ScoresState {
  localizacao: CategoryScores;
  terreno: CategoryScores;
  construcao: CategoryScores;
  vizinhanca: CategoryScores;
  potencial: CategoryScores;
  [key: string]: CategoryScores; 
}

interface AgeLabel {
  text: string;
  color: string;
}

interface Descriptions {
  [key: string]: {
    [key: string]: string;
  };
}

// --- UTILITÁRIOS ---
const parseCurrency = (value: string | number): number => {
  if (!value) return 0;
  return Number(value.toString().replace(/\./g, "").replace(",", ".")) || 0;
};

const formatNumber = (value: number | string): string => {
  if (!value && value !== 0) return "";
  return Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const roundToEven = (num: number): number => {
  const integerPart = Math.round(num);
  return 2 * Math.round(integerPart / 2);
};

const POI_LIST = [
  "Escolas / Colégios", "Universidades", "Hospitais / Clínicas", "Farmácias",
  "Supermercados", "Padarias", "Restaurantes / Bares", "Shopping Center",
  "Parques / Praças", "Academias", "Transporte Público", "Bancos",
  "Posto de Combustível", "Delegacia / Segurança", "Vias de Acesso Rápido"
];

const descriptions: Descriptions = {
  localizacao: {
    regiao: "Valorização imobiliária do bairro e procura atual.",
    relevo: "Topografia. Plano (10) vs Aclive/Declive acentuado (0).",
    acesso: "Facilidade de chegada, pavimentação e trânsito.",
    infra: "Rede de água, esgoto, luz, internet e drenagem.",
    servicos: "Proximidade de escolas, mercados, hospitais e transporte."
  },
  terreno: {
    extensao: "Tamanho da área em relação ao padrão da região.",
    formato: "Geometria (Regular/Retangular = nota maior).",
    benfeitorias: "Muros, calçadas, portões e paisagismo existente.",
    ventilacao: "Posição solar e circulação de ar natural.",
    ampliacao: "Espaço disponível para futuras construções."
  },
  construcao: {
    conservacao: "Estado geral de pintura, pisos e instalações.",
    padrao: "Qualidade dos acabamentos (Luxo vs Popular).",
    distribuicao: "Aproveitamento da planta e integração de ambientes.",
    conforto: "Isolamento térmico e acústico.",
    idade: "Idade aparente e necessidade de modernização."
  },
  vizinhanca: {
    zoneamento: "Flexibilidade da lei de uso e ocupação do solo.",
    perfil: "Padrão das construções vizinhas.",
    ruidos: "Nível de silêncio (Silencioso = 10).",
    seguranca: "Sensação de segurança e índices de criminalidade."
  },
  potencial: {
    expansao: "Crescimento urbano em direção ao imóvel.",
    obras: "Obras públicas previstas nas redondezas.",
    empreendimentos: "Lançamentos imobiliários na região.",
    escassez: "Falta de terrenos disponíveis na área (Escassez = nota alta).",
    historico: "Histórico de valorização nos últimos anos.",
    renda: "Facilidade para alugar ou revender (Liquidez)."
  }
};

// --- COMPONENTES UI ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode; icon?: LucideIcon }) => (
  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 uppercase tracking-wide">
    {Icon && <Icon size={18} className="text-blue-600" />}
    {children}
  </h3>
);

interface FormattedInputProps {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  prefix?: string;
  isCurrency?: boolean;
  isNumber?: boolean;
  disabled?: boolean;
}

const FormattedInput = ({ label, value, onChange, type = "text", placeholder = "", prefix = "", isCurrency = false, isNumber = false, disabled = false }: FormattedInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    
    if (isCurrency || isNumber) {
      const numericVal = rawVal.replace(/\D/g, "");
      
      if (numericVal === "") {
        onChange("");
        return;
      }

      const number = Number(numericVal) / 100;
      const formatted = number.toLocaleString("pt-BR", { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
      
      onChange(formatted);
    } else {
      onChange(rawVal);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">{label}</label>
      <div className="relative flex items-center">
        {prefix && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm pointer-events-none z-10 ${disabled ? 'text-slate-300' : 'text-slate-400'}`}>
            {prefix}
          </div>
        )}
        <input
          type={type === "number" || isCurrency || isNumber ? "text" : type}
          inputMode={type === "number" || isCurrency || isNumber ? "numeric" : "text"}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`w-full p-3.5 border rounded-xl outline-none transition-all font-semibold shadow-sm
            ${prefix ? 'pl-10' : ''} 
            ${disabled 
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-300'
            }`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

interface RangeInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  touched: boolean;
  description: string;
}

const RangeInput = ({ label, value, onChange, touched, description }: RangeInputProps) => {
  const [showInfo, setShowInfo] = useState(false);
  const displayValue = touched ? value : 5;
  
  return (
    <div className="mb-6 last:mb-2">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2 max-w-[75%]">
          <label 
            onClick={() => setShowInfo(!showInfo)}
            className={`text-sm font-semibold leading-tight transition-colors cursor-pointer flex items-center gap-1 ${touched ? 'text-slate-800' : 'text-slate-400'}`}
          >
            {label}
            <div className="bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-600 rounded-full p-0.5 transition-colors">
              <Info size={12} />
            </div>
          </label>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-md transition-all ${
          !touched 
            ? 'bg-slate-100 text-slate-400' 
            : displayValue >= 8 
              ? 'bg-green-100 text-green-700' 
              : displayValue <= 4 
                ? 'bg-red-100 text-red-700' 
                : 'bg-blue-100 text-blue-700'
        }`}>
          {!touched ? '-' : displayValue}
        </span>
      </div>
      
      {showInfo && (
        <div className="mb-3 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 animate-in fade-in slide-in-from-top-1">
          {description}
        </div>
      )}

      <input
        type="range"
        min="0"
        max="10"
        step="0.5"
        value={displayValue}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full appearance-none cursor-pointer touch-none transition-colors rounded-full ${touched ? 'bg-blue-200' : 'bg-slate-200'}`}
      />
    </div>
  );
};

export default function App() {
  const tabs = ['dados', 'tecnica', 'potencial', 'resumo', 'preco'];
  const [activeTab, setActiveTab] = useState('dados');
  
  // --- ESTADO GERAL ---
  const [imovel, setImovel] = useState<ImovelState>({
    endereco: '',
    bairro: '',
    tipo: 'Apartamento',
    areaTotal: '',
    areaConstruida: '',
    ano: '',
    valorPedido: '',
    isRural: false,
    orientacao: 'Nascente',
    formatoTerreno: 'Regular',
    frente: '',
    lateral: '',
    fundo: '',
    latDir: '',
    latEsq: ''
  });

  const [marketData, setMarketData] = useState<MarketDataState>({
    precoMedioM2: '',
    fatorAjusteMax: 20
  });

  const [touchedItems, setTouchedItems] = useState<Set<string>>(new Set());
  const [selectedPOIs, setSelectedPOIs] = useState<Set<string>>(new Set());
  
  const [scores, setScores] = useState<ScoresState>({
    localizacao: { regiao: 5, relevo: 5, acesso: 5, infra: 5, servicos: 5 },
    terreno: { extensao: 5, formato: 5, benfeitorias: 5, ventilacao: 5, ampliacao: 5 },
    construcao: { conservacao: 5, padrao: 5, distribuicao: 5, conforto: 5, idade: 5 },
    vizinhanca: { zoneamento: 5, perfil: 5, ruidos: 5, seguranca: 5 },
    potencial: { expansao: 5, obras: 5, empreendimentos: 5, escassez: 5, historico: 5, renda: 5 }
  });

  // --- LÓGICA DO ANO/IDADE ---
  const currentYear = new Date().getFullYear();
  const getImovelAgeLabel = (): AgeLabel | null => {
    if (imovel.tipo === 'Terreno') return null;
    if (!imovel.ano) return null;
    const ano = parseInt(imovel.ano);
    if (isNaN(ano)) return null;
    const age = currentYear - ano;
    if (age < 0) return { text: "Na Planta", color: "text-blue-600 bg-blue-50" };
    if (age <= 5) return { text: "Novo", color: "text-emerald-600 bg-emerald-50" };
    if (age <= 20) return { text: "Seminovo", color: "text-blue-600 bg-blue-50" };
    return { text: "Antigo", color: "text-slate-600 bg-slate-100" };
  };
  const ageLabel = getImovelAgeLabel();

  // --- EFEITOS DE CÁLCULO DE ÁREA ---
  useEffect(() => {
    if (imovel.tipo === 'Terreno' || imovel.tipo === 'Casa' || imovel.tipo === 'Comercial') {
      let areaCalculada = 0;
      
      if (imovel.formatoTerreno === 'Regular') {
        const f = parseCurrency(imovel.frente);
        const l = parseCurrency(imovel.lateral);
        if (f > 0 && l > 0) {
          areaCalculada = f * l;
          setImovel(prev => ({ ...prev, areaTotal: formatNumber(areaCalculada) }));
        }
      } else {
        const f = parseCurrency(imovel.frente);
        const fd = parseCurrency(imovel.fundo);
        const le = parseCurrency(imovel.latEsq);
        const ld = parseCurrency(imovel.latDir);
        
        if (f > 0 && fd > 0 && le > 0 && ld > 0) {
          const avgWidth = (f + fd) / 2;
          const avgHeight = (le + ld) / 2;
          areaCalculada = avgWidth * avgHeight;
          setImovel(prev => ({ ...prev, areaTotal: formatNumber(areaCalculada) }));
        }
      }
    }
  }, [imovel.formatoTerreno, imovel.frente, imovel.lateral, imovel.fundo, imovel.latDir, imovel.latEsq, imovel.tipo]);

  // Resetar campos ao mudar tipo
  useEffect(() => {
    if (imovel.tipo === 'Terreno') {
      setImovel(prev => ({ ...prev, ano: '', areaConstruida: '' }));
    }
  }, [imovel.tipo]);

  // --- HANDLERS ---
  const handleNext = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const togglePOI = (poi: string) => {
    const newSet = new Set(selectedPOIs);
    if (newSet.has(poi)) newSet.delete(poi);
    else newSet.add(poi);
    setSelectedPOIs(newSet);
  };

  const updateScore = (category: string, item: string, val: number) => {
    setScores(prev => ({ ...prev, [category]: { ...prev[category], [item]: val } }));
    setTouchedItems(prev => new Set(prev).add(`${category}.${item}`));
  };

  // --- CÁLCULOS FINAIS ---
  const calculateCategoryScore = (categoryKey: string) => {
    const categoryScores = scores[categoryKey];
    let sum = 0;
    let count = 0;
    Object.keys(categoryScores).forEach(key => {
      if (touchedItems.has(`${categoryKey}.${key}`)) {
        sum += categoryScores[key];
        count++;
      }
    });
    return count === 0 ? 0 : sum / count;
  };

  const results = {
    loc: calculateCategoryScore('localizacao') * 2.5,
    ter: calculateCategoryScore('terreno') * 2.0,
    cons: calculateCategoryScore('construcao') * 2.0,
    viz: calculateCategoryScore('vizinhanca') * 1.5,
    pot: calculateCategoryScore('potencial') * 2.0
  };

  const finalScore = results.loc + results.ter + results.cons + results.viz + results.pot;

  const getClassification = (score: number) => {
    if (score === 0 && touchedItems.size === 0) return { label: "Aguardando Avaliação", color: "text-slate-400", bg: "bg-slate-50" };
    if (score >= 90) return { label: "Imóvel Premium", color: "text-emerald-700", bg: "bg-emerald-50" };
    if (score >= 75) return { label: "Ótima Oportunidade", color: "text-blue-700", bg: "bg-blue-50" };
    if (score >= 60) return { label: "Bom, com ressalvas", color: "text-yellow-700", bg: "bg-yellow-50" };
    return { label: "Necessita Ajuste", color: "text-red-700", bg: "bg-red-50" };
  };

  const classification = getClassification(finalScore);
  
  // Relatório Sort
  const getAllCriteria = () => {
    const all: { label: string; val: number }[] = [];
    const labels: Record<string, string> = {
      regiao: 'Região', relevo: 'Relevo', acesso: 'Acesso', infra: 'Infraestrutura', servicos: 'Serviços',
      extensao: 'Extensão', formato: 'Formato', benfeitorias: 'Benfeitorias', ventilacao: 'Ventilação', ampliacao: 'Ampliação',
      conservacao: 'Conservação', padrao: 'Padrão', distribuicao: 'Planta', conforto: 'Conforto', idade: 'Idade',
      zoneamento: 'Zoneamento', perfil: 'Vizinhança', ruidos: 'Ruídos', seguranca: 'Segurança',
      expansao: 'Expansão', obras: 'Obras', empreendimentos: 'Empreend.', escassez: 'Escassez', historico: 'Valorização', renda: 'Renda'
    };
    Object.keys(scores).forEach(cat => {
      Object.keys(scores[cat]).forEach(key => {
        if (touchedItems.has(`${cat}.${key}`)) {
           all.push({ label: labels[key] || key, val: scores[cat][key] });
        }
      });
    });
    return all.sort((a, b) => b.val - a.val);
  };
  const sortedCriteria = getAllCriteria();
  const top3 = sortedCriteria.slice(0, 3).filter(i => i.val >= 7);
  const bottom3 = sortedCriteria.slice().reverse().slice(0, 3).filter(i => i.val <= 6);

  // --- CÁLCULO DE PREÇO ---
  const areaCalc = parseCurrency(imovel.areaConstruida) || parseCurrency(imovel.areaTotal) || 0;
  const precoMedioCalc = parseCurrency(marketData.precoMedioM2) || 0;
  const valorBase = areaCalc * precoMedioCalc;
  const percentualAjuste = touchedItems.size === 0 ? 0 : ((finalScore - 50) / 50) * (marketData.fatorAjusteMax / 100);
  
  let valorSugeridoRaw = valorBase * (1 + percentualAjuste);
  
  if (imovel.isRural) valorSugeridoRaw = valorSugeridoRaw * 0.95;
  if (imovel.orientacao === 'Nascente') valorSugeridoRaw = valorSugeridoRaw * 1.05;

  const valorSugerido = roundToEven(valorSugeridoRaw);
  const valorMin = roundToEven(valorSugerido * 0.95);
  const valorMax = roundToEven(valorSugerido * 1.05);

  const generateReportText = () => {
    const poiText = selectedPOIs.size > 0 ? `\nCONVENIÊNCIAS PRÓXIMAS:\n${Array.from(selectedPOIs).join(', ')}` : '';
    const factors = [];
    if(imovel.isRural) factors.push("Rural (-5%)");
    if(imovel.orientacao === 'Nascente') factors.push("Nascente (+5%)");
    const factorText = factors.length > 0 ? ` (${factors.join(', ')})` : "";

    return `PRO > FLASH - AVALIAÇÃO\n\nIMÓVEL: ${imovel.tipo}\nLOCAL: ${imovel.bairro}\nÁREA: ${imovel.areaTotal}m² (${imovel.formatoTerreno})\n\nNOTA FINAL: ${finalScore.toFixed(0)}/100\nCLASSIFICAÇÃO: ${classification.label}\n\nPONTOS FORTES:\n${top3.map(i => `- ${i.label}: ${i.val}`).join('\n')}\n\nPONTOS DE ATENÇÃO:\n${bottom3.map(i => `- ${i.label}: ${i.val}`).join('\n')}${poiText}\n\nVALOR BASE: R$ ${valorBase.toLocaleString('pt-BR')}\nVALOR SUGERIDO: R$ ${valorSugerido.toLocaleString('pt-BR')}${factorText}\nFAIXA: R$ ${valorMin.toLocaleString('pt-BR')} - R$ ${valorMax.toLocaleString('pt-BR')}`;
  };

  const copyReport = () => {
    const text = generateReportText();
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert("Copiado com sucesso!");
    } catch {
        alert("Erro ao copiar.");
    }
  };

  const shareReport = async () => {
    const text = generateReportText();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Avaliação PRO > FLASH', text: text });
      } catch (err) { console.log('Erro ao compartilhar', err); }
    } else {
      copyReport();
    }
  };

  const handleMapSearch = () => {
    const query = encodeURIComponent(`${imovel.endereco}, ${imovel.bairro}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handlePOISearch = () => {
    const query = encodeURIComponent(`pontos de interesse perto de ${imovel.endereco}, ${imovel.bairro}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-32">
      <FontStyles />
      
      {/* HEADER */}
      <header className="bg-slate-900 pt-8 pb-8 px-6 shadow-xl rounded-b-[2.5rem] sticky top-0 z-30 border-b-4 border-slate-800">
        <div className="flex flex-col items-center justify-center text-center mb-6">
           <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-2 text-white">
              <FileSpreadsheet className="text-blue-500" size={32} />
              PRO <span className="text-blue-500">{'>'}</span> FLASH
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Ferramenta Técnica e Estratégica</p>
        </div>

        <div className="bg-white rounded-2xl p-4 text-slate-900 shadow-2xl shadow-black/50 transform translate-y-4 max-w-sm mx-auto border-2 border-slate-100">
            <div className="flex justify-between items-center px-2">
                <div className="text-left">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Pontuação Técnica</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black tracking-tight text-blue-600">{finalScore.toFixed(0)}</span>
                        <span className="text-sm text-slate-400 font-bold">/ 100</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide ${finalScore > 0 ? 'bg-slate-100 text-slate-700' : 'bg-slate-50 text-slate-300'}`}>
                        {classification.label}
                    </div>
                </div>
            </div>
            <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${finalScore}%` }}></div>
            </div>
        </div>
      </header>

      {/* ABAS CENTRALIZADAS */}
      <div className="mt-12 w-full flex justify-center">
        <div className="w-full max-w-4xl px-4">
          <div className="flex justify-center flex-wrap gap-2 md:grid md:grid-cols-5 md:gap-4">
            {[
              { id: 'dados', label: 'DADOS', icon: Home },
              { id: 'tecnica', label: 'TÉCNICA', icon: Ruler },
              { id: 'potencial', label: 'POTENCIAL', icon: TrendingUp },
              { id: 'resumo', label: 'RESUMO', icon: CheckCircle },
              { id: 'preco', label: 'PREÇO', icon: Calculator },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-300 w-20 md:w-auto md:h-24 md:shadow-sm
                  ${activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105 font-bold z-10' 
                    : 'bg-white text-slate-400 border border-slate-100 font-medium hover:bg-slate-50 hover:text-slate-600'}`}
              >
                <tab.icon size={22} className="mb-1.5 md:mb-2" />
                <span className="text-[10px] md:text-xs tracking-wide">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="px-6 mt-6 md:max-w-4xl md:mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {activeTab === 'dados' && (
          <div className="space-y-5">
            <Card className="p-5 border-l-4 border-l-blue-500">
              <SectionTitle icon={MapPin}>Localização</SectionTitle>
              <FormattedInput label="Endereço" value={imovel.endereco} onChange={(v) => setImovel({ ...imovel, endereco: v })} placeholder="Rua, Número..." />
              <div className="grid grid-cols-2 gap-4">
                <FormattedInput label="Bairro" value={imovel.bairro} onChange={(v) => setImovel({ ...imovel, bairro: v })} placeholder="Bairro" />
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Tipo</label>
                    <div className="relative">
                        <select 
                            value={imovel.tipo} 
                            onChange={(e) => setImovel({ ...imovel, tipo: e.target.value })} 
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none appearance-none"
                        >
                            <option>Apartamento</option>
                            <option>Casa</option>
                            <option>Terreno</option>
                            <option>Comercial</option>
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                    </div>
                </div>
              </div>

              {/* TOGGLES: RURAL e ORIENTAÇÃO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                    {imovel.isRural ? <Tractor size={18} className="text-orange-500" /> : <Building2 size={18} className="text-blue-500" />}
                    {imovel.isRural ? 'Rural (-5%)' : 'Urbano'}
                  </span>
                  <button onClick={() => setImovel(prev => ({ ...prev, isRural: !prev.isRural }))} className={`w-12 h-7 rounded-full flex items-center transition-colors p-1 ${imovel.isRural ? 'bg-orange-500' : 'bg-slate-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${imovel.isRural ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                   <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                    {imovel.orientacao === 'Nascente' ? <Sun size={18} className="text-yellow-500" /> : <CloudSun size={18} className="text-orange-400" />}
                    {imovel.orientacao === 'Nascente' ? 'Nascente (+5%)' : 'Poente'}
                   </span>
                   <button onClick={() => setImovel(prev => ({ ...prev, orientacao: prev.orientacao === 'Nascente' ? 'Poente' : 'Nascente' }))} className={`w-12 h-7 rounded-full flex items-center transition-colors p-1 ${imovel.orientacao === 'Nascente' ? 'bg-yellow-400' : 'bg-slate-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${imovel.orientacao === 'Nascente' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button onClick={handleMapSearch} className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold uppercase hover:bg-blue-100 transition-colors">
                    <Map size={16} /> Ver no Mapa
                 </button>
                 <button onClick={handlePOISearch} className="flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold uppercase hover:bg-indigo-100 transition-colors">
                    <Search size={16} /> Pontos Interesse
                 </button>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-slate-400">
              <SectionTitle icon={Ruler}>Dimensões do Imóvel</SectionTitle>
              
              <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                {['Regular', 'Irregular'].map(tipo => (
                  <button
                    key={tipo}
                    onClick={() => setImovel(prev => ({ ...prev, formatoTerreno: tipo as 'Regular' | 'Irregular' }))}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${imovel.formatoTerreno === tipo ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>

              {imovel.formatoTerreno === 'Regular' ? (
                 <div className="grid grid-cols-2 gap-4">
                   <FormattedInput label="Frente (m)" value={imovel.frente} onChange={(v) => setImovel({ ...imovel, frente: v })} isNumber={true} />
                   <FormattedInput label="Lateral (m)" value={imovel.lateral} onChange={(v) => setImovel({ ...imovel, lateral: v })} isNumber={true} />
                 </div>
              ) : (
                 <div className="grid grid-cols-2 gap-4">
                   <FormattedInput label="Frente (m)" value={imovel.frente} onChange={(v) => setImovel({ ...imovel, frente: v })} isNumber={true} />
                   <FormattedInput label="Fundos (m)" value={imovel.fundo} onChange={(v) => setImovel({ ...imovel, fundo: v })} isNumber={true} />
                   <FormattedInput label="Lat. Dir (m)" value={imovel.latDir} onChange={(v) => setImovel({ ...imovel, latDir: v })} isNumber={true} />
                   <FormattedInput label="Lat. Esq (m)" value={imovel.latEsq} onChange={(v) => setImovel({ ...imovel, latEsq: v })} isNumber={true} />
                 </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormattedInput label="Área Total Calculada" value={imovel.areaTotal} onChange={(v) => setImovel({ ...imovel, areaTotal: v })} prefix="m²" isNumber={true} />
                <FormattedInput 
                  label="Área Construída" 
                  value={imovel.areaConstruida} 
                  onChange={(v) => setImovel({ ...imovel, areaConstruida: v })} 
                  prefix="m²" 
                  isNumber={true}
                  disabled={imovel.tipo === 'Terreno'}
                />
              </div>

              <div className="relative mt-2">
                <FormattedInput 
                  label="Ano Construção" 
                  value={imovel.ano} 
                  onChange={(v) => setImovel({ ...imovel, ano: v })} 
                  type="number" 
                  placeholder={imovel.tipo === 'Terreno' ? "N/A" : "AAAA"}
                  disabled={imovel.tipo === 'Terreno'}
                />
                {ageLabel && (
                  <div className={`absolute right-3 top-[2.2rem] px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${ageLabel.color}`}>
                    {ageLabel.text}
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-green-500">
              <SectionTitle icon={Calculator}>Valores</SectionTitle>
              <FormattedInput 
                label="Preço Médio Região (m²)" 
                value={marketData.precoMedioM2} 
                onChange={(v) => setMarketData({...marketData, precoMedioM2: v})} 
                placeholder="0,00" 
                prefix="R$"
                isCurrency={true}
              />
              <FormattedInput 
                label="Valor Pedido" 
                value={imovel.valorPedido} 
                onChange={(v) => setImovel({ ...imovel, valorPedido: v })} 
                placeholder="0,00" 
                prefix="R$"
                isCurrency={true}
              />
            </Card>

            <Card className="p-5 border-l-4 border-l-orange-400">
              <SectionTitle icon={CheckSquare}>Checklist de Conveniências</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {POI_LIST.map((poi, idx) => {
                  const isSelected = selectedPOIs.has(poi);
                  return (
                    <button 
                      key={idx}
                      onClick={() => togglePOI(poi)}
                      className={`flex items-center gap-2 text-left p-2 rounded-lg text-xs font-semibold transition-all
                        ${isSelected ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {isSelected ? <CheckSquare size={16} className="shrink-0" /> : <Square size={16} className="shrink-0 opacity-50" />}
                      <span className="leading-tight">{poi}</span>
                    </button>
                  )
                })}
              </div>
            </Card>
          </div>
        )}

        {/* --- DEMAIS ABAS --- */}
        {activeTab === 'tecnica' && (
          <div className="space-y-6">
            <div className="text-center text-slate-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest">Avaliação Detalhada</span>
            </div>

            <Card className="p-5 shadow-sm">
              <SectionTitle icon={MapPin}>A) Localização (25%)</SectionTitle>
              {Object.keys(scores.localizacao).map(key => (
                <RangeInput key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={scores.localizacao[key]} onChange={(v) => updateScore('localizacao', key, v)} touched={touchedItems.has(`localizacao.${key}`)} description={descriptions.localizacao[key]} />
              ))}
            </Card>

            <Card className="p-5 shadow-sm">
              <SectionTitle icon={imovel.isRural ? TreeDeciduous : Home}>B) Imóvel (20%)</SectionTitle>
              {Object.keys(scores.terreno).map(key => (
                <RangeInput key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={scores.terreno[key]} onChange={(v) => updateScore('terreno', key, v)} touched={touchedItems.has(`terreno.${key}`)} description={descriptions.terreno[key]} />
              ))}
            </Card>

            <Card className="p-5 shadow-sm">
              <SectionTitle icon={Building2}>C) Construção (20%)</SectionTitle>
              {Object.keys(scores.construcao).map(key => (
                <RangeInput key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={scores.construcao[key]} onChange={(v) => updateScore('construcao', key, v)} touched={touchedItems.has(`construcao.${key}`)} description={descriptions.construcao[key]} />
              ))}
            </Card>

            <Card className="p-5 shadow-sm">
              <SectionTitle icon={AlertCircle}>D) Vizinhança (15%)</SectionTitle>
              {Object.keys(scores.vizinhanca).map(key => (
                <RangeInput key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={scores.vizinhanca[key]} onChange={(v) => updateScore('vizinhanca', key, v)} touched={touchedItems.has(`vizinhanca.${key}`)} description={descriptions.vizinhanca[key]} />
              ))}
            </Card>
             <div className="flex items-center justify-center gap-2 text-blue-500 mt-4 mb-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <Info size={16} />
                <span className="text-xs font-bold uppercase tracking-wide">Toque no 'i' ao lado dos itens para detalhes</span>
            </div>
          </div>
        )}

        {activeTab === 'potencial' && (
          <div className="space-y-5">
             <Card className="p-5 border-l-4 border-l-purple-500">
              <SectionTitle icon={TrendingUp}>Potencial (20%)</SectionTitle>
              <p className="text-xs text-slate-500 mb-6 font-medium">Critérios estratégicos para investidores.</p>
              {Object.keys(scores.potencial).map(key => (
                <RangeInput key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={scores.potencial[key]} onChange={(v) => updateScore('potencial', key, v)} touched={touchedItems.has(`potencial.${key}`)} description={descriptions.potencial[key]} />
              ))}
            </Card>
          </div>
        )}

        {activeTab === 'resumo' && (
          <div className="space-y-6">
            <div className={`p-8 rounded-3xl shadow-xl text-center ${classification.bg} border-2 border-white relative overflow-hidden`}>
              <div className="relative z-10">
                  <div className="text-6xl font-black text-slate-800 mb-2">{finalScore.toFixed(0)}</div>
                  <div className={`text-lg font-bold ${classification.color} uppercase tracking-wide`}>{classification.label}</div>
              </div>
            </div>

            {top3.length > 0 && (
                <Card className="p-5 bg-green-50/50 border-green-100">
                  <h4 className="text-xs font-bold text-green-700 uppercase mb-3 flex items-center gap-1"><CheckCircle size={14}/> Destaques Positivos</h4>
                  {top3.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-slate-700 border-b border-green-100 last:border-0 py-2">
                      <span>{item.label}</span> <span className="font-bold bg-white px-2 rounded shadow-sm text-green-700">{item.val}</span>
                    </div>
                  ))}
                </Card>
            )}

            {bottom3.length > 0 && (
                <Card className="p-5 bg-red-50/50 border-red-100">
                  <h4 className="text-xs font-bold text-red-700 uppercase mb-3 flex items-center gap-1"><AlertCircle size={14}/> Pontos de Atenção</h4>
                  {bottom3.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-slate-700 border-b border-red-100 last:border-0 py-2">
                      <span>{item.label}</span> <span className="font-bold bg-white px-2 rounded shadow-sm text-red-700">{item.val}</span>
                    </div>
                  ))}
                </Card>
            )}

            <button onClick={copyReport} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl shadow-slate-200">
              <Copy size={20} /> COPIAR RELATÓRIO
            </button>
          </div>
        )}

        {activeTab === 'preco' && (
          <div className="space-y-5">
             <Card className="p-8 text-center border-t-4 border-t-blue-600 shadow-lg">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest mb-3">Valor Sugerido de Venda</p>
                <div className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                   {valorSugerido > 0 ? `R$ ${valorSugerido.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : 'R$ 0'}
                </div>
                
                <div className="flex justify-center gap-0 text-xs font-semibold text-slate-600 bg-slate-50 p-1 rounded-xl mx-auto max-w-[280px] border border-slate-100">
                  <div className="flex-1 py-2 rounded-lg text-center">
                      <span className="block text-[9px] text-slate-400 uppercase mb-0.5">Mínimo</span>
                      {valorMin.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="w-px bg-slate-200 my-1"></div>
                  <div className="flex-1 py-2 rounded-lg text-center">
                      <span className="block text-[9px] text-slate-400 uppercase mb-0.5">Máximo</span>
                      {valorMax.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </div>
                </div>
             </Card>
             
             <Card className="p-6">
               <SectionTitle icon={Info}>Memória de Cálculo</SectionTitle>
               <div className="space-y-3 text-sm font-medium text-slate-600">
                 <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                   <span className="text-slate-400">Valor Base (Média)</span>
                   <span>R$ {valorBase.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                   <span className="text-slate-400">Nota Técnica</span>
                   <span className={finalScore > 50 ? "text-green-600" : "text-red-500"}>{finalScore.toFixed(0)} / 100</span>
                 </div>
                 <div className="flex justify-between items-center pt-1 border-b border-slate-50 pb-2">
                   <span className="text-slate-400">Ajuste Aplicado</span>
                   <span className={`px-2 py-0.5 rounded text-xs font-bold ${percentualAjuste >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                     {percentualAjuste >= 0 ? '+' : ''}{(percentualAjuste * 100).toFixed(1)}%
                   </span>
                 </div>
                 {/* Fatores Adicionais */}
                 {imovel.isRural && (
                   <div className="flex justify-between items-center pt-1 text-orange-600">
                     <span className="text-xs font-bold uppercase">Fator Rural</span>
                     <span className="font-bold">-5%</span>
                   </div>
                 )}
                 {imovel.orientacao === 'Nascente' && (
                   <div className="flex justify-between items-center pt-1 text-yellow-600">
                     <span className="text-xs font-bold uppercase">Fator Nascente</span>
                     <span className="font-bold">+5%</span>
                   </div>
                 )}
               </div>
             </Card>

             <div className="pt-4 px-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block">Sensibilidade do Ajuste</label>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  value={marketData.fatorAjusteMax}
                  onChange={(e) => setMarketData({...marketData, fatorAjusteMax: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-slate-200 rounded-full accent-slate-600 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-2 uppercase font-bold">
                  <span>Conservador (5%)</span>
                  <span>Agressivo (50%)</span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={copyReport} className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                   <Copy size={20} /> COPIAR
                </button>
                <button onClick={shareReport} className="py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-slate-300">
                   <Share2 size={20} /> COMPARTILHAR
                </button>
             </div>
          </div>
        )}

      </main>

      {/* FOOTER NAV (MOBILE) */}
      <div className="fixed bottom-8 left-0 w-full px-8 flex justify-between items-center pointer-events-none z-40 md:justify-center md:gap-8">
        <button 
          onClick={handlePrev}
          disabled={activeTab === 'dados'}
          className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center pointer-events-auto transition-all transform active:scale-95 border border-white/50
            ${activeTab === 'dados' ? 'bg-slate-200 text-slate-400 opacity-0' : 'bg-white text-slate-800'}`}
        >
          <ChevronLeft size={28} />
        </button>

        <button 
          onClick={handleNext}
          disabled={activeTab === 'preco'}
          className={`w-14 h-14 rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center pointer-events-auto transition-all transform active:scale-95 border border-white/20
            ${activeTab === 'preco' ? 'bg-slate-200 text-slate-400 opacity-0' : 'bg-blue-600 text-white'}`}
        >
          <ChevronRight size={28} />
        </button>
      </div>

    </div>
  );
}