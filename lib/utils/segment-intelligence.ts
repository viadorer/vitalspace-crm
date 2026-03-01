export interface SegmentIntelligence {
  name: string
  painPoint: string
  approach: string
  recommendedProducts: string[]
  avgDealSize: string
  closingTime: string
  keyDecisionMaker: string
  bestApproach: string
}

export const SEGMENT_INTELLIGENCE: Record<string, SegmentIntelligence> = {
  'Základní školy': {
    name: 'Základní školy',
    painPoint: 'Vysoká absence žáků v chřipkové sezóně, šíření virů v uzavřených třídách',
    approach: 'Clean Up do každé třídy + Clean Box do sborovny + PRO I PLUS pro tělocvičnu',
    recommendedProducts: ['Clean Up', 'Clean Box DRY', 'PRO I PLUS'],
    avgDealSize: '150 000 - 400 000 Kč',
    closingTime: '3-6 měsíců (školský rozpočet)',
    keyDecisionMaker: 'Ředitel školy, ekonom, zřizovatel (obec)',
    bestApproach: 'Argumentovat snížením absence o 20-30%, ROI přes ušetřené náhrady za nemocné učitele'
  },
  
  'Mateřské školy': {
    name: 'Mateřské školy',
    painPoint: 'Sdílení hraček, časté nemoci malých dětí, legislativní tlak na hygienu',
    approach: 'Clean Up do heren + Clean Box na hračky a lůžkoviny',
    recommendedProducts: ['Clean Up', 'Clean Box DRY'],
    avgDealSize: '80 000 - 150 000 Kč',
    closingTime: '2-4 měsíce',
    keyDecisionMaker: 'Ředitelka MŠ, zřizovatel',
    bestApproach: 'Bezchemická dezinfekce bezpečná pro děti, spokojení rodiče = plná třída'
  },

  'Nemocnice a kliniky': {
    name: 'Nemocnice a kliniky',
    painPoint: 'Nozokomiální infekce, sterilita operačních sálů, legislativní požadavky',
    approach: 'Kompletní řešení s certifikací. Clean Up do pokojů + PRO I PLUS pro operační sály',
    recommendedProducts: ['Clean Up', 'PRO I PLUS', 'Certifikace prostoru', 'Technický audit'],
    avgDealSize: '500 000 - 2 000 000 Kč',
    closingTime: '6-12 měsíců (veřejné zakázky)',
    keyDecisionMaker: 'Primář, technický náměstek, nákupní oddělení',
    bestApproach: 'Protokoly, měřitelné výsledky, certifikace, snížení nozokomiálních infekcí'
  },

  'Kanceláře a coworkingová centra': {
    name: 'Kanceláře a coworkingová centra',
    painPoint: 'Sick building syndrom, formaldehyd z nábytku, únava zaměstnanců',
    approach: 'Clean Up do open-space a zasedacích místností',
    recommendedProducts: ['Clean Up', 'Montáž a instalace'],
    avgDealSize: '120 000 - 350 000 Kč',
    closingTime: '1-3 měsíce',
    keyDecisionMaker: 'Facility manager, HR, CFO',
    bestApproach: 'ROI přes produktivitu: 1% méně sick days = X Kč úspora, ESG reporting'
  },

  'Hotely': {
    name: 'Hotely',
    painPoint: 'Zápachy v pokojích po hostech, kvalita vzduchu, recenze na Booking',
    approach: 'Clean Up do pokojů + PRO I PLUS pro lobby a konferenční sály',
    recommendedProducts: ['Clean Up', 'PRO I PLUS'],
    avgDealSize: '200 000 - 800 000 Kč',
    closingTime: '2-4 měsíce',
    keyDecisionMaker: 'Ředitel hotelu, provozní manažer',
    bestApproach: 'Lepší recenze = vyšší occupancy, "ozonově čištěný pokoj" jako USP'
  },

  'Fitness centra a posilovny': {
    name: 'Fitness centra a posilovny',
    painPoint: 'Zápachy v šatnách, bakterie na strojích, pot a vlhkost',
    approach: 'PRO I PLUS pro noční dezinfekci + Clean Box pro rukavice',
    recommendedProducts: ['PRO I PLUS', 'Clean Box DRY'],
    avgDealSize: '90 000 - 180 000 Kč',
    closingTime: '1-2 měsíce',
    keyDecisionMaker: 'Majitel, provozní manažer',
    bestApproach: 'Členové ocení čisté prostředí, diferenciace od konkurence'
  },

  'Restaurace a kavárny': {
    name: 'Restaurace a kavárny',
    painPoint: 'Zápachy z kuchyně, kontaminace povrchů, hygiena pro hosty',
    approach: 'PRO I PLUS pro noční dezinfekci + Clean Box pro jídelní lístky',
    recommendedProducts: ['PRO I PLUS', 'Clean Box DRY'],
    avgDealSize: '70 000 - 150 000 Kč',
    closingTime: '1-2 měsíce',
    keyDecisionMaker: 'Majitel, šéfkuchař',
    bestApproach: 'Hygienický certifikát, lepší recenze, HACCP compliance'
  },

  'Výrobní podniky': {
    name: 'Výrobní podniky',
    painPoint: 'VOC z výrobních procesů, zápachy, BOZP požadavky',
    approach: 'PRO I PLUS pro výrobní haly + Clean Up do kanceláří',
    recommendedProducts: ['PRO I PLUS', 'Clean Up', 'Technický audit'],
    avgDealSize: '300 000 - 1 200 000 Kč',
    closingTime: '3-6 měsíců',
    keyDecisionMaker: 'Výrobní ředitel, BOZP technik, facility manager',
    bestApproach: 'BOZP compliance, snížení nemocnosti, ochrana zaměstnanců'
  },

  'Potravinářský průmysl': {
    name: 'Potravinářský průmysl',
    painPoint: 'Kontaminace potravin plísněmi, HACCP požadavky, prodloužení trvanlivosti',
    approach: 'PRO I PLUS pro sklady a výrobní linky, certifikace klíčová',
    recommendedProducts: ['PRO I PLUS', 'Certifikace prostoru', 'Technický audit'],
    avgDealSize: '400 000 - 1 500 000 Kč',
    closingTime: '4-8 měsíců',
    keyDecisionMaker: 'Technolog, quality manager, ředitel výroby',
    bestApproach: 'Prodloužení shelf life, HACCP, snížení reklamací, bez chemických reziduí'
  },

  'Dopravní podniky (MHD)': {
    name: 'Dopravní podniky (MHD)',
    painPoint: 'Dezinfekce autobusů mezi směnami, zápachy, sezónní epidemie',
    approach: 'PRO I PLUS mobilně do dep pro noční dezinfekci vozidel',
    recommendedProducts: ['PRO I PLUS'],
    avgDealSize: '150 000 - 400 000 Kč',
    closingTime: '6-12 měsíců (veřejné zakázky)',
    keyDecisionMaker: 'Technický ředitel, vedoucí dep',
    bestApproach: 'Jeden přístroj = desítky vozidel za noc, úspora chemie, public health'
  }
}

export function getSegmentRecommendation(segmentName: string): SegmentIntelligence | null {
  return SEGMENT_INTELLIGENCE[segmentName] || null
}

export function getRecommendedProductsForSegment(segmentName: string): string[] {
  const intel = SEGMENT_INTELLIGENCE[segmentName]
  return intel?.recommendedProducts || []
}

export function getAvgDealSize(segmentName: string): string {
  const intel = SEGMENT_INTELLIGENCE[segmentName]
  return intel?.avgDealSize || 'Neurčeno'
}

export function getSalesApproach(segmentName: string): string {
  const intel = SEGMENT_INTELLIGENCE[segmentName]
  return intel?.bestApproach || 'Standardní přístup'
}
