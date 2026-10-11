/**
 * Luhn (Mod 10) Algoritması & Kredi Kartı Doğrulama Motoru
 * ISO/IEC 7812 standardına göre kredi kartı numaralarının matematiksel kontrolü.
 */

export interface CardValidationResult {
  isValid: boolean;
  brand: 'VISA' | 'MASTERCARD' | 'AMEX' | 'TROY' | 'DISCOVER' | 'UNKNOWN';
  normalized: string;
  checksumSum: number;
  reason?: string;
}

/**
 * Luhn Algoritması Kontrolü (Mod 10)
 */
export function validateLuhn(cardNumber: string): CardValidationResult {
  const normalized = cardNumber.replace(/[\s-]/g, '');

  if (!/^\d{13,19}$/.test(normalized)) {
    return {
      isValid: false,
      brand: 'UNKNOWN',
      normalized,
      checksumSum: -1,
      reason: 'Kart numarası 13 ile 19 hane arasında rakamlardan oluşmalıdır.',
    };
  }

  let brand: CardValidationResult['brand'] = 'UNKNOWN';
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(normalized)) {
    brand = 'VISA';
  } else if (/^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$/.test(normalized)) {
    brand = 'MASTERCARD';
  } else if (/^3[47][0-9]{13}$/.test(normalized)) {
    brand = 'AMEX';
  } else if (/^9792[0-9]{12}$/.test(normalized)) {
    brand = 'TROY';
  } else if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(normalized)) {
    brand = 'DISCOVER';
  }

  // Luhn hesaplaması
  let sum = 0;
  let isSecond = false;

  for (let i = normalized.length - 1; i >= 0; i--) {
    let d = parseInt(normalized.charAt(i), 10);

    if (isSecond) {
      d = d * 2;
      if (d > 9) {
        d -= 9;
      }
    }

    sum += d;
    isSecond = !isSecond;
  }

  const isValid = sum % 10 === 0;

  return {
    isValid,
    brand,
    normalized,
    checksumSum: sum,
    reason: isValid ? undefined : `Luhn toplamı (${sum}) mod 10'a tam bölünmüyor.`,
  };
}

/**
 * Metin içerisindeki kredi kartı paternlerini tespit eder ve Luhn ile doğrular
 */
export function extractCreditCards(text: string): Array<{
  raw: string;
  normalized: string;
  startIndex: number;
  endIndex: number;
  validation: CardValidationResult;
}> {
  const results: Array<{
    raw: string;
    normalized: string;
    startIndex: number;
    endIndex: number;
    validation: CardValidationResult;
  }> = [];

  // 13-19 haneli kart formatları (boşluk veya tire içerebilir)
  const regex = /\b(?:\d[ -]?){13,19}\b/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    const normalized = raw.replace(/[\s-]/g, '');

    // Çok uzun veya salt ardışık tekrarları ele
    if (normalized.length >= 13 && normalized.length <= 19) {
      const validation = validateLuhn(normalized);
      if (validation.isValid) {
        results.push({
          raw,
          normalized,
          startIndex: match.index,
          endIndex: match.index + raw.length,
          validation,
        });
      }
    }
  }

  return results;
}
