-- ============================================================================
-- VITALSPACE CRM — Rozšířené segmenty a targety
-- ============================================================================
-- Spustit PO hlavním schématu (vitalspace_crm_schema.sql)
-- Nahrazuje původní seed data v sekci 22
-- ============================================================================

-- Smazat původní seed data segmentů (pokud existují)
TRUNCATE company_segments CASCADE;

INSERT INTO company_segments (name, target_pain_point, recommended_approach) VALUES 

-- ── VZDĚLÁVÁNÍ ──────────────────────────────────────────────────────────────
('Základní školy',
 'Vysoká absence žáků v chřipkové sezóně, šíření virů v uzavřených třídách, formaldehyd z nového nábytku',
 'Clean Up do každé třídy (režim osvěžovač přes den, dezinfekce v noci) + Clean Box do sborovny + PRO I PLUS pro tělocvičnu a jídelnu. Argumentovat snížením absence o 20-30%.'),

('Mateřské školy',
 'Sdílení hraček, časté nemoci malých dětí, legislativní tlak na hygienu, alergeny',
 'Clean Up do heren + Clean Box na hračky a lůžkoviny. Klíčový argument: bezchemická dezinfekce bezpečná pro děti.'),

('Střední a vysoké školy',
 'Velké přednáškové sály, sdílené laboratoře, koleje, knihovny',
 'PRO I PLUS pro auly a laboratoře + Clean Up do menších učeben. Koleje: PRO I PLUS mobilně mezi patry.'),

('Jazykové školy a vzdělávací centra',
 'Malé učebny s vysokou rotací lidí, sdílené pomůcky, intenzivní provoz',
 'Clean Up do učeben + Clean Box na sdílené materiály. Argument: zdravé prostředí = lepší recenze.'),

-- ── ZDRAVOTNICTVÍ ───────────────────────────────────────────────────────────
('Nemocnice a kliniky',
 'Nozokomiální infekce, sterilita operačních sálů, legislativní požadavky na kvalitu vzduchu',
 'Kompletní řešení s certifikací. Clean Up do pokojů + PRO I PLUS pro dezinfekci mezi operacemi. Důraz na protokoly a měřitelné výsledky.'),

('Ambulance a ordinace',
 'Křížová kontaminace mezi pacienty, čekárny jako ohniska nákaz',
 'Clean Up do ordinací a čekáren + Clean Box na nástroje a pomůcky. Argument: ochrana personálu i pacientů.'),

('Stomatologické ordinace',
 'Aerosoly při zákrocích, sterilita prostředí, obavy pacientů z nákazy',
 'Clean Up do ordinace + Clean Box na otiskové lžíce a pomůcky. Premium positioning: "certifikovaně čistý vzduch".'),

('Lékárny',
 'Vysoká rotace nemocných zákazníků, ochrana farmaceutů, kontaminace povrchů',
 'Clean Up do prodejní plochy + Clean Box na vrácené pomůcky. Jednoduchá instalace, rychlý ROI.'),

('Domovy seniorů a LDN',
 'Imunokompromitovaní obyvatelé, chronické infekce, zápachy, legislativní kontroly',
 'Clean Up do pokojů a společných prostor + PRO I PLUS pro jídelny. Argument: snížení mortality a ATB spotřeby.'),

('Veterinární kliniky',
 'Zápachy, patogeny přenosné mezi zvířaty, dezinfekce čekáren a operačních prostor',
 'PRO I PLUS pro ordinace (mobilní mezi místnostmi) + Clean Box na transportní boxy a vodítka.'),

-- ── KOMERČNÍ PROSTORY ───────────────────────────────────────────────────────
('Kanceláře a coworkingová centra',
 'Sick building syndrom, formaldehyd z nábytku, únava a snížená produktivita zaměstnanců',
 'Clean Up do open-space a zasedacích místností. ROI přes produktivitu: 1% méně sick days = X Kč úspora.'),

('IT a technologické firmy',
 'Serverovny (prach), open-space s vysokou hustotou lidí, employer branding',
 'Clean Up do kanceláří + argument ESG a employee wellbeing. Tech firmy slyší na data a měření.'),

('Call centra',
 'Extrémní hustota lidí na m², sdílené headsety, vysoká nemocnost = výpadky směn',
 'Clean Up do každé sekce + Clean Box na headsety a sdílené vybavení. ROI: každý sick day = ztráta X hovorů.'),

