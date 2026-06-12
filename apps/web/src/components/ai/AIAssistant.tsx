'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface AIAssistantProps {
  onInsert: (content: string) => void;
  selectedPlatform: string;
}

const tones = [
  { value: 'professional', label: '💼 Professional', desc: 'Clear and authoritative' },
  { value: 'casual', label: '😊 Casual', desc: 'Friendly and relatable' },
  { value: 'humorous', label: '😄 Humorous', desc: 'Witty and entertaining' },
  { value: 'inspirational', label: '✨ Inspirational', desc: 'Motivating and uplifting' },
  { value: 'educational', label: '📚 Educational', desc: 'Informative and valuable' },
];

export default function AIAssistant({ onInsert, selectedPlatform }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await api.generateAIPost({
        prompt,
        platform: selectedPlatform,
        tone,
      });
      setGeneratedContent(res.data.content);
      setHashtags(res.data.hashtags);
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsert = () => {
    const fullContent = hashtags.length > 0
      ? `${generatedContent}\n\n${hashtags.join(' ')}`
      : generatedContent;
    onInsert(fullContent);
    setIsOpen(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ai-toggle-btn"
        title="AI Writing Assistant"
      >
        <span className="ai-sparkle">✨</span>
        <span>AI Assistant</span>
      </button>

      {/* Slide-out Panel */}
      <div className={`ai-panel ${isOpen ? 'ai-panel-open' : ''}`}>
        <div className="ai-panel-header">
          <div className="ai-panel-title">
            <span className="ai-sparkle-lg">✨</span>
            <div>
              <h3>AI Writing Assistant</h3>
              <p>Let AI craft the perfect post for you</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="ai-close-btn">✕</button>
        </div>

        <div className="ai-panel-body">
          {/* Prompt Input */}
          <div className="ai-section">
            <label className="ai-label">What do you want to post about?</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Announce our new product launch, share tips for productivity, celebrate a milestone..."
              className="ai-textarea"
              rows={3}
            />
          </div>

          {/* Tone Selector */}
          <div className="ai-section">
            <label className="ai-label">Tone</label>
            <div className="tone-grid">
              {tones.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`tone-chip ${tone === t.value ? 'tone-chip-active' : ''}`}
                >
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="ai-generate-btn"
          >
            {isGenerating ? (
              <>
                <span className="ai-spinner" />
                Generating...
              </>
            ) : (
              <>
                <span>🪄</span>
                Generate Post
              </>
            )}
          </button>

          {/* Generated Result */}
          {generatedContent && (
            <div className="ai-result">
              <div className="ai-result-header">
                <span>Generated Content</span>
                <button onClick={handleGenerate} className="ai-regen-btn" title="Regenerate">
                  🔄
                </button>
              </div>
              <div className="ai-result-content">
                {generatedContent}
              </div>
              {hashtags.length > 0 && (
                <div className="ai-hashtags">
                  {hashtags.map((tag, i) => (
                    <span key={i} className="ai-hashtag">{tag}</span>
                  ))}
                </div>
              )}
              <button onClick={handleInsert} className="ai-insert-btn">
                ✅ Use This Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && <div className="ai-backdrop" onClick={() => setIsOpen(false)} />}
    </>
  );
}
