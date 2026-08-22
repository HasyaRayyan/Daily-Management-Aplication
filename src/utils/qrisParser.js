export function parseQris(qrisString) {
  if (!qrisString || typeof qrisString !== 'string') return null;
  
  const result = {
    merchantName: '',
    amount: null,
    isValid: false
  };

  try {
    let index = 0;
    while (index < qrisString.length) {
      // Pastikan ada sisa cukup untuk membaca tag dan length (4 karakter)
      if (index + 4 > qrisString.length) break;

      const tag = qrisString.substring(index, index + 2);
      const lengthStr = qrisString.substring(index + 2, index + 4);
      const length = parseInt(lengthStr, 10);
      
      // Validasi panjang tidak melebihi sisa string
      if (isNaN(length) || index + 4 + length > qrisString.length) {
        break;
      }

      const value = qrisString.substring(index + 4, index + 4 + length);
      
      // Tag 59 = Merchant Name (Nama Toko)
      if (tag === '59') {
        result.merchantName = value;
      } 
      // Tag 54 = Transaction Amount (Nominal)
      else if (tag === '54') {
        result.amount = parseFloat(value);
      }
      // Tag 00 = Payload Format Indicator (Penanda Awal QRIS EMVCo)
      else if (tag === '00' && value === '01') {
        result.isValid = true; 
      }
      
      index += 4 + length;
    }
  } catch (err) {
    console.error('Gagal membedah QRIS:', err);
    return null;
  }

  // Jika tidak ditemukan nama merchant dan bukan standar EMVCo, anggap tidak valid
  if (!result.merchantName && !result.isValid) return null;

  return result;
}