('Banky a finanční instituce',
 'Pobočky s vysokou frekvencí klientů, reprezentativní prostředí, ESG závazky',
 'Clean Up do poboček + PRO I PLUS pro archívy a trezorové místnosti. Argument: ESG reporting, ochrana zaměstnanců.'),

-- ── PRŮMYSL A LOGISTIKA ─────────────────────────────────────────────────────
('Výrobní podniky',
 'VOC z výrobních procesů, zápachy, kontaminace produktů, BOZP požadavky',
 'PRO I PLUS pro výrobní haly (kalkulace dle m³) + Clean Up do kancelářské části. Argument: BOZP compliance.'),

('Potravinářský průmysl',
 'Kontaminace potravin plísněmi, legislativní požadavky HACCP, prodloužení trvanlivosti',
 'PRO I PLUS pro sklady a výrobní linky. Ozon prokazatelně ničí plísně a prodlužuje shelf life. Certifikace klíčová.'),

('Sklady a logistická centra',
 'Zápachy, plísně, kontaminace zboží při dlouhodobém skladování',
 'PRO I PLUS mobilně mezi sektory. Kalkulace dle celkového objemu. Argument: ochrana skladovaného zboží.'),

('Autoservisy a autodílny',
 'Výpary z chemikálií, olejů a barev, BOZP, zápachy v interiérech aut',
 'PRO I PLUS pro dílnu + Clean Box pro čištění interiérů aut (doplňková služba pro zákazníky servisu).'),

('Prádelny a čistírny',
 'Zápachy, bakterie v textilu, chemické výpary z čisticích prostředků',
 'PRO I PLUS pro provozní prostory + Clean Box pro finální dezinfekci delikátních textilií.'),

-- ── HOSPITALITY A GASTRO ────────────────────────────────────────────────────
('Hotely',
 'Zápachy v pokojích po hostech (kouř, jídlo), kvalita vzduchu, recenze na Booking/Airbnb',
 'Clean Up do pokojů (režim osvěžovač) + PRO I PLUS pro lobby a konferenční sály. Argument: lepší recenze = vyšší occupancy.'),

('Restaurace a kavárny',
 'Zápachy z kuchyně, kontaminace povrchů, hygiena pro hosty',
 'PRO I PLUS pro noční dezinfekci prostor + Clean Box pro jídelní lístky a sdílené předměty. Argument: hygienický certifikát.'),

('Penziony a Airbnb',
 'Rychlý turnaround mezi hosty, eliminace pachů, diferenciace od konkurence',
 'PRO I PLUS mobilně mezi jednotkami. Nízká investice, okamžitý efekt. Argument: "Ozonově čištěný pokoj" jako USP.'),

('Vinařství a pivovary',
 'Plísně v sudových skladech, kontaminace kvasných procesů, zápachy',
 'PRO I PLUS pro sklepy a skladovací prostory. Ozon eliminuje plísně bez chemie — klíčové pro bio producenty.'),

-- ── SPORT A VOLNÝ ČAS ───────────────────────────────────────────────────────
('Fitness centra a posilovny',
 'Zápachy v šatnách, bakterie na strojích, pot a vlhkost',
 'PRO I PLUS pro noční dezinfekci + Clean Box pro rukavice a pásky. Argument: členové ocení čisté prostředí.'),

('Sportovní haly a stadiony',
 'Velké prostory, šatny, zápachy, vysoká rotace sportovců',
 'PRO I PLUS pro haly a šatny (mobilně) + Clean Box pro sdílené vybavení (chrániče, helmy). Kalkulace dle m³.'),

('Bazény a aquaparky',
 'Plísně v šatnách a sprchách, chlorové výpary, kvalita vzduchu v hale',
 'PRO I PLUS pro šatny a technické zázemí. Ozon jako doplněk k chlorové dezinfekci — snižuje potřebu chemie.'),

('Jóga a pilates studia',
 'Sdílené podložky a pomůcky, intimní prostředí, zápachy při hot józe',
 'Clean Up do studia + Clean Box na podložky a bloky. Argument: klienti wellness segmentu očekávají prémiovou hygienu.'),

-- ── VEŘEJNÝ SEKTOR ──────────────────────────────────────────────────────────
('Městské a krajské úřady',
 'Přepážky s vysokou frekvencí občanů, staré budovy, špatná ventilace',
 'Clean Up do klientských prostor + PRO I PLUS pro archivy. Argument: ochrana úředníků, public health.'),

('Knihovny a kulturní centra',
 'Plísně na knihách, staré budovy, alergeny, zápachy',
 'PRO I PLUS pro depozitáře a studovny + Clean Box pro vzácné knihy. Ozon eliminuje plísně bez poškození papíru.'),

