import { jsPDF } from 'jspdf';
import { ROBOTO_REGULAR_BASE64, ROBOTO_BOLD_BASE64 } from './robotoFonts';

/**
 * Přidá Roboto font s plnou UTF-8/českou podporou do jsPDF instance.
 * Volat ihned po vytvoření `new jsPDF()`.
 */
export function registerRobotoFont(doc: jsPDF): void {
  doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_REGULAR_BASE64);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

  doc.addFileToVFS('Roboto-Bold.ttf', ROBOTO_BOLD_BASE64);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
}

/**
 * Nastaví Roboto jako aktivní font.
 * weight: 'normal' | 'bold'
 */
export function setRoboto(doc: jsPDF, weight: 'normal' | 'bold' = 'normal'): void {
  doc.setFont('Roboto', weight);
}
