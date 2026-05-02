import React, { useEffect, useState } from 'react';
import { Newspaper, RefreshCw, Plus, Link as LinkIcon, Facebook, Instagram, Trash2, Send, Calendar } from 'lucide-react';

interface NewsItem {
  id: string;
  time: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  type?: 'auto' | 'manual' | 'social';
  link?: string;
}

const JAPAN_EVENTS_MOCK = [
  {
    id: 'ev-1',
    title: "Sanja Matsuri 2026: Tradição em Asakusa",
    date: "15-17 de Maio",
    location: "Asakusa, Tóquio",
    description: "Considerado um dos festivais mais selvagens e vibrantes do Japão, o Sanja Matsuri celebra os fundadores do Templo Senso-ji. O evento atrai cerca de 2 milhões de pessoas ao longo de três dias. No domingo, o clímax ocorre com a procissão dos três Mikoshis (templos portáteis) principais, carregados por centenas de fiéis em trajes tradicionais. Recomenda-se chegar cedo e evitar as áreas de maior aglomeração se estiver com crianças.",
    source: "Japan Travel Guide",
    link: "https://www.japan-guide.com/e/e3018.html"
  },
  {
    id: 'ev-2',
    title: "Brazilian Day Nagoya 2026: 15 Anos de Festa",
    date: "23-24 de Maio",
    location: "Hisaya Odori Park, Nagoya",
    description: "A maior celebração da cultura brasileira na região de Tokai confirma sua edição comemorativa. Além da vasta feira gastronômica com churrasco, coxinhas e guaraná, o festival contará com workshops de samba, capoeira e a presença de DJs renomados da cena eletrônica brasileira. O evento é um ponto vital de encontro para a rede de contatos e negócios da comunidade brasileira em Aichi e províncias vizinhas.",
    source: "Alternativa Online",
    link: "https://www.alternativa.co.jp/Noticia/Categorias/Eventos/9680--brazilian-day-nagoya-2026-confirmado"
  },
  {
    id: 'ev-3',
    title: "Feira de Empregos Belltech: Hamamatsu e Toyohashi",
    date: "10 de Maio",
    location: "Hamamatsu / Toyohashi",
    description: "A Belltech Empregos promove um mutirão de recrutamento focado no setor automotivo e eletrônico. Com o aumento da demanda nas fábricas da região de Shizuoka, estão sendo oferecidas mais de 100 vagas imediatas. Os benefícios incluem suporte completo para visto, alojamento mobiliado e transporte. É necessário levar Zairyu Card e currículo atualizado em português ou japonês.",
    source: "Belltech Empregos",
    link: "https://www.facebook.com/belltech.empregosnojapao/posts/pfbid0Z6Xw"
  },
  {
    id: 'ev-4',
    title: "Congresso de Empreendedores Portal Mie",
    date: "18 de Maio",
    location: "Centro de Convenções de Yokkaichi",
    description: "Um dia inteiro dedicado ao networking e aprendizado para brasileiros que possuem ou desejam abrir negócios no Japão. As palestras abordarão desde o sistema tributário japonês até estratégias de marketing digital para nichos específicos. Especialistas em leis trabalhistas estarão disponíveis para consultoria rápida gratuita no hall principal.",
    source: "Portal Mie Business",
    link: "https://business.portalmie.com/noticia/workshop-previdencia-2026"
  },
  {
    id: 'ev-5',
    title: "Kanda Matsuri: O Festival da Divindade",
    date: "09-10 de Maio",
    location: "Santuário Kanda Myojin, Tóquio",
    description: "Um dos três grandes festivais de Edo. A celebração de 2026 marca um ciclo importante da divindade protetora da antiga Tóquio. Milhares de músicos e dançarinos percorrem os distritos comerciais de Kanda, Nihonbashi e Akihabara. É uma oportunidade única para ver o contraste entre o Japão ultramoderno da eletrônica e as tradições seculares dos templos xintoístas.",
    source: "Kyodo News",
    link: "https://english.kyodonews.net/news/2026/05/kanda-festival-highlights.html"
  }
];

