-- ============================================================================
-- VITALSPACE CRM — Další segmenty (doplněk k vitalspace_segments_extended.sql)
-- ============================================================================
-- Spustit PO extended segmentech
-- ============================================================================

INSERT INTO company_segments (name, target_pain_point, recommended_approach) VALUES 

-- ════════════════════════════════════════════════════════════════════════════
-- DOPRAVA A MOBILITA (rozšířeno)
-- ════════════════════════════════════════════════════════════════════════════

('Železniční dopravci (ČD, RegioJet, Leo Express)',
 'Dezinfekce vagonů mezi spoji trvá příliš dlouho chemicky, zápachy v toaletách a kupé, textilní sedačky akumulují bakterie a alergeny, sezónní epidemie mezi cestujícími',
 'PRO I PLUS do dep pro noční šokovou dezinfekci celých souprav. Jeden přístroj projede vagon za 30-60 min. Clean Box na sedací potahy a záclony. Argument: úspora chemie + rychlejší turnaround.'),

('Metro a podzemní dráha (DPP)',
 'Uzavřený systém s omezenou ventilací, miliony cestujících denně, tunelový prach s karcinogeny, plísně na stanicích',
 'PRO I PLUS pro noční dezinfekci stanic a vozů v depu. Clean Up do kancelářských prostor stanic a dispečinků. Argument: public health ve stísněném prostoru.'),

('Autobusoví dopravci (dálková doprava)',
 'Zápach po dlouhých trasách, klimatizace jako šiřitel patogenů, omezená výměna vzduchu za jízdy, textilní sedačky',
 'PRO I PLUS v garáži: dezinfekce celého autobusu přes noc. Clean Box pro opěrky hlavy a potahy. Argument: hygiena jako konkurenční výhoda (FlixBus, ČSAD).'),

('Tramvajové a trolejbusové depa',
 'Každodenní dezinfekce vozového parku, zápachy, biologická kontaminace madel a sedaček',
 'PRO I PLUS mobilně v depu — jeden přístroj obsluhuje celou řadu vozidel za noční směnu. Argument: náhrada chemických dezinfekčních prostředků.'),

('Letecké společnosti (kabiny letadel)',
 'Recirkulovaný vzduch v kabině, noroviry a chřipka mezi cestujícími, zápachy, turnaround time na gate max 45 min',
 'PRO I PLUS pro hangárovou dezinfekci při údržbě + Clean Box pro dezinfekci přikrývek, sluchátek a headrestů. Partnerství s MRO poskytovateli.'),

('Letištní provozovatelé (terminály)',
 'Gate oblasti s tisíci cestujících denně, duty free zóny, VIP lounges, toalety, ventilační systémy',
 'Clean Up do VIP lounge a business prostor + PRO I PLUS pro noční dezinfekci gate oblastí. Argument: mezinárodní hygienické standardy, IATA doporučení.'),

('Hangáry a MRO centra (údržba letadel)',
 'Chemické výpary z laků a lepidel, VOC z kompozitních materiálů, BOZP limity, uzavřené prostory',
 'PRO I PLUS pro dekontaminaci po lakování a lepení. Ozon rozloží VOC bez reziduí. Argument: BOZP compliance + čistší prostředí pro techniky.'),

('Lodní doprava a přístavy',
 'Plísně v podpalubí, zápachy v kajutách výletních lodí, kontaminace nákladu vlhkostí, dezinfekce kontejnerů',
 'PRO I PLUS pro kajuty a nákladové prostory + Clean Box pro záchranné vesty a vybavení. Argument: prevence legionelly v klimatizaci lodi.'),

('Pronájem obytných vozů a karavanů',
 'Zápachy po nájemcích, plísně z vlhkosti, textilie v malém uzavřeném prostoru, rychlý turnaround mezi pronájmy',
 'PRO I PLUS: dezinfekce celého karavanu za 1 hodinu. Clean Box na lůžkoviny. Argument: "ozonově dezinfikováno" jako prémiová služba.'),

('Lodní přístavy a jachtkluby',
 'Plísně v podpalubí jachet, zápachy, vlhkost, uskladnění lodí přes zimu',
 'PRO I PLUS pro winterizaci — dezinfekce před zakonzervováním. Argument: ochrana interiéru lodi během zimní pauzy.'),

