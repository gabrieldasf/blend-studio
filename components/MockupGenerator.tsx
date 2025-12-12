import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    IconPhoto, 
    IconWand, 
    IconDownload, 
    IconLoader2, 
    IconX, 
    IconShirt, 
    IconMug, 
    IconShoppingBag, 
    IconSticker, 
    IconAd,
    IconRefresh,
    IconMaximize,
    IconDeviceLaptop,
    IconBox,
    IconId,
    IconBottle,
    IconFrame
} from '@tabler/icons-react';
import { generateMockup } from '../services/geminiService';
import { MockupItem, ProcessStatus } from '../types';

// --- Sub-components ---

const PresetOption: React.FC<{ 
    label: string; 
    icon: React.ReactNode; 
    selected: boolean; 
    onClick: () => void 
}> = ({ label, icon, selected, onClick }) => (
    <button 
        onClick={onClick}
        className={`
            flex flex-col items-center justify-center gap-2 p-3 rounded-md border transition-all h-24
            ${selected 
                ? 'bg-blue-3 border-blue text-blue' 
                : 'bg-gray-1 border-gray-5 text-gray-9 hover:border-blue-7 hover:bg-gray-2'
            }
        `}
    >
        <div className={selected ? 'text-blue' : 'text-gray-8'}>{icon}</div>
        <span className="text-xs font-medium text-center leading-tight">{label}</span>
    </button>
);

const ImageViewer: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="relative max-w-5xl max-h-full" onClick={e => e.stopPropagation()}>
            <img src={url} alt="Expanded" className="max-w-full max-h-[90vh] rounded-md shadow-superHeavy" />
            <button 
                onClick={onClose}
                className="absolute -top-4 -right-4 h-8 w-8 bg-white rounded-full flex items-center justify-center text-gray-12 shadow-md hover:bg-gray-2"
            >
                <IconX size={16} />
            </button>
        </div>
    </div>
);

// --- Main Component ---

