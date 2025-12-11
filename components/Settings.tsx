import React, { useState, useEffect } from 'react';
import { IconDeviceFloppy, IconKey, IconTrash, IconExternalLink } from '@tabler/icons-react';

export const Settings: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('gemini_api_key');
        if (stored) setApiKey(stored);
    }, []);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem('gemini_api_key', apiKey.trim());
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    const handleClear = () => {
        localStorage.removeItem('gemini_api_key');
        setApiKey('');
    };

    return (
        <div className="max-w-2xl mx-auto pt-8">
            <div className="bg-gray-1 border border-gray-5 rounded-md shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-4 pb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-3 text-blue flex items-center justify-center">
                        <IconKey size={20} stroke={2} />
                    </div>
                    <div>
                         <h2 className="text-lg font-medium text-gray-12">Configuração da API</h2>
                         <p className="text-xs text-gray-9">Gerencie sua conexão com o Gemini</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-11 mb-2">
                            Gemini API Key
                        </label>
                        <div className="relative">
                            <input 
                                type="password" 
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Cole sua chave API aqui (AIza...)"
                                className="w-full h-11 px-3 rounded-sm border border-gray-6 bg-gray-2 text-gray-12 focus:border-blue focus:ring-1 focus:ring-blue outline-none transition-all placeholder:text-gray-7 font-mono text-sm"
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-9">
                                Sua chave é armazenada localmente no navegador.
                            </p>
                            <a 
                                href="https://aistudio.google.com/app/apikey" 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs text-blue hover:text-blue-10 font-medium transition-colors"
                            >
                                Obter chave gratuita
                                <IconExternalLink size={12} />
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-4">
                        <button 
                            onClick={handleSave}
                            disabled={!apiKey.trim()}
                            className={`
                                h-9 px-4 flex items-center gap-2 text-sm font-medium rounded-sm transition-all shadow-sm
                                ${!apiKey.trim() 
                                    ? 'bg-gray-4 text-gray-8 cursor-not-allowed' 
                                    : 'bg-blue text-white hover:bg-blue-10'
                                }
                            `}
                        >
                            <IconDeviceFloppy size={16} />
                            {saved ? 'Salvo com sucesso!' : 'Salvar Alterações'}
                        </button>
                        
                        {localStorage.getItem('gemini_api_key') && (
                            <button 
                                onClick={handleClear}
                                className="h-9 px-4 flex items-center gap-2 bg-white border border-gray-5 text-gray-11 text-sm font-medium rounded-sm hover:bg-red-3 hover:text-red-9 hover:border-red-3 transition-colors ml-auto"
                            >
                                <IconTrash size={16} />
                                Remover Chave
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};