-- ════════════════════════════════════════════════════════════════════════════
-- POTRAVINÁŘSTVÍ A ZEMĚDĚLSTVÍ (rozšířeno)
-- ════════════════════════════════════════════════════════════════════════════

('Pekárny a cukrárny',
 'Plísně na stěnách a stropech od vlhkosti a tepla, kontaminace těsta, HACCP požadavky, moučný prach',
 'PRO I PLUS pro noční dezinfekci výrobních prostor. Ozon eliminuje plísně bez chemie — žádné rezidua na potravinách. Argument: prodloužení shelf life pečiva.'),

('Řeznictví a masný průmysl',
 'Bakteriální kontaminace (Salmonella, Listeria, E.coli), zápachy, přísné hygienické normy SVS',
 'PRO I PLUS pro chladírny a bourárny. Ozon prokazatelně redukuje bakteriální zátěž na površích. Argument: doplněk k HACCP, snížení reklamací.'),

('Mlékárny a sýrárny',
 'Plísně (žádoucí na sýrech, nežádoucí jinde), křížová kontaminace, zápachy, čištění zásobníků',
 'PRO I PLUS pro zrací sklepy a skladovací prostory. Cílená aplikace — ozon zabije nežádoucí plísně bez poškození žádoucích kultur při správném dávkování.'),

('Vinné sklepy a ležácké tanky pivovarů',
 'Plísně na stěnách kamenných sklepů, kontaminace sudů, TCA (zátka) ve vinárnách, octové bakterie',
 'PRO I PLUS pro dezinfekci sklepů a skladů. Ozon eliminuje TCA a plísně bez chemie. Argument: ochrana investice do vína — jedna zkažená šarže = statisíce.'),

('Sklady ovoce a zeleniny',
 'Ethylen urychluje zrání, plísně na ovoci, krátká trvanlivost, ztráty při skladování 10-30%',
 'PRO I PLUS pro kontrolované atmosféry. Ozon rozkládá ethylen a eliminuje plísně — prodlouží trvanlivost o 30-50%. Argument: ROI spočitatelný v tunách zachráněného zboží.'),

('Chovy a farmy (drůbež, prasata)',
 'Amoniak, sirovodík, patogeny (ptačí chřipka, salmonela), vysoká úmrtnost kuřat, BOZP pracovníků',
 'PRO I PLUS pro dezinfekci hal mezi turnusy. Ozon eliminuje patogeny bez reziduí na krmivech. Argument: snížení mortality o 5-10% = obrovská úspora.'),

('Skleníky a indoor farmy',
 'Padlí, plísně, škůdci, chemické pesticidy kontaminují produkci, bio certifikace vyžaduje bezchemické metody',
 'PRO I PLUS pro noční dezinfekci skleníků. Ozon jako alternativa k pesticidům — kompatibilní s bio certifikací. Argument: nulové rezidua.'),

('Včelařské provozy',
 'Varroáza, nosematóza, dezinfekce úlů a rámků, plísně na mezistěnách',
 'Clean Box pro dezinfekci rámků a včelařského vybavení. PRO I PLUS pro dezinfekci zimovišť. Argument: bez chemie — bezpečné pro včely.'),

-- ════════════════════════════════════════════════════════════════════════════
-- BYDLENÍ A SPRÁVA NEMOVITOSTÍ
-- ════════════════════════════════════════════════════════════════════════════

('Správci bytových domů a SVJ',
 'Plísně ve sklepích a společných prostorách, zápachy ve výtazích, kontaminace po haváriích vody',
 'PRO I PLUS pro dezinfekci společných prostor a sklepů. Argument: prevence plísní = ochrana majetku vlastníků. Jednorázová služba nebo roční smlouva.'),

('Developerské projekty (novostavby)',
 'Formaldehyd a VOC z nových materiálů (podlahy, nábytek, barvy) — sick building syndrom v prvním roce',
 'PRO I PLUS pro "New Home Detox" před kolaudací. Ozon rozloží formaldehyd a VOC. Argument: developer nabízí "zdravý byt" jako prémiovou službu.'),