('Hasiči a záchranné složky',
 'Kontaminovaná výstroj po zásazích, karcinogeny v oblečení, dezinfekce vozidel',
 'Clean Box XL pro dezinfekci výstroje + PRO I PLUS pro šatny a garáže. Argument: ochrana zdraví hasičů.'),

('Věznice a detenční zařízení',
 'Přeplněné prostory, šíření infekcí, zápachy, omezené možnosti ventilace',
 'PRO I PLUS pro cely a společné prostory (noční režim) + Clean Box pro osobní věci. Bezchemický přístup klíčový.'),

-- ── DOPRAVA ─────────────────────────────────────────────────────────────────
('Dopravní podniky (MHD)',
 'Dezinfekce autobusů a tramvají mezi směnami, zápachy, sezónní epidemie',
 'PRO I PLUS mobilně do dep pro noční dezinfekci vozidel. Jeden přístroj = desítky vozidel za noc.'),

('Taxislužby a carsharing',
 'Rychlá dezinfekce mezi jízdami, zápachy, očekávání zákazníků post-covid',
 'Clean Box pro dezinfekci sedáků a volantu + PRO I PLUS do garáží. Argument: hygienický certifikát pro vozy.'),

-- ── MALOOBCHOD ──────────────────────────────────────────────────────────────
('Obchodní centra',
 'Vysoká frekvence návštěvníků, food courty, zápachy, HVAC systémy jako šiřitelé nákaz',
 'Clean Up do HVAC systémů + PRO I PLUS pro food courty a zázemí. Argument: facility management = nižší sick rate nájemců.'),

('Second handy a charitativní obchody',
 'Zápachy z darovaného oblečení, plísně, alergeny, zákaznický komfort',
 'Clean Box na dezinfekci oblečení před prodejem + PRO I PLUS pro sklad. Nízkonákladové řešení s vysokým dopadem.'),

('Květinářství a zahradní centra',
 'Plísně na rostlinách, zvýšená vlhkost, zápachy z kompostu',
 'PRO I PLUS pro skleníky a sklady. Ozon eliminuje plísně bez pesticidů — argument pro bio segment.'),

-- ── SPECIÁLNÍ SEGMENTY ──────────────────────────────────────────────────────
('Pojišťovny (likvidace škod)',
 'Klienti po požárech a záplavách potřebují dekontaminaci prostor, zápachy, plísně',
 'Partnerství: Vitalspace jako doporučený dodavatel dekontaminace. PRO I PLUS pro zásahy. Referral fee model.'),

('Realitní kanceláře',
 'Byty po problémových nájemnících, zápachy, prezentace nemovitostí v nejlepším světle',
 'PRO I PLUS jako služba před prodejem/pronájmem. Partnerský model: "Ozonově certifikovaný byt" jako prodejní argument.'),

('Pohřební služby',
 'Zápachy, dezinfekce prostor a vozidel, důstojné prostředí pro pozůstalé',
 'PRO I PLUS pro zázemí + Clean Up do obřadních síní. Diskrétní přístup, důraz na profesionalitu.'),

('Muzea a galerie',
 'Plísně na exponátech, klimatizace jako šiřitel spor, ochrana sbírek',
 'Clean Up do výstavních prostor (nízká koncentrace, kontinuální) + PRO I PLUS pro depozitáře. Argument: ochrana kulturního dědictví.'),

('Filmová a TV studia',
 'Sdílené kostýmy a rekvizity, make-up prostory, uzavřené prostory s mnoha lidmi',
 'Clean Box na kostýmy a rekvizity + PRO I PLUS pro studia mezi natáčením.'),

('Svatební a eventové prostory',
 'Rychlý turnaround mezi akcemi, zápachy, květinové alergeny, prestiž',
 'PRO I PLUS pro dezinfekci mezi eventy + Clean Up do přípravných místností. Argument: prémiová hygiena pro prémiové akce.'),

('Datacentra a serverovny',
 'Prach jako příčina výpadků, kontaminace filtrů, požární riziko z prachu',
 'Clean Up do serverových místností (nízký výkon, kontinuální) + PRO I PLUS pro údržbové cykly. Argument: uptime a ochrana investice.'),

('Laboratoře a výzkumná centra',
 'Křížová kontaminace vzorků, sterilita prostředí, chemické výpary',
 'Clean Up do laboratoří + PRO I PLUS pro dekontaminační cykly. Certifikace a měření jako standard.');
