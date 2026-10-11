/**
 * T.C. Kimlik Numarası Algoritmik Doğrulama Motoru
 * Nüfus ve Vatandaşlık İşleri Genel Müdürlüğü kurallarına göre matematiksel denetim.
 */

export interface TcValidationResult {
  isValid: boolean;
  normalized: string;
  reason?: string;
  digitBreakdown?: {
    oddSum: number;
    evenSum: number;
    calculatedTenth: number;
    actualTenth: number;
    calculatedEleventh: number;
    actualEleventh: number;
  };
}

/**
 * 11 Haneli TCKN Doğrulama Fonksiyonu
 */
export function validateTcKimlik(tc: string): TcValidationResult {
  const normalized = tc.trim().replace(/\s+/g, '');

  if (!/^\d{11}$/.test(normalized)) {
    return {
      isValid: false,
      normalized,
      reason: 'TCKN tam 11 rakamdan oluşmalıdır.',
    };
  }

  const digits = normalized.split('').map(Number);

  if (digits[0] === 0) {
    return {
      isValid: false,
      normalized,
      reason: 'İlk hane 0 olamaz.',
    };
  }

  // 1, 3, 5, 7, 9. haneler (0, 2, 4, 6, 8. indisler)
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  // 2, 4, 6, 8. haneler (1, 3, 5, 7. indisler)
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  // 10. hane formülü: ((oddSum * 7) - evenSum) mod 10
  const calculatedTenth = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
  const actualTenth = digits[9];

  if (calculatedTenth !== actualTenth) {
    return {
      isValid: false,
      normalized,
      reason: `10. hane denetimi başarısız (Beklenen: ${calculatedTenth}, Gerçek: ${actualTenth}).`,
      digitBreakdown: {
        oddSum,
        evenSum,
        calculatedTenth,
        actualTenth,
        calculatedEleventh: -1,
        actualEleventh: digits[10],
      },
    };
  }

  // 11. hane formülü: İlk 10 hanenin toplamının mod 10'u
  const sumFirst10 = digits.slice(0, 10).reduce((acc, curr) => acc + curr, 0);
  const calculatedEleventh = sumFirst10 % 10;
  const actualEleventh = digits[10];

  if (calculatedEleventh !== actualEleventh) {
    return {
      isValid: false,
      normalized,
      reason: `11. hane toplam denetimi başarısız (Beklenen: ${calculatedEleventh}, Gerçek: ${actualEleventh}).`,
      digitBreakdown: {
        oddSum,
        evenSum,
        calculatedTenth,
        actualTenth,
        calculatedEleventh,
        actualEleventh,
      },
    };
  }

  return {
    isValid: true,
    normalized,
    digitBreakdown: {
      oddSum,
      evenSum,
      calculatedTenth,
      actualTenth,
      calculatedEleventh,
      actualEleventh,
    },
  };
}

/**
 * Metin içerisindeki tüm potansiyel TCKN'leri tespit edip doğrular
 */
export function extractAndValidateTCKNs(text: string): Array<{
  tckn: string;
  startIndex: number;
  endIndex: number;
  isValidChecksum: boolean;
}> {
  const results: Array<{
    tckn: string;
    startIndex: number;
    endIndex: number;
    isValidChecksum: boolean;
  }> = [];

  // 11 haneli sayıları bul (kelime sınırları ile)
  const regex = /\b[1-9]\d{10}\b/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const candidate = match[0];
    const validation = validateTcKimlik(candidate);

    results.push({
      tckn: candidate,
      startIndex: match.index,
      endIndex: match.index + candidate.length,
      isValidChecksum: validation.isValid,
    });
  }

  return results;
}