export const MockupGenerator: React.FC = () => {
    // State
    const [queue, setQueue] = useState<MockupItem[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Actions ---

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleClearInput = () => {
        setImageFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const applyPreset = (presetName: string, presetPrompt: string) => {
        setSelectedPreset(presetName);
        setPrompt(presetPrompt);
    };

    const addToQueue = () => {
        if (!imageFile || !prompt.trim()) return;

        const newItem: MockupItem = {
            id: Math.random().toString(36).substring(7),
            originalFile: imageFile, // Keep reference to file
            previewUrl: previewUrl!, // Keep reference to blob
            prompt: prompt,
            status: ProcessStatus.IDLE,
            createdAt: Date.now()
        };

        setQueue(prev => [newItem, ...prev]);
        
        // Reset inputs partially (optional UX choice, keeping file allows rapid generation)
        // handleClearInput(); 
        // setPrompt(''); 
    };

    const handleRetry = (item: MockupItem) => {
        const newItem: MockupItem = {
            ...item,
            id: Math.random().toString(36).substring(7),
            status: ProcessStatus.IDLE,
            createdAt: Date.now(),
            resultUrl: undefined,
            error: undefined
        };
        setQueue(prev => [newItem, ...prev]);
    };

    const handleRemove = (id: string) => {
        setQueue(prev => prev.filter(i => i.id !== id));
    };

    // --- Processing Loop ---
    
    useEffect(() => {
        const processQueue = async () => {
            const idleItems = queue.filter(i => i.status === ProcessStatus.IDLE);
            if (idleItems.length === 0) return;

            // Mark idle items as processing immediately to prevent double pick-up
            setQueue(prev => prev.map(item => 
                item.status === ProcessStatus.IDLE ? { ...item, status: ProcessStatus.PROCESSING } : item
            ));

            // Process concurrently
            idleItems.forEach(async (item) => {
                try {
                    const url = await generateMockup(item.originalFile, item.prompt);
                    setQueue(prev => prev.map(i => 
                        i.id === item.id ? { ...i, status: ProcessStatus.COMPLETED, resultUrl: url } : i
                    ));
                } catch (err: any) {
                    setQueue(prev => prev.map(i => 
                        i.id === item.id ? { ...i, status: ProcessStatus.ERROR, error: err.message || 'Falha na geração' } : i
                    ));
                }
            });
        };

        processQueue();
    }, [queue]);


    // --- Presets Data ---

    const presets = [
        { id: 'shirt', label: 'Camiseta', icon: <IconShirt size={24} />, prompt: "Uma camiseta de algodão preta de alta qualidade dobrada em uma superfície de concreto, iluminação dramática de estúdio, a arte aplicada no peito." },
        { id: 'mug', label: 'Caneca', icon: <IconMug size={24} />, prompt: "Uma caneca de cerâmica branca minimalista sobre uma mesa de madeira clara, iluminação suave de janela, estilo revista de design." },
        { id: 'laptop', label: 'Notebook', icon: <IconDeviceLaptop size={24} />, prompt: "Um laptop ultra-fino prateado aberto em uma mesa de escritório moderna com uma planta ao fundo, a arte aplicada como papel de parede na tela." },
        { id: 'totebag', label: 'Ecobag', icon: <IconShoppingBag size={24} />, prompt: "Uma ecobag de tecido cru (canvas) pendurada no ombro de uma pessoa caminhando na rua, foto estilo lifestyle urbano." },
        { id: 'box', label: 'Caixa', icon: <IconBox size={24} />, prompt: "Uma caixa de produto quadrada (packaging) com acabamento fosco em cima de um pódio branco, iluminação de estúdio profissional suave." },
        { id: 'card', label: 'Cartões', icon: <IconId size={24} />, prompt: "Cartões de visita minimalistas espalhados artisticamente sobre uma superfície de pedra escura, iluminação dramática e foco seletivo." },
        { id: 'bottle', label: 'Garrafa', icon: <IconBottle size={24} />, prompt: "Uma garrafa de água esportiva de alumínio ou aço inoxidável em um cenário de academia ou lifestyle, iluminação natural, reflexos realistas." },
        { id: 'sticker', label: 'Adesivo', icon: <IconSticker size={24} />, prompt: "Um adesivo die-cut brilhante colado na tampa de um notebook de alumínio prateado, foco raso, alta resolução." },
        { id: 'frame', label: 'Quadro', icon: <IconFrame size={24} />, prompt: "Um poster emoldurado com moldura fina preta pendurado em uma parede de tijolos brancos, estilo galeria de arte contemporânea." },
        { id: 'outdoor', label: 'Outdoor', icon: <IconAd size={24} />, prompt: "Um outdoor publicitário moderno em uma avenida movimentada de uma grande cidade, dia ensolarado, perspectiva realista de baixo para cima." },
    ];

    return (
        <div className="flex flex-col gap-8 pb-12">
            {viewerUrl && <ImageViewer url={viewerUrl} onClose={() => setViewerUrl(null)} />}

            <header className="flex flex-col gap-1">
                <h2 className="text-lg font-medium text-gray-12">Gerador de Mockups</h2>
                <p className="text-sm text-gray-9">Crie variações de produtos realistas em paralelo.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* --- Left Column: Controls (4 cols) --- */}
                <div className="lg:col-span-4 space-y-6 bg-white p-5 rounded-md border border-gray-5 shadow-sm sticky top-6">
                    
                    {/* 1. Upload */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-9">1. Upload da Arte</label>
                        {!previewUrl ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="h-32 border border-dashed border-gray-6 rounded-md bg-gray-2 hover:bg-gray-3 hover:border-blue transition-colors cursor-pointer flex flex-col items-center justify-center text-gray-9 gap-2"
                            >
                                <IconPhoto size={24} />
                                <span className="text-xs">Selecionar Imagem</span>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                />
                            </div>
                        ) : (
                            <div className="relative h-32 rounded-md border border-gray-5 overflow-hidden group bg-gray-1 flex items-center justify-center">
                                <img src={previewUrl} alt="Preview" className="h-full object-contain" />
                                <button 
                                    onClick={handleClearInput}
                                    className="absolute top-2 right-2 p-1.5 bg-gray-12 text-white rounded-sm hover:bg-red-9 transition-colors"
                                >
                                    <IconX size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 2. Preset Selector */}
                    <div className="space-y-2">
                         <label className="text-xs font-semibold uppercase tracking-wider text-gray-9">2. Escolha o Produto</label>
                         <div className="grid grid-cols-3 gap-2">
                            {presets.map(p => (
                                <PresetOption 
                                    key={p.id}
                                    label={p.label}
                                    icon={p.icon}
                                    selected={selectedPreset === p.id}
                                    onClick={() => applyPreset(p.id, p.prompt)}
                                />
                            ))}
                         </div>
                    </div>

                    {/* 3. Custom Prompt */}
                    <div className="space-y-2">
                         <label className="text-xs font-semibold uppercase tracking-wider text-gray-9">3. Ajustes (Opcional)</label>
                         <textarea 
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value);
                                setSelectedPreset(null); // Deselect preset if editing manually
                            }}
                            className="w-full h-24 p-3 rounded-md border border-gray-6 bg-gray-2 text-sm text-gray-12 focus:border-blue outline-none resize-none"
                            placeholder="Descreva o cenário..."
                         />
                    </div>

                    {/* Generate Button */}
                    <button 
                        onClick={addToQueue}
                        disabled={!imageFile || !prompt}
                        className={`
                            w-full h-10 flex items-center justify-center gap-2 rounded-sm font-medium text-sm transition-all shadow-sm
                            ${!imageFile || !prompt 
                                ? 'bg-gray-4 text-gray-8 cursor-not-allowed' 
                                : 'bg-blue text-white hover:bg-blue-10'
                            }
                        `}
                    >
                        <IconWand size={18} />
                        Adicionar à Fila
                    </button>
                </div>

                {/* --- Right Column: Results Stream (8 cols) --- */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-4">
                        <h3 className="text-sm font-medium text-gray-12">Resultados Recentes</h3>
                        {queue.length > 0 && (
                            <button onClick={() => setQueue([])} className="text-xs text-red-9 hover:underline">Limpar tudo</button>
                        )}
                    </div>

                    {queue.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-4 rounded-md bg-gray-2/50">
                            <IconPhoto size={32} className="text-gray-7 mb-3" />
                            <p className="text-sm text-gray-9 font-medium">Sua galeria de mockups está vazia</p>
                            <p className="text-xs text-gray-8">Gere imagens para ver a mágica acontecer</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {queue.map((item) => (
                                <div key={item.id} className="bg-white border border-gray-5 rounded-md shadow-light overflow-hidden flex flex-col">
                                    {/* Header */}
                                    <div className="p-3 border-b border-gray-4 flex items-center gap-2 bg-gray-2">
                                        <div className="h-6 w-6 rounded-sm border border-gray-5 overflow-hidden bg-white shrink-0">
                                            <img src={item.previewUrl} className="w-full h-full object-cover" alt="Source" />
                                        </div>
                                        <p className="text-xs text-gray-11 truncate flex-1" title={item.prompt}>
                                            {item.prompt}
                                        </p>
                                        <button onClick={() => handleRemove(item.id)} className="text-gray-8 hover:text-red-9">
                                            <IconX size={14} />
                                        </button>
                                    </div>

                                    {/* Content Area */}
                                    <div className="aspect-[4/3] bg-gray-1 relative flex items-center justify-center group">
                                        
                                        {item.status === ProcessStatus.PROCESSING && (
                                            <div className="flex flex-col items-center gap-2 text-blue">
                                                <IconLoader2 size={24} className="animate-spin" />
                                                <span className="text-xs font-medium">Criando Mockup...</span>
                                            </div>
                                        )}

                                        {item.status === ProcessStatus.ERROR && (
                                            <div className="flex flex-col items-center gap-2 text-red-9 p-4 text-center">
                                                <IconX size={24} />
                                                <span className="text-xs">{item.error}</span>
                                                <button 
                                                    onClick={() => handleRetry(item)}
                                                    className="mt-2 text-xs underline"
                                                >
                                                    Tentar Novamente
                                                </button>
                                            </div>
                                        )}

                                        {item.status === ProcessStatus.COMPLETED && item.resultUrl && (
                                            <>
                                                <img 
                                                    src={item.resultUrl} 
                                                    alt="Result" 
                                                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                                    onClick={() => setViewerUrl(item.resultUrl!)}
                                                />
                                                
                                                {/* Overlay Actions */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                                                    <a 
                                                        href={item.resultUrl} 
                                                        download={`mockup_${item.id}.png`}
                                                        className="h-9 px-3 bg-white text-gray-12 rounded-sm text-xs font-medium flex items-center gap-1.5 hover:bg-gray-2 transition-colors shadow-lg"
                                                    >
                                                        <IconDownload size={14} />
                                                        Baixar
                                                    </a>
                                                    <button 
                                                        onClick={() => setViewerUrl(item.resultUrl!)}
                                                        className="h-9 w-9 bg-white text-gray-12 rounded-sm flex items-center justify-center hover:bg-gray-2 transition-colors shadow-lg"
                                                        title="Expandir"
                                                    >
                                                        <IconMaximize size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRetry(item)}
                                                        className="h-9 w-9 bg-white text-gray-12 rounded-sm flex items-center justify-center hover:bg-gray-2 transition-colors shadow-lg"
                                                        title="Gerar Novamente"
                                                    >
                                                        <IconRefresh size={14} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};