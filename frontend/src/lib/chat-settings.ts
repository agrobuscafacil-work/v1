export interface ChatSettings {
  online: boolean;
  autoReplyEnabled: boolean;
  autoReplyMessage: string;
  welcomeMessage: string;
}

const SETTINGS_KEY = 'agro_chat_settings';

const defaults: ChatSettings = {
  online: true,
  autoReplyEnabled: true,
  autoReplyMessage: 'Obrigado pelo contato! Responderemos em breve.',
  welcomeMessage: 'Olá! Bem-vindo(a) à nossa loja. Como podemos ajudar?',
};

export function getChatSettings(): ChatSettings {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export function saveChatSettings(settings: Partial<ChatSettings>): ChatSettings {
  const current = getChatSettings();
  const updated = { ...current, ...settings };
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  }
  return updated;
}
