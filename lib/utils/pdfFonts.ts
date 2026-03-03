import type jsPDF from 'jspdf'

// Roboto Regular font v base64 (zkrácená verze pro demo)
// Pro produkci by měl být celý font, ale to je ~50KB base64
// Alternativně můžeme použít CDN nebo local file
const ROBOTO_REGULAR_BASE64 = ''

// Fallback: použijeme courier, který má alespoň základní latin extended
export function setupPdfFonts(doc: jsPDF): void {
  // Pro teď použijeme courier jako fallback
  // V budoucnu přidáme vlastní font s plnou UTF-8 podporou
  doc.setFont('courier')
}

// Helper pro escapování českých znaků do ASCII fallback
export function escapeForPdf(text: string): string {
  // Mapa českých znaků na ASCII ekvivalenty
  const charMap: Record<string, string> = {
    'á': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'ě': 'e',
    'í': 'i', 'ň': 'n', 'ó': 'o', 'ř': 'r', 'š': 's',
    'ť': 't', 'ú': 'u', 'ů': 'u', 'ý': 'y', 'ž': 'z',
    'Á': 'A', 'Č': 'C', 'Ď': 'D', 'É': 'E', 'Ě': 'E',
    'Í': 'I', 'Ň': 'N', 'Ó': 'O', 'Ř': 'R', 'Š': 'S',
    'Ť': 'T', 'Ú': 'U', 'Ů': 'U', 'Ý': 'Y', 'Ž': 'Z',
  }
  
  return text.split('').map(char => charMap[char] || char).join('')
}
