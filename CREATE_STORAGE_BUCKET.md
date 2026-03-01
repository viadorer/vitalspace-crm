# Vytvoření Storage Bucketu pro Dokumenty

## Supabase Dashboard - Manuální vytvoření

### Krok 1: Přihlášení
1. Otevři [Supabase Dashboard](https://supabase.com/dashboard)
2. Vyber projekt **Vitalspace CRM**

### Krok 2: Storage
1. V levém menu klikni na **Storage**
2. Klikni na tlačítko **"New Bucket"** (vpravo nahoře)

### Krok 3: Nastavení bucketu
Vyplň následující pole:

- **Name**: `documents`
- **Public bucket**: ✅ **Zaškrtni** (bucket bude veřejný)
- **File size limit**: `52428800` (50 MB v bajtech)
- **Allowed MIME types**: `application/pdf`

### Krok 4: Vytvoření
Klikni na tlačítko **"Create bucket"**

---

## Ověření

Po vytvoření bucketu:
1. V Storage sekci by se měl zobrazit bucket `documents`
2. Zkus nahrát PDF přes aplikaci na `/crm/documents`
3. Upload by měl fungovat bez chyb

---

## Poznámky

- Bucket **nelze** vytvořit přes SQL migraci kvůli RLS policies
- Bucket **musí** být veřejný (`public: true`) pro zobrazení PDF v prohlížeči
- Aplikace automaticky ukládá soubory do struktury: `{category}/{timestamp}_{filename}`
  - Např: `presentation/1772397536125_VitalSpace_Hotele.pdf`

---

## Troubleshooting

### Error: "Bucket already exists"
✅ Bucket je již vytvořen, můžeš nahrávat dokumenty

### Error: "new row violates row-level security policy"
❌ Bucket ještě není vytvořen - následuj kroky výše

### Error: 400 při uploadu
- Zkontroluj, že bucket `documents` existuje
- Zkontroluj, že je bucket nastavený jako **public**
- Zkontroluj MIME type restrictions (mělo by být `application/pdf`)