('Pojišťovny — likvidace škod po požárech',
 'Zápachy ze spálenin pronikají do zdí a textilií, saze, karcinogenní zplodiny, traumatizovaní klienti',
 'PRO I PLUS pro šokovou dezinfekci vyhořelých prostor. Ozon eliminuje zápach ze spálenin, kde běžná chemie selhává. Partnerství s likvidátory.'),

('Pojišťovny — likvidace škod po záplavách',
 'Plísně do 48 hodin po zatopení, kontaminace odpadními vodami, vlhkost ve zdech měsíce',
 'PRO I PLUS opakovaně v intervalu 3-7 dnů během vysoušení. Ozon zabije plísně ve stěnách. Argument: prevence demolice — ozon může zachránit celou stavbu.'),

('Ubytovny a azylové domy',
 'Přeplněnost, zápachy, šíření infekcí (svrab, TBC), omezený rozpočet na hygienu',
 'PRO I PLUS pro pravidelnou dezinfekci pokojů. Clean Box na matrace a lůžkoviny. Argument: bezchemická dezinfekce = nižší provozní náklady dlouhodobě.'),

-- ════════════════════════════════════════════════════════════════════════════
-- ZÁBAVA A KULTURA
-- ════════════════════════════════════════════════════════════════════════════

('Kina a divadla',
 'Textilní sedačky akumulují bakterie a zápachy, uzavřený prostor s desítkami/stovkami lidí, popcornový zápach',
 'PRO I PLUS pro noční dezinfekci sálů. Clean Up do foyer a VIP lóží. Argument: eliminace zápachu + zdraví diváků.'),

('Koncertní haly a kluby',
 'Extrémní hustota lidí, pot, kouř (kde legální), zápachy, zvýšená vlhkost',
 'PRO I PLUS po každé akci. Ozon eliminuje zápachy za 1-2 hodiny. Argument: ráno je prostor čistý pro další akci bez chemie.'),

('Escape roomy a zábavní centra',
 'Malé uzavřené místnosti s vysokou rotací skupin, pot, stres, dotyky všech povrchů',
 'Clean Up do místností (kontinuální nízká dávka mezi hrami) + PRO I PLUS pro noční totální dezinfekci. Argument: hygiena = lepší recenze.'),

('Kasina a herny',
 'Cigaretový kouř (kde povoleno), uzavřené prostory 24/7, zápachy, textilní povrchy stolů',
 'PRO I PLUS pro ranní dezinfekci po noční směně + Clean Up do VIP salonků. Ozon eliminuje cigaretový zápach jako nic jiného.'),

('Bowlingové a billiardové herny',
 'Sdílená obuv a koule, zápachy z obuvi, klimatizace, jídlo v kombinaci se sportem',
 'Clean Box na půjčovanou obuv (cyklus 15 min) + PRO I PLUS pro noční dezinfekci. Argument: sdílená obuv = hygienické riziko.'),

-- ════════════════════════════════════════════════════════════════════════════
-- PÉČE O TĚLO A WELLNESS
-- ════════════════════════════════════════════════════════════════════════════

('Kadeřnictví a holičství',
 'Vlasy a kožní částice ve vzduchu, sdílené nástroje, chemické výpary z barev a laku',
 'Clean Up do salonu + Clean Box na kartáče, hřebeny a strojky. Argument: zdraví kadeřnic (chronická expozice chemii).'),

('Kosmetické a masážní salony',
 'Intimní kontakt s klientem, sdílená lehátka, oleje a krémy, přenos kožních infekcí',
 'Clean Up do kabinek + Clean Box na ručníky a pomůcky. Argument: prémiová hygiena = prémiová cena služby.'),

('Tetovací a piercing studia',
 'Krev a tělní tekutiny, sterilita prostředí, legislativní požadavky KHS, obavy klientů',
 'Clean Up do studia + Clean Box na nevratné pomůcky a povrchy. Argument: doplněk ke sterilizaci — komplexní přístup k hygieně.'),

('Sauna a wellness centra',
 'Plísně z vlhkosti, legionella v rozvodech, zápachy v odpočívárnách, textilní lehátka',
 'PRO I PLUS pro noční dezinfekci odpočíváren a šaten. Clean Up do relaxačních místností. Argument: ozon + vlhko = synergický účinek na plísně.'),

('Solária',
 'Pot a kožní buňky na lehátkách, uzavřené kabiny, vysoká teplota = ideální prostředí pro bakterie',
 'Clean Up do kabin (dezinfekce mezi klienty v automatickém cyklu). Argument: automatická dezinfekce bez manuální práce personálu.'),

-- ════════════════════════════════════════════════════════════════════════════
-- VZDĚLÁVÁNÍ A PÉČE O DĚTI (rozšířeno)
-- ════════════════════════════════════════════════════════════════════════════

('Dětské koutky v obchodních centrech',
 'Extrémní rotace dětí, sdílené hračky a prolézačky, nemocné děti od rodičů "na nákupu"',
 'Clean Box na hračky (cyklus každé 2 hodiny) + Clean Up do prostoru. Argument: rodič svěří dítě tam, kde vidí certifikát hygieny.'),

('Dětské tábory a střediska volného času',
 'Společné ložnice, sdílené vybavení, omezená hygiena v přírodě, sezónní provoz',
 'PRO I PLUS pro dezinfekci ložnic mezi turnusy + Clean Box na spacáky a karimatky. Argument: méně nemocných dětí = spokojení rodiče = plné turnusy.'),

('Internáty a koleje',
 'Sdílené pokoje, společné kuchyňky a koupelny, zápachy, plísně, vandalismus hygieny',
 'Clean Up do společných prostor + PRO I PLUS pro turnusovou dezinfekci pokojů. Argument: snížení stížností studentů.'),

-- ════════════════════════════════════════════════════════════════════════════
-- SPECIFICKÉ PRŮMYSLOVÉ APLIKACE
-- ════════════════════════════════════════════════════════════════════════════

('Tiskárny a polygrafický průmysl',
 'VOC z tiskařských barev a ředidel, toluenové výpary, BOZP limity, chronická expozice pracovníků',
 'PRO I PLUS pro noční dekontaminaci tiskáren. Ozon rozkládá VOC a toluenové sloučeniny. Argument: BOZP compliance + zdraví zaměstnanců.'),

('Lakování a povrchové úpravy',
 'Izokyanáty, VOC z laků a rozpouštědel, rakovinotvorné výpary, filtrační systémy nestačí',
 'PRO I PLUS pro dekontaminaci lakovacích boxů po směně. Argument: doplněk k odsávání — ozon rozloží to, co filtr nezachytí.'),

('Čistírny odpadních vod',
 'Sirovodík, merkaptany, amoniak — extrémní zápachy, BOZP rizika, stížnosti okolních obyvatel',
 'PRO I PLUS průmyslově nasazený pro eliminaci zápachu v administrativních budovách ČOV. Argument: kvalita prostředí pro zaměstnance.'),

('Odpadové hospodářství a třídírny',
 'Biologický odpad = bakterie, plísně, zápachy, hmyz, BOZP extrémně náročné prostředí',
 'PRO I PLUS pro dezinfekci třídíren a sociálního zázemí. Argument: snížení nemocnosti zaměstnanců v extrémních podmínkách.'),

('Cementárny a vápenky',
 'Prach kontaminující dýchací cesty, silikóza, uzavřené řídicí místnosti potřebují čistý vzduch',
 'Clean Up do řídicích místností a kanceláří. Argument: ochrana klíčových zaměstnanců (operátoři, management).'),

('Farmaceutický průmysl',
 'Cleanroom požadavky, křížová kontaminace šarží, validace čisticích procesů, GMP compliance',
 'PRO I PLUS pro validovanou dekontaminaci prostor mezi šaržemi. Ozon jako validovatelná alternativa k H₂O₂. Argument: kratší downtime mezi šaržemi.'),

('Konopné farmy a growshopy',
 'Plísně na rostlinách (botrytis, padlí), kontaminace finálního produktu, legislativní požadavky na čistotu',
 'PRO I PLUS pro preventivní dezinfekci growroomů. Ozon eliminuje plísně bez chemie — klíčové pro farmaceutické konopí. Argument: čistota produktu.'),

-- ════════════════════════════════════════════════════════════════════════════
-- ARMÁDA, BEZPEČNOST A KRIZOVÉ ŘÍZENÍ
-- ════════════════════════════════════════════════════════════════════════════

('Armáda ČR — kasárna a výcvikové prostory',
 'Společné ubytovny, sdílená výstroj, zápachy, přenosné nemoci v uzavřených kolektivech',
 'PRO I PLUS pro dezinfekci ubytoven a skladů výstroje + Clean Box na přilby, vesty a obuv. Argument: bojeschopnost = zdraví vojáků.'),

('Policie — cely a služebny',
 'Kontaminace cel tělními tekutinami, zápachy, riziko přenosu TBC a hepatitidy, služební vozidla',
 'PRO I PLUS pro cely po opuštění + Clean Box na ochranné pomůcky. Argument: ochrana policistů při kontaktu s rizikovými osobami.'),

('Krizové štáby a podzemní úkryty',
 'Uzavřené prostory bez přirozeného větrání, plísně, zatuchlost, připravenost na použití',
 'PRO I PLUS pro pravidelnou údržbovou dezinfekci + Clean Up do štábních místností. Argument: připravenost = když je potřeba, prostor musí být okamžitě obyvatelný.'),

('Humanitární organizace — polní nemocnice',
 'Improvizované prostory, omezená hygiena, infekční onemocnění, nedostatek chemie a vody',
 'PRO I PLUS — mobilní, nepotřebuje vodu ani chemii, jen elektřinu nebo generátor. Argument: dezinfekce v podmínkách, kde běžné metody selhávají.'),

-- ════════════════════════════════════════════════════════════════════════════
-- E-COMMERCE A MODERNÍ SLUŽBY
-- ════════════════════════════════════════════════════════════════════════════

('Fulfillment centra (e-shopy)',
 'Obrovské sklady, vrácené zboží potřebuje dezinfekci před opětovným prodejem, zápachy z obalů',
 'PRO I PLUS pro dezinfekci zón vratkového zboží + Clean Box na vracené oblečení a elektroniku. Argument: snížení odpisu vratkového zboží.'),

('Sdílené kancelářské prostory (WeWork model)',
 'Vysoká rotace nájemců, sdílené zasedačky a kuchyňky, reputace = čistota, employer branding nájemců',
 'Clean Up do zasedaček a hot-desků + PRO I PLUS pro víkendovou dezinfekci celého patra. Argument: "certifikovaně čistý vzduch" jako USP pro nájemce.'),

('Serverhostingové společnosti (colocation)',
 'Prach v racku = výpadky a požární riziko, klienti vyžadují SLA na prostředí, klimatizace šíří kontaminanty',
 'Clean Up do serverových hal (nízká kontinuální dávka). Argument: čistější prostředí = méně výpadků = vyšší SLA = vyšší cena za rack.'),

('Colivingové prostory',
 'Sdílené kuchyně, koupelny a obývací prostory, různé hygienické standardy spolubydlících, zápachy',
 'Clean Up do společných prostor + Clean Box na sdílené kuchyňské vybavení. Argument: komunitní bydlení vyžaduje komunitní hygienu.'),

-- ════════════════════════════════════════════════════════════════════════════
-- CÍRKVE, SPOLKY A NEZISKOVÝ SEKTOR
-- ════════════════════════════════════════════════════════════════════════════

('Kostely a modlitebny',
 'Staré budovy, plísně na freskách a dřevě, zatuchlost, lavice sdílené stovkami lidí',
 'PRO I PLUS pro sezónní dezinfekci (jaro/podzim) + nízký kontinuální režim Clean Up. Argument: ochrana kulturního dědictví + zdraví farníků.'),

('Skautské a turistické základny',
 'Sezónní provoz = plísně při nečinnosti, společné ložnice, omezené zázemí, děti',
 'PRO I PLUS pro otevírací dezinfekci na začátku sezóny + Clean Box na spacáky. Argument: bezpečné prostředí pro děti.'),

-- ════════════════════════════════════════════════════════════════════════════
-- NICHE SEGMENTY S VYSOKOU MARŽÍ
-- ════════════════════════════════════════════════════════════════════════════

('Archívy a registratury (státní i firemní)',
 'Plísně na dokumentech, papírový prach, klimatizace nedostatečná, ztráta nenahraditelných dokumentů',
 'PRO I PLUS pro pravidelnou dezinfekci depozitářů. Ozon eliminuje plísně bez kontaktu s dokumenty. Argument: ztráta archiválií = právní a historická katastrofa.'),

