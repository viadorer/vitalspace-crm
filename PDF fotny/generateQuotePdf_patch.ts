// ============================================================
// PATCH pro generateQuotePdf.ts - přidání UTF-8 české podpory
// ============================================================
// 
// 1. Na začátek souboru přidej import:
import { registerRobotoFont, setRoboto } from './pdfFonts';
//    (cesta záleží na umístění souboru v projektu)
//
// 2. Na začátek funkce generateQuotePdf(), ihned po vytvoření doc:

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  // --- PŘIDEJ TYTO 2 ŘÁDKY ---
  registerRobotoFont(doc);
  setRoboto(doc, 'normal');
  // ---------------------------

// 3. Všude kde měníš font/styl, použij setRoboto místo doc.setFont:
//
//    PŘED:  doc.setFont('helvetica', 'bold');
//    PO:    setRoboto(doc, 'bold');
//
//    PŘED:  doc.setFont('helvetica', 'normal');
//    PO:    setRoboto(doc, 'normal');

// 4. Pro jspdf-autotable - přidej styles do autoTable volání:
  autoTable(doc, {
    // ... tvé stávající options ...
    styles: {
      font: 'Roboto',
      fontStyle: 'normal',
    },
    headStyles: {
      font: 'Roboto',
      fontStyle: 'bold',
    },
    bodyStyles: {
      font: 'Roboto',
      fontStyle: 'normal',
    },
  });