export const NewsWidget: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState(JAPAN_EVENTS_MOCK);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRefreshingEvents, setIsRefreshingEvents] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'manual' | 'social' | 'events'>('feed');
  
  // ... (keeping manual forms states)
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [socialPlatform, setSocialPlatform] = useState<'facebook' | 'instagram'>('instagram');

  const fetchNews = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newAutoNews: NewsItem[] = [
        {
          id: 'auto-1-' + Date.now(),
          time: timestamp,
          title: "Iene Mostra Sinais de Recuperação",
          summary: "Moeda japonesa ganha força frente ao dólar após dados industriais positivos.",
          content: "O Iene japonês registrou uma valorização de 0.8% no fechamento desta manhã em Tóquio. Economistas do Nikkei indicam que o aumento inesperado na produção de semicondutores impulsionou a confiança dos investidores estrangeiros. Para o consumidor, isso pode significar uma leve redução nos preços de combustíveis e itens importados no médio prazo.",
          source: "Nikkei News",
          type: 'auto',
          link: "https://asia.nikkei.com/Economy/Yen-remains-steady-in-Asian-markets"
        },
        {
          id: 'auto-2-' + Date.now(),
          time: timestamp,
          title: "Novas Categorias de Visto 'Tokutei'",
          summary: "Governo amplia lista de profissionais que podem aplicar para residência.",
          content: "O Ministério da Justiça do Japão anunciou que novas categorias de entretenimento e artes digitais agora podem se qualificar para o visto de trabalhador qualificado (Tokutei Ginou). A medida visa atrair criadores de conteúdo e profissionais de design para revitalizar o setor criativo japonês. As inscrições para o novo processo seletivo começam no início do próximo mês.",
          source: "IPC Digital",
          type: 'auto',
          link: "https://www.ipcdigital.com/visa-rules-update-2026"
        },
        {
          id: 'auto-3-' + Date.now(),
          time: timestamp,
          title: "Monitoramento de Rodovias: Tōmei Express",
          summary: "Obras de manutenção causam lentidão na saída de Nagoya para Shizuoka.",
          content: "A concessionária NEXCO Central informou que trechos da Rodovia Tōmei passarão por recapeamento durante as próximas noites. Recomenda-se que motoristas brasileiros que fazem rotas logísticas entre Aichi e Tóquio planejem suas viagens com antecedência. A previsão de congestionamento é de até 15km nos horários de pico entre as 18h e 22h.",
          source: "Alternativa",
          type: 'auto',
          link: "https://www.alternativa.co.jp/Noticia/Categorias/Turismo/Golden-Week-Report-2026"
        },
        {
          id: 'auto-4-' + Date.now(),
          time: timestamp,
          title: "Segurança Alimentar no Japão: Novos Alertas",
          summary: "Órgão de saúde reforça diretrizes para rotulagem de alérgenos.",
          content: "A partir desta semana, as leis de rotulagem de alimentos em lojas de conveniência e supermercados tornam-se mais rigorosas. O alerta é especialmente importante para a comunidade estrangeira, facilitando a identificação de itens como amendoim e leite em embalagens prontas. O Portal Mie preparou um guia visual traduzido para ajudar brasileiros a identificar os novos símbolos.",
          source: "Portal Mie",
          type: 'auto',
          link: "https://www.portalmie.com/atualidade/shiga-saude-estrangeiros-2026"
        },
        {
          id: 'auto-5-' + Date.now(),
          time: timestamp,
          title: "Parceria Cultural Brasil-Japão 2026",
          summary: "Embaixada anuncia calendário de exposições artísticas para o segundo semestre.",
          content: "Em celebração aos laços bilaterais, uma série de exposições de arte contemporânea brasileira percorrerá as províncias de Gunma, Saitama e Hamamatsu. O objetivo é integrar a nova geração de descendentes através da arte, música e literatura. O lançamento oficial ocorrerá no próximo final de semana em um evento fechado para a imprensa em Minato-ku, Tóquio.",
          source: "Câmara de Comércio",
          type: 'auto',
          link: "https://www.ccbj.jp/eventos/nagoya-festival-2026"
        }
      ];

      setNews(prev => {
        const manualAndSocial = prev.filter(n => n.type !== 'auto');
        return [...newAutoNews, ...manualAndSocial].slice(0, 20);
      });
      setIsRefreshing(false);
    }, 800);
  };


  const refreshEvents = () => {
    setIsRefreshingEvents(true);
    setTimeout(() => {
      setEvents([...JAPAN_EVENTS_MOCK].sort(() => Math.random() - 0.5));
      setIsRefreshingEvents(false);
    }, 1000);
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 900000); 
    return () => clearInterval(interval);
  }, []);

  const addManualNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualContent) return;

    const newItem: NewsItem = {
      id: 'manual-' + Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: manualTitle,
      summary: manualContent.substring(0, 60) + '...',
      content: manualContent,
      source: 'Locutor / Manual',
      type: 'manual'
    };

    setNews(prev => [newItem, ...prev]);
    setManualTitle('');
    setManualContent('');
    setActiveTab('feed');
  };

  const addSocialLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialLink) return;

    const newItem: NewsItem = {
      id: 'social-' + Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: `${socialPlatform.toUpperCase()}: Referência Externa`,
      summary: socialLink,
      content: `Link social para acompanhamento direto (Portal Mie / Belltech): ${socialLink}`,
      source: socialPlatform === 'facebook' ? 'Facebook' : 'Instagram',
      type: 'social',
      link: socialLink
    };

    setNews(prev => [newItem, ...prev]);
    setSocialLink('');
    setActiveTab('feed');
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNews(prev => prev.filter(n => n.id !== id));
  };

  const openExternalLink = (url?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 rounded border border-studio-border overflow-hidden">
      <div className="bg-studio-panel/50 px-3 py-1.5 border-b border-studio-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 mr-2 shrink-0">
            <Newspaper size={10} className="text-studio-accent" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest italic whitespace-nowrap">Central de Notícias</span>
          </div>
          
          <nav className="flex gap-1">
            <button 
              onClick={() => setActiveTab('feed')}
              className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded transition-all whitespace-nowrap ${activeTab === 'feed' ? 'bg-studio-accent text-white' : 'hover:bg-white/5 opacity-50'}`}
            >
              Feed
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded transition-all whitespace-nowrap ${activeTab === 'events' ? 'bg-studio-accent text-white' : 'hover:bg-white/5 opacity-50'}`}
            >
              Eventos JP
            </button>
            <button 
              onClick={() => setActiveTab('manual')}
              className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded transition-all whitespace-nowrap ${activeTab === 'manual' ? 'bg-studio-accent text-white' : 'hover:bg-white/5 opacity-50'}`}
            >
              + Notícia
            </button>
            <button 
              onClick={() => setActiveTab('social')}
              className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded transition-all whitespace-nowrap ${activeTab === 'social' ? 'bg-studio-accent text-white' : 'hover:bg-white/5 opacity-50'}`}
            >
              + Social
            </button>
          </nav>
        </div>

        {activeTab === 'events' ? (
          <button 
            onClick={refreshEvents}
            disabled={isRefreshingEvents}
            className={`p-1 hover:bg-white/10 rounded transition-colors ${isRefreshingEvents ? 'animate-spin opacity-50' : ''}`}
            title="Atualizar Eventos"
          >
            <RefreshCw size={10} />
          </button>
        ) : (
          <button 
            onClick={fetchNews}
            disabled={isRefreshing}
            className={`p-1 hover:bg-white/10 rounded transition-colors ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
            title="Atualizar Notícias"
          >
            <RefreshCw size={10} />
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto studio-scroll p-3">
        {activeTab === 'feed' && (
          <div className="space-y-3">
            {news.map(item => (
              <div 
                key={item.id} 
                onClick={() => setSelectedNews(item)}
                className={`group relative space-y-1 cursor-pointer p-2 rounded transition-all border ${
                  item.type === 'manual' ? 'bg-studio-accent/5 border-studio-accent/20' : 
                  item.type === 'social' ? 'bg-blue-500/5 border-blue-500/20' : 
                  'bg-white/2 border-transparent hover:bg-white/5'
                } hover:border-studio-accent/40`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[7px] font-mono font-bold px-1 rounded uppercase ${
                      item.type === 'manual' ? 'bg-studio-accent text-white' : 
                      item.type === 'social' ? 'bg-blue-500 text-white' : 
                      'bg-studio-accent/20 text-studio-accent'
                    }`}>
                      {item.time} {item.type === 'auto' ? 'SATELLITE' : item.type?.toUpperCase()}
                    </span>
                    {item.type === 'social' && (
                      item.source === 'Facebook' ? <Facebook size={10} className="text-blue-500" /> : <Instagram size={10} className="text-pink-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.link && <LinkIcon size={8} className="opacity-40 group-hover:opacity-100 text-studio-accent" />}
                    <button 
                      onClick={(e) => deleteItem(item.id, e)}
                      className="opacity-0 group-hover:opacity-60 hover:text-studio-error transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                <h4 className={`text-[10px] font-bold uppercase tracking-tight leading-tight ${item.type === 'auto' ? 'text-white' : 'text-studio-accent'}`}>
                  {item.title}
                </h4>
                <p className="text-[9px] text-studio-text-dim leading-relaxed italic truncate">
                  {item.summary}
                </p>
                <span className="text-[7px] font-mono opacity-0 group-hover:opacity-100 transition-opacity text-studio-accent uppercase block mt-1">
                  ➞ Ler Notícia Completa
                </span>
              </div>
            ))}
            {news.length === 0 && <div className="text-center py-10 opacity-10 font-mono text-[9px]">Aguardando informações...</div>}
          </div>
        )}

        {activeTab === 'events' && (
           <div className="space-y-3 animate-in fade-in duration-300">
            {events.map(event => (
              <div 
                key={event.id} 
                onClick={() => setSelectedNews({
                  id: event.id,
                  time: event.date,
                  title: event.title,
                  summary: event.location,
                  content: `📍 Local: ${event.location}\n📅 Data: ${event.date}\n\n${event.description}`,
                  source: event.source,
                  type: 'auto',
                  link: event.link
                })}
                className="group bg-white/5 border border-white/5 p-2 rounded hover:border-studio-accent/30 transition-all cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[7px] font-mono font-bold text-studio-accent bg-studio-accent/10 px-1 rounded">
                    {event.date}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] font-mono opacity-30 uppercase">{event.source}</span>
                    <LinkIcon size={8} className="opacity-0 group-hover:opacity-100 text-studio-accent transition-opacity" />
                  </div>
                </div>
                <h4 className="text-[10px] font-bold text-white uppercase group-hover:text-studio-accent transition-colors">{event.title}</h4>
                <div className="text-[8px] opacity-60 mb-1">📍 {event.location}</div>
                <p className="text-[9px] text-studio-text-dim leading-tight italic line-clamp-2">
                  {event.description}
                </p>
                <div className="text-[7px] font-mono opacity-0 group-hover:opacity-100 transition-opacity text-studio-accent uppercase mt-1">
                  ➞ Ver Detalhes do Evento
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'manual' && (
          <form onSubmit={addManualNews} className="space-y-3 animate-in fade-in slide-in-from-top-1">
            <div className="space-y-1">
              <label className="text-[8px] font-mono uppercase opacity-50">Título da Notícia</label>
              <input 
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Ex: ACIDENTE NA BR-101..."
                className="w-full bg-black/40 border border-studio-border p-2 text-xs text-white focus:border-studio-accent outline-none rounded"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-mono uppercase opacity-50">Conteúdo Completo</label>
              <textarea 
                rows={4}
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                placeholder="Digite os detalhes para o locutor ler..."
                className="w-full bg-black/40 border border-studio-border p-2 text-xs text-white focus:border-studio-accent outline-none rounded resize-none"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-2 bg-studio-accent text-white text-[10px] font-bold uppercase rounded hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Send size={12} /> Postar no Feed
            </button>
          </form>
        )}

        {activeTab === 'social' && (
          <form onSubmit={addSocialLink} className="space-y-4 animate-in fade-in slide-in-from-top-1">
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setSocialPlatform('instagram')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[10px] font-bold uppercase transition-all ${socialPlatform === 'instagram' ? 'bg-pink-600 text-white' : 'bg-white/5 text-white/50 border border-white/5'}`}
              >
                <Instagram size={14} /> Instagram
              </button>
              <button 
                type="button"
                onClick={() => setSocialPlatform('facebook')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[10px] font-bold uppercase transition-all ${socialPlatform === 'facebook' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50 border border-white/5'}`}
              >
                <Facebook size={14} /> Facebook
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-[8px] font-mono uppercase opacity-50">Link do Post/Perfil</label>
              <div className="relative">
                <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                <input 
                  type="url"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  placeholder="https://facebook.com/belltech..."
                  className="w-full bg-black/40 border border-studio-border p-2 pl-9 text-xs text-white focus:border-studio-accent outline-none rounded"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase rounded hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={12} /> Adicionar Link Social
            </button>
            
            <p className="text-[8px] opacity-40 text-center uppercase tracking-tighter">
              Acompanhe Portal Mie Business e Belltech Empregos nos links de referência acima.
            </p>
          </form>
        )}
      </div>

      {/* Janela Flutuante (Modal) */}
      {selectedNews && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0a0a0a] border-2 border-studio-accent shadow-[0_0_50px_rgba(255,51,0,0.2)] rounded-xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header Estilo Broadcast */}
            <div className="bg-studio-accent text-white px-6 py-4 flex items-center justify-between border-b-4 border-black/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg animate-pulse">
                  <Newspaper size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] block leading-none opacity-70">
                    SISTEMA DE INFORMAÇÕES STUDIO 2026
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-tight">
                    {selectedNews.type === 'social' ? 'Monitoramento Social' : 'Boletim Informativo Digital'}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNews(null)}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto studio-scroll">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-studio-accent uppercase tracking-widest bg-studio-accent/5 self-start px-3 py-1 rounded border border-studio-accent/10">
                  <Calendar size={12} />
                  <span>{selectedNews.time}</span>
                  <span className="opacity-30">|</span>
                  <span>FONTE: {selectedNews.source}</span>
                </div>
                
                <h2 className="text-3xl font-black text-white leading-[1.1] uppercase tracking-tighter">
                  {selectedNews.title}
                </h2>
              </div>
              
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-studio-accent/30 rounded-full" />
                <div className="text-lg text-studio-text leading-relaxed whitespace-pre-wrap font-medium bg-white/2 p-6 rounded-lg border border-white/5 shadow-inner">
                  {selectedNews.content}
                </div>
              </div>

              {selectedNews.link && (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] uppercase font-mono opacity-40">Link de Apoio para o Locutor:</p>
                  <a 
                    href={selectedNews.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-3 bg-studio-accent/10 text-studio-accent border border-studio-accent/20 rounded-lg text-xs font-black uppercase hover:bg-studio-accent/20 transition-all group"
                  >
                    <LinkIcon size={14} className="group-hover:rotate-12 transition-transform" /> 
                    Abrir Portal Externo Completo
                  </a>
                </div>
              )}

              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-studio-accent animate-ping" />
                  <span className="text-[9px] font-mono opacity-30 uppercase">Transmissão Ativa via Satélite</span>
                </div>
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase rounded-lg transition-all"
                >
                  Fechar Boletim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
