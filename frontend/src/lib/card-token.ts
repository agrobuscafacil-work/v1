'use client';

export interface CardInput {
  number: string;
  holderName: string;
  expMonth: string;
  expYear: string;
  securityCode: string;
  identification?: string;
}

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

function detectBrand(number: string): string {
  const n = number.replace(/\D/g, '');
  if (/^3[47]/.test(n)) return 'amex';
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'master';
  if (/^(4011|4312|4389|4514|4573|5041|5066|5090|6277|6362|6363|650|6516|6550)/.test(n)) return 'elo';
  return 'visa';
}

function loadMercadoPagoScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.MercadoPago) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar o SDK do Mercado Pago'));
    document.head.appendChild(script);
  });
}

async function tokenizeWithMercadoPago(card: CardInput, publicKey: string): Promise<string> {
  await loadMercadoPagoScript();
  const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
  const payload: Record<string, string> = {
    cardholderName: card.holderName,
    cardNumber: card.number.replace(/\s/g, ''),
    expirationMonth: card.expMonth,
    expirationYear: card.expYear,
    securityCode: card.securityCode,
  };
  if (card.identification) {
    const digits = card.identification.replace(/\D/g, '');
    payload.identificationType = digits.length > 11 ? 'CNPJ' : 'CPF';
    payload.identificationNumber = digits;
  }
  const token = await mp.fields.createCardToken(payload);
  return typeof token === 'string' ? token : token.id;
}

export async function getCardToken(card: CardInput): Promise<string> {
  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
  if (publicKey) {
    return tokenizeWithMercadoPago(card, publicKey);
  }
  const digits = card.number.replace(/\D/g, '');
  const last4 = digits.slice(-4);
  const brand = detectBrand(digits);
  return `mock-approved:${last4}:${brand}`;
}

export { detectBrand };