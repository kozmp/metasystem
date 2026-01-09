/**
 * @fileoverview Formularz Receptor Input - punkt wejścia do systemu KMS
 * @cybernetic Receptor - transformacja surowego tekstu na strukturę cybernetyczną
 */

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import type { ReceptorInputState } from '../../lib/cybernetics/efektor/types';

interface ReceptorInputFormProps {
  onProcessComplete?: () => void;
}

// Dostępne modele AI
const AVAILABLE_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', name: '🤖 Claude 3.5 Sonnet (OpenRouter)', provider: 'openrouter' },
  { id: 'openai/gpt-4o', name: '🧠 GPT-4o (OpenRouter)', provider: 'openrouter' },
  { id: 'google/gemini-flash-1.5', name: '⚡ Gemini Flash 1.5 (OpenRouter)', provider: 'openrouter' },
  { id: 'gemini-direct', name: '✨ Gemini 2.5 Flash (Direct API)', provider: 'gemini' },
];

export function ReceptorInputForm({ onProcessComplete }: ReceptorInputFormProps) {
  const [state, setState] = useState<ReceptorInputState>({
    text: '',
    is_processing: false,
    result: undefined,
    model: 'anthropic/claude-3.5-sonnet', // Domyślny model
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.text.trim()) {
      return;
    }

    setState(prev => ({ ...prev, is_processing: true, result: undefined }));

    try {
      const response = await fetch('/api/receptor/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: state.text,
          model: state.model  // Dodaj wybrany model
        }),
      });

      const result = await response.json();

      setState(prev => ({
        ...prev,
        is_processing: false,
        result,
      }));

      if (result.success && onProcessComplete) {
        onProcessComplete();
      }
    } catch (error) {
      console.error('[EFEKTOR] Błąd przetwarzania sygnału:', error);
      setState(prev => ({
        ...prev,
        is_processing: false,
        result: {
          success: false,
          objects_created: 0,
          relations_created: 0,
          error: 'Błąd komunikacji z serwerem',
        },
      }));
    }
  };

  const handleClear = () => {
    setState({
      text: '',
      is_processing: false,
      result: undefined,
    });
  };

  return (
    <div className="card-terminal p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-terminal-accent uppercase tracking-wider mb-2">
          [RECEPTOR] Analiza Sygnału Wejściowego
        </h2>
        <p className="text-sm text-terminal-muted">
          Wprowadź tekst do analizy. System wyekstrahuje obiekty cybernetyczne i relacje sterownicze.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dropdown wyboru modelu */}
        <div>
          <label htmlFor="model-select" className="block text-sm text-terminal-accent mb-2 uppercase tracking-wider">
            Model AI:
          </label>
          <select
            id="model-select"
            value={state.model}
            onChange={(e) => setState(prev => ({ ...prev, model: e.target.value }))}
            disabled={state.is_processing}
            className="input-terminal w-full"
          >
            {AVAILABLE_MODELS.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-terminal-muted">
            {state.model === 'gemini-direct' 
              ? '✨ Direct Google API - Wymaga GEMINI_API_KEY'
              : '🔄 OpenRouter API - Wymaga OPENROUTER_API_KEY'}
          </div>
        </div>

        <div>
          <label htmlFor="signal-input" className="block text-sm text-terminal-accent mb-2 uppercase tracking-wider">
            Sygnał wejściowy:
          </label>
          <textarea
            id="signal-input"
            value={state.text}
            onChange={(e) => setState(prev => ({ ...prev, text: e.target.value }))}
            disabled={state.is_processing}
            className="input-terminal min-h-[200px] resize-y"
            placeholder="Wklej tutaj tekst do analizy (np. artykuł, dokument, opis systemu)..."
          />
          <div className="mt-1 text-xs text-terminal-muted">
            Znaki: {state.text.length} | Min. 100 znaków zalecane
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={state.is_processing || state.text.length < 10}
            className="btn-terminal flex items-center gap-2"
          >
            {state.is_processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Trwa analiza korelacyjna...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Przetworz sygnał
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={state.is_processing}
            className="btn-terminal"
          >
            Wyczyść
          </button>
        </div>

        {/* Wyniki przetwarzania */}
        {state.result && (
          <div className={`p-4 border ${
            state.result.success 
              ? 'border-feedback-positive bg-feedback-positive/10' 
              : 'border-feedback-negative bg-feedback-negative/10'
          }`}>
            <div className="flex items-start gap-3">
              {state.result.success ? (
                <CheckCircle2 className="w-5 h-5 text-feedback-positive flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-feedback-negative flex-shrink-0 mt-0.5" />
              )}
              
              <div className="flex-1">
                {state.result.success ? (
                  <>
                    <h3 className="font-bold text-feedback-positive mb-2">
                      ✓ Sygnał przetworzony pomyślnie
                    </h3>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-terminal-muted">Obiekty utworzone:</span>{' '}
                        <span className="text-terminal-text font-bold">{state.result.objects_created}</span>
                      </div>
                      <div>
                        <span className="text-terminal-muted">Relacje utworzone:</span>{' '}
                        <span className="text-terminal-text font-bold">{state.result.relations_created}</span>
                      </div>
                      {state.result.certainty_score !== undefined && (
                        <div>
                          <span className="text-terminal-muted">Rzetelność:</span>{' '}
                          <span className={`font-bold ${
                            state.result.certainty_score >= 0.7 
                              ? 'text-feedback-positive' 
                              : state.result.certainty_score >= 0.4 
                              ? 'text-feedback-neutral' 
                              : 'text-feedback-negative'
                          }`}>
                            {(state.result.certainty_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-feedback-negative mb-2">
                      ✗ Błąd przetwarzania sygnału
                    </h3>
                    <p className="text-sm text-terminal-text">
                      {state.result.error || 'Nieznany błąd'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