('Starožitnictví a aukční síně',
 'Plísně na nábytku, obrazech a textilu, zápachy starého dřeva, ochrana investice v řádu milionů',
 'Clean Box pro dezinfekci menších předmětů + PRO I PLUS pro sklady. Argument: ochrana investice — plíseň na obrazu za milion = totální ztráta.'),

('Tabákový průmysl a humidory',
 'Plísně na tabáku při špatné vlhkosti, broučci (Lasioderma), zápachy, ochrana drahých doutníků',
 'Clean Box pro dezinfekci humidorů a skladovacích boxů. Ozon zabije larvy bez poškození tabáku. Argument: jeden box zachrání zásobu za statisíce.'),

('Numismatika a sběratelství',
 'Plísně na papírových bankovkách, známkách a dokumentech, sulfidace mincí, nevhodné úložné podmínky',
 'Clean Box pro preventivní dezinfekci sbírek. Argument: niche, ale sběratelé investují obrovské částky do zachování stavu.'),

('Taxidermie a přírodovědné sbírky',
 'Kožojedi, moli, plísně na preparátech, arzenové konzervace starších exponátů, muzejní škůdci',
 'Clean Box pro dezinfekci preparátů + PRO I PLUS pro depozitáře. Ozon zabije škůdce ve všech stádiích. Argument: alternativa k fumigaci (toxická chemie).'),

('Kožedělný průmysl',
 'Plísně na surové i zpracované kůži, zápachy z činění, chemické výpary, reklamace od odběratelů',
 'PRO I PLUS pro sklady kůží. Ozon eliminuje plísně a zápachy bez poškození materiálu. Argument: snížení reklamací a odpisů.'),

('Konferenční a školící centra',
 'Celý den různé skupiny v jedné místnosti, sdílené mikrofony a flip charty, klimatizace recirkuluje',
 'Clean Up do školících místností + Clean Box na mikrofony a prezentéry. Argument: účastníci konferencí jsou čím dál citlivější na hygienu.'),

('Fotografická a filmová studia (půjčovny kostýmů)',
 'Sdílené kostýmy, make-up, paruky — přenos kožních infekcí, zápachy, péče o historické kostýmy',
 'Clean Box na kostýmy a paruky (šetrná dezinfekce bez praní) + PRO I PLUS pro studio. Argument: ochrana kostýmů za statisíce + zdraví herců.'),

('Recyklační a charitativní sběrné dvory',
 'Darované věci (matrace, oblečení, nábytek) mohou obsahovat štěnice, roztoče, plísně, zápachy',
 'PRO I PLUS pro karanténní dezinfekci darovaných věcí + Clean Box pro menší předměty. Argument: bezpečnost příjemců charity.'),

('Psí a kočičí hotely / útulky',
 'Zápachy, parvoviróza, plísňové infekce kůže, dezinfekce boxů mezi zvířaty',
 'PRO I PLUS pro dezinfekci boxů a výběhů + Clean Box na pelíšky a hračky. Ozon eliminuje parvo tam, kde běžná chemie nestačí. Argument: zdraví zvířat = reputace.'),

('Kremační služby',
 'Zápachy, dezinfekce prostor, důstojné prostředí pro pozůstalé, legislativní hygiena',
 'PRO I PLUS pro technické zázemí + Clean Up do obřadních prostor. Diskrétní řešení, důraz na profesionalitu.'),

('Záchranné stanice pro zvířata',
 'Karanténní prostory pro zraněná/nemocná zvířata, přenosné nemoci, omezený rozpočet',
 'PRO I PLUS pro dezinfekci karantén mezi zvířaty. Bezchemická metoda — bezpečná i pro oslabená zvířata po rozpadu O3. Argument: efektivita za nízkou cenu.'),

('Deratizační a dezinsekční firmy (partnerství)',
 'Nabízejí chemickou dezinfekci, ale zákazníci chtějí bezchemické alternativy, legislativní tlak na snížení chemie',
 'Partnerský model: DDD firma si pronajme nebo koupí PRO I PLUS jako rozšíření portfolia služeb. Argument: ozon jako prémiový upsell ke standardní DDD.');
