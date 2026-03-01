#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath, override: true });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

console.error(`[vitalspace] API_BASE_URL: ${API_BASE_URL}`);

const server = new Server(
  {
    name: 'vitalspace-contacts',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools: Tool[] = [
  {
    name: 'create_prospect',
    description: 'Vytvoří nový prospect (firmu k oslovení) s možností přidat kontaktní osoby',
    inputSchema: {
      type: 'object',
      properties: {
        company_name: { type: 'string', description: 'Název firmy' },
        ico: { type: 'string', description: 'IČO' },
        dic: { type: 'string', description: 'DIČ' },
        segment_name: { type: 'string', description: 'Název segmentu' },
        region: { type: 'string', enum: ['Plzeňský kraj', 'Praha', 'Středočeský kraj', 'Ostatní'] },
        city: { type: 'string' },
        address: { type: 'string' },
        website: { type: 'string' },
        source: { type: 'string' },
        priority: { type: 'number' },
        notes: { type: 'string' },
        contacts: {
          type: 'array',
          description: 'Kontaktní osoby k přidání',
          items: {
            type: 'object',
            properties: {
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              position: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              is_decision_maker: { type: 'boolean' },
            },
            required: ['last_name'],
          },
        },
      },
      required: ['company_name'],
    },
  },
  {
    name: 'list_prospects',
    description: 'Vypíše všechny prospekty s možností filtrování',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['not_contacted', 'contacted', 'meeting_scheduled', 'refused', 'qualified'] },
        segment_name: { type: 'string' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'search_prospects',
    description: 'Vyhledá prospekty podle názvu firmy',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Vyhledávací dotaz' },
      },
      required: ['query'],
    },
  },
  {
    name: 'bulk_add_prospect_contacts',
    description: 'Hromadně přidá více kontaktních osob k prospectu',
    inputSchema: {
      type: 'object',
      properties: {
        prospect_id: { type: 'string', description: 'UUID prospectu' },
        contacts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              position: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              is_decision_maker: { type: 'boolean' },
            },
            required: ['last_name'],
          },
        },
      },
      required: ['prospect_id', 'contacts'],
    },
  },
  {
    name: 'create_client',
    description: 'Vytvoří nového klienta',
    inputSchema: {
      type: 'object',
      properties: {
        company_name: { type: 'string', description: 'Název firmy' },
        ico: { type: 'string', description: 'IČO' },
        dic: { type: 'string', description: 'DIČ' },
        segment_name: { type: 'string', description: 'Název segmentu (např. "Nemocnice", "Školy")' },
        region: { type: 'string', enum: ['Plzeňský kraj', 'Praha', 'Středočeský kraj', 'Ostatní'] },
        city: { type: 'string' },
        address: { type: 'string' },
        postal_code: { type: 'string' },
        website: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        type: { type: 'string', enum: ['B2B', 'B2C'] },
        notes: { type: 'string' },
      },
      required: ['company_name'],
    },
  },
  {
    name: 'update_client',
    description: 'Aktualizuje existujícího klienta',
    inputSchema: {
      type: 'object',
      properties: {
        client_id: { type: 'string', description: 'UUID klienta' },
        company_name: { type: 'string' },
        ico: { type: 'string' },
        dic: { type: 'string' },
        segment_name: { type: 'string' },
        region: { type: 'string' },
        city: { type: 'string' },
        address: { type: 'string' },
        postal_code: { type: 'string' },
        website: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        type: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['client_id'],
    },
  },
  {
    name: 'list_clients',
    description: 'Vypíše všechny klienty s možností filtrování',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['B2B', 'B2C'] },
        segment_name: { type: 'string' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'bulk_add_client_contacts',
    description: 'Hromadně přidá více kontaktních osob ke klientovi',
    inputSchema: {
      type: 'object',
      properties: {
        client_id: { type: 'string', description: 'UUID klienta' },
        contacts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              position: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              mobile: { type: 'string' },
              linkedin_url: { type: 'string' },
              is_primary: { type: 'boolean' },
              is_decision_maker: { type: 'boolean' },
              notes: { type: 'string' },
            },
            required: ['last_name'],
          },
        },
      },
      required: ['client_id', 'contacts'],
    },
  },
  {
    name: 'list_segments',
    description: 'Vypíše všechny segmenty s sales playbook daty',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Filtr podle názvu segmentu' },
      },
    },
  },
  {
    name: 'get_segment',
    description: 'Načte detail segmentu včetně sales playbook',
    inputSchema: {
      type: 'object',
      properties: {
        segment_id: { type: 'string', description: 'UUID segmentu' },
      },
      required: ['segment_id'],
    },
  },
  {
    name: 'create_segment',
    description: 'Vytvoří nový segment s sales playbook daty',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Název segmentu' },
        target_pain_point: { type: 'string', description: 'Hlavní bolest segmentu' },
        recommended_approach: { type: 'string', description: 'Doporučený prodejní přístup' },
        recommended_products: { type: 'array', items: { type: 'string' }, description: 'Doporučené produkty' },
        average_deal_min_czk: { type: 'number', description: 'Min hodnota dealu v Kč' },
        average_deal_max_czk: { type: 'number', description: 'Max hodnota dealu v Kč' },
        closing_time_months_min: { type: 'number', description: 'Min doba uzavření v měsících' },
        closing_time_months_max: { type: 'number', description: 'Max doba uzavření v měsících' },
        decision_makers: { type: 'array', items: { type: 'string' }, description: 'Typické pozice rozhodovatelů' },
        key_arguments: { type: 'array', items: { type: 'string' }, description: 'Klíčové prodejní argumenty' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_segment',
    description: 'Aktualizuje existující segment',
    inputSchema: {
      type: 'object',
      properties: {
        segment_id: { type: 'string', description: 'UUID segmentu' },
        name: { type: 'string' },
        target_pain_point: { type: 'string' },
        recommended_approach: { type: 'string' },
        recommended_products: { type: 'array', items: { type: 'string' } },
        average_deal_min_czk: { type: 'number' },
        average_deal_max_czk: { type: 'number' },
        closing_time_months_min: { type: 'number' },
        closing_time_months_max: { type: 'number' },
        decision_makers: { type: 'array', items: { type: 'string' } },
        key_arguments: { type: 'array', items: { type: 'string' } },
      },
      required: ['segment_id'],
    },
  },
  {
    name: 'delete_segment',
    description: 'Smaže segment (pozor: ovlivní všechny prospekty/klienty s tímto segmentem)',
    inputSchema: {
      type: 'object',
      properties: {
        segment_id: { type: 'string', description: 'UUID segmentu' },
      },
      required: ['segment_id'],
    },
  },
  {
    name: 'find_linkedin_profile',
    description: 'Vyhledá LinkedIn profil osoby nebo firmy přes Google',
    inputSchema: {
      type: 'object',
      properties: {
        person_name: { type: 'string', description: 'Jméno osoby (např. "Jan Novák")' },
        company_name: { type: 'string', description: 'Název firmy pro upřesnění' },
        position: { type: 'string', description: 'Pozice pro upřesnění' },
      },
      required: ['person_name'],
    },
  },
  {
    name: 'scrape_firmycz',
    description: 'Specializovaný scraper pro firmy.cz - extrahuje firmy z kategorie',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL kategorie na firmy.cz' },
        max_companies: { type: 'number', description: 'Maximální počet firem (default 50)' },
        include_details: { type: 'boolean', description: 'Načíst detaily (IČO, kontakty)' },
        find_linkedin: { type: 'boolean', description: 'Pokusit se najít LinkedIn profily přes Google' },
      },
      required: ['url'],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error('Missing arguments');
  }

  try {
    switch (name) {
      case 'create_prospect': {
        const response = await fetch(`${API_BASE_URL}/prospects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_name: args.company_name,
            ico: args.ico,
            dic: args.dic,
            segment_name: args.segment_name,
            region: args.region,
            city: args.city,
            address: args.address,
            website: args.website,
            source: args.source,
            priority: args.priority,
            notes: args.notes,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Chyba: ${data.error}` }],
            isError: true,
          };
        }

        let contactsAdded = 0;
        if (args.contacts && Array.isArray(args.contacts) && args.contacts.length > 0) {
          const contactsResponse = await fetch(`${API_BASE_URL}/prospects/${data.id}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contacts: args.contacts }),
          });

          if (contactsResponse.ok) {
            const contactsData = await contactsResponse.json();
            contactsAdded = contactsData.count || 0;
          }
        }

        const message = contactsAdded > 0
          ? `Prospect vytvořen s ${contactsAdded} kontakty:\n${JSON.stringify(data, null, 2)}`
          : `Prospect vytvořen:\n${JSON.stringify(data, null, 2)}`;

        return {
          content: [{ type: 'text', text: message }],
        };
      }

      case 'list_prospects': {
        const params = new URLSearchParams();
        if (args.status) params.append('status', args.status as string);
        if (args.segment_name) params.append('segment_name', args.segment_name as string);
        if (args.limit) params.append('limit', String(args.limit));

        const response = await fetch(`${API_BASE_URL}/prospects?${params}`);
        const data = await response.json();

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Chyba: ${data.error}` }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      case 'search_prospects': {
        const params = new URLSearchParams({ q: args.query as string });
        const response = await fetch(`${API_BASE_URL}/prospects/search?${params}`);
        const data = await response.json();

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Chyba: ${data.error}` }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      case 'bulk_add_prospect_contacts': {
        const prospectId = args.prospect_id as string;
        const contacts = args.contacts as any[];

        const response = await fetch(`${API_BASE_URL}/prospects/${prospectId}/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts }),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Chyba: ${data.error}` }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: `Přidáno ${data.count} kontaktů:\n${JSON.stringify(data.contacts, null, 2)}` }],
        };
      }

      case 'create_client': {
        const response = await fetch(`${API_BASE_URL}/clients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_name: args.company_name,
            ico: args.ico,
            dic: args.dic,
            segment_name: args.segment_name,
            region: args.region || 'Plzeňský kraj',
            city: args.city,
            address: args.address,
            postal_code: args.postal_code,
            website: args.website,
            phone: args.phone,
            email: args.email,
            type: args.type || 'B2B',
            notes: args.notes,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Chyba: ${data.error || 'Unknown error'}` }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: `Klient vytvořen:\n${JSON.stringify(data, null, 2)}` }],
        };
      }

      case 'update_client': {
        const clientId = args.client_id as string;
        const updates: any = {};
        
        if (args.company_name !== undefined) updates.company_name = args.company_name;
        if (args.ico !== undefined) updates.ico = args.ico;
        if (args.dic !== undefined) updates.dic = args.dic;
        if (args.segment_name !== undefined) updates.segment_name = args.segment_name;
        if (args.region !== undefined) updates.region = args.region;
        if (args.city !== undefined) updates.city = args.city;
        if (args.address !== undefined) updates.address = args.address;
        if (args.postal_code !== undefined) updates.postal_code = args.postal_code;
        if (args.website !== undefined) updates.website = args.website;
        if (args.phone !== undefined) updates.phone = args.phone;
        if (args.email !== undefined) updates.email = args.email;
        if (args.type !== undefined) updates.type = args.type;
        if (args.notes !== undefined) updates.notes = args.notes;

        const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Chyba: ${data.error}` }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: `Klient aktualizován:\n${JSON.stringify(data, null, 2)}` }],
        };
      }

      case 'list_clients': {
        const params = new URLSearchParams();
        if (args.type) params.append('type', args.type as string);
        if (args.segment_name) params.append('segment_name', args.segment_name as string);
        if (args.limit) params.append('limit', String(args.limit));

        const response = await fetch(`${API_BASE_URL}/clients?${params}`);
        const data = await response.json();

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Chyba: ${data.error}` }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      case 'bulk_add_client_contacts': {
        const clientId = args.client_id as string;
        const contacts = args.contacts as any[];

        const response = await fetch(`${API_BASE_URL}/clients/${clientId}/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts }),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Chyba: ${data.error}` }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: `Přidáno ${data.count} kontaktů:\n${JSON.stringify(data.contacts, null, 2)}` }],
        };
      }

      case 'list_segments': {
        const params = new URLSearchParams();
        if (args.name) params.append('name', args.name as string);

        const response = await fetch(`${API_BASE_URL}/segments?${params}`);
        const data = await response.json();

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Chyba: ${data.error}` }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      case 'get_segment': {
        const segmentId = args.segment_id as string;
        const response = await fetch(`${API_BASE_URL}/segments/${segmentId}`);
        const data = await response.json();

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Chyba: ${data.error}` }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      case 'create_segment': {
        const response = await fetch(`${API_BASE_URL}/segments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: args.name,
            target_pain_point: args.target_pain_point,
            recommended_approach: args.recommended_approach,
            recommended_products: args.recommended_products,
            average_deal_min_czk: args.average_deal_min_czk,
            average_deal_max_czk: args.average_deal_max_czk,
            closing_time_months_min: args.closing_time_months_min,
            closing_time_months_max: args.closing_time_months_max,
            decision_makers: args.decision_makers,
            key_arguments: args.key_arguments,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Chyba: ${data.error}` }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: `Segment vytvořen:\n${JSON.stringify(data, null, 2)}` }],
        };
      }

      case 'update_segment': {
        const segmentId = args.segment_id as string;
        const updates: any = {};

        if (args.name !== undefined) updates.name = args.name;
        if (args.target_pain_point !== undefined) updates.target_pain_point = args.target_pain_point;
        if (args.recommended_approach !== undefined) updates.recommended_approach = args.recommended_approach;
        if (args.recommended_products !== undefined) updates.recommended_products = args.recommended_products;
        if (args.average_deal_min_czk !== undefined) updates.average_deal_min_czk = args.average_deal_min_czk;
        if (args.average_deal_max_czk !== undefined) updates.average_deal_max_czk = args.average_deal_max_czk;
        if (args.closing_time_months_min !== undefined) updates.closing_time_months_min = args.closing_time_months_min;
        if (args.closing_time_months_max !== undefined) updates.closing_time_months_max = args.closing_time_months_max;
        if (args.decision_makers !== undefined) updates.decision_makers = args.decision_makers;
        if (args.key_arguments !== undefined) updates.key_arguments = args.key_arguments;

        const response = await fetch(`${API_BASE_URL}/segments/${segmentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Chyba: ${data.error}` }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: `Segment aktualizován:\n${JSON.stringify(data, null, 2)}` }],
        };
      }

      case 'delete_segment': {
        const segmentId = args.segment_id as string;
        const response = await fetch(`${API_BASE_URL}/segments/${segmentId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Chyba: ${data.error}` }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: 'Segment smazán' }],
        };
      }

      case 'find_linkedin_profile': {
        const personName = args.person_name as string;
        const companyName = args.company_name as string;
        const position = args.position as string;

        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        });
        const page = await context.newPage();

        try {
          let searchQuery = `"${personName}" site:linkedin.com/in/`;
          if (companyName) searchQuery += ` "${companyName}"`;
          if (position) searchQuery += ` "${position}"`;

          const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
          await page.goto(googleUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await page.waitForTimeout(2000);

          const cookieButton = page.locator('button:has-text("Přijmout vše"), button:has-text("Accept all")').first();
          if (await cookieButton.isVisible().catch(() => false)) {
            await cookieButton.click().catch(() => {});
            await page.waitForTimeout(1000);
          }

          const results: any[] = [];
          const searchResults = await page.locator('a[href*="linkedin.com/in/"]').all();

          for (const result of searchResults.slice(0, 5)) {
            const href = await result.getAttribute('href');
            if (href && href.includes('linkedin.com/in/')) {
              const cleanUrl = href.split('&')[0].split('?')[0];
              if (!results.some(r => r.url === cleanUrl)) {
                const text = await result.textContent();
                results.push({
                  url: cleanUrl,
                  title: text?.trim() || '',
                });
              }
            }
          }

          await browser.close();

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                search_query: searchQuery,
                found: results.length,
                profiles: results,
              }, null, 2),
            }],
          };
        } catch (error) {
          await browser.close();
          return {
            content: [{ type: 'text', text: `Chyba při vyhledávání: ${error}` }],
            isError: true,
          };
        }
      }

      case 'scrape_firmycz': {
        const url = args.url as string;
        const maxCompanies = (args.max_companies as number) || 50;
        const includeDetails = (args.include_details as boolean) || false;

        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

          const cookieSelectors = [
            'button:has-text("Souhlasím")',
            'button:has-text("Přijmout")',
            'button:has-text("Přijmout vše")',
            'button:has-text("Accept")',
            '[id*="cookie"] button',
            '.cookie-consent button',
            '#didomi-notice-agree-button'
          ];

          for (const selector of cookieSelectors) {
            const cookieButton = page.locator(selector).first();
            if (await cookieButton.isVisible().catch(() => false)) {
              await cookieButton.click().catch(() => {});
              await page.waitForTimeout(1000);
              break;
            }
          }

          await page.waitForTimeout(3000);

          const companies: any[] = [];
          const articles = await page.locator('article').all();

          for (let i = 0; i < Math.min(articles.length, maxCompanies); i++) {
            const article = articles[i];

            const nameLink = await article.locator('a[href*="/detail/"]').first();
            const name = await nameLink.textContent().catch(() => null);
            const href = await nameLink.getAttribute('href').catch(() => null);

            if (!name || !href) continue;

            const company: any = {
              name: name.trim(),
              detail_url: href.startsWith('http') ? href : `https://www.firmy.cz${href}`,
            };

            const articleHtml = await article.innerHTML();
            let schemaData: any = null;
            const jsonStart = articleHtml.indexOf('{"@context":"http://schema.org"');
            
            if (jsonStart !== -1) {
              let depth = 0;
              let jsonEnd = jsonStart;
              for (let j = jsonStart; j < articleHtml.length; j++) {
                if (articleHtml[j] === '{') depth++;
                if (articleHtml[j] === '}') depth--;
                if (depth === 0) {
                  jsonEnd = j + 1;
                  break;
                }
              }
              try {
                schemaData = JSON.parse(articleHtml.substring(jsonStart, jsonEnd));
              } catch (e) {}
            }

            if (schemaData && (schemaData['@type'] === 'LocalBusiness' || schemaData['@type'] === 'Organization')) {
              if (schemaData.telephone) company.phone = schemaData.telephone.replace(/\s/g, '');
              if (schemaData.email) company.email = schemaData.email;
              if (schemaData.address && typeof schemaData.address === 'object') {
                const addr = schemaData.address;
                const parts = [];
                if (addr.streetAddress) parts.push(addr.streetAddress);
                if (addr.addressLocality) parts.push(addr.addressLocality);
                if (addr.postalCode) parts.push(addr.postalCode);
                company.address = parts.join(', ');
                company.city = addr.addressLocality || '';
                company.postal_code = addr.postalCode || '';
              }
              if (schemaData.geo) {
                company.lat = schemaData.geo.latitude;
                company.lng = schemaData.geo.longitude;
              }
              if (schemaData.description) company.description = schemaData.description;
              if (schemaData.sameAs && Array.isArray(schemaData.sameAs)) {
                const linkedinUrl = schemaData.sameAs.find((u: string) => u.includes('linkedin.com'));
                if (linkedinUrl) company.linkedin_url = linkedinUrl;
                
                const externalUrl = schemaData.sameAs.find((u: string) => !u.includes('firmy.cz') && !u.includes('linkedin.com'));
                if (externalUrl) company.website = externalUrl;
              }
              if (schemaData.aggregateRating) {
                company.rating = schemaData.aggregateRating.ratingValue;
                company.rating_count = schemaData.aggregateRating.ratingCount;
              }
              if (schemaData.image) company.image = schemaData.image;
            }

            if (includeDetails && href) {
              const detailPage = await context.newPage();
              try {
                const fullUrl = href.startsWith('http') ? href : `https://www.firmy.cz${href}`;
                await detailPage.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
                await detailPage.waitForTimeout(2000);

                const bodyText = await detailPage.textContent('body') || '';

                if (!company.ico) {
                  const icoMatch = bodyText.match(/IČO[:\s]+(\d{8})/i);
                  if (icoMatch) company.ico = icoMatch[1];
                }

                if (!company.dic) {
                  const dicMatch = bodyText.match(/DIČ[:\s]+(CZ\d{8,10})/i);
                  if (dicMatch) company.dic = dicMatch[1];
                }

                if (!company.email) {
                  const mailtoLinks = await detailPage.locator('a[href^="mailto:"]').all();
                  for (const link of mailtoLinks) {
                    const mailHref = await link.getAttribute('href');
                    if (mailHref) {
                      const email = mailHref.replace('mailto:', '').split('?')[0];
                      if (email && !email.includes('firmy.cz') && !email.includes('seznam.cz')) {
                        company.email = email;
                        break;
                      }
                    }
                  }
                }

                // --- Contact extraction ---
                const contacts: any[] = [];

                // 1) Extract person name from company name (MUDr., Mgr., etc.)
                const titleMatch = company.name.match(/(?:MUDr\.|Mgr\.|Ing\.|PhDr\.|RNDr\.|JUDr\.|MDDr\.|MVDr\.|Doc\.|Prof\.)\s+(.+)/i);
                if (titleMatch) {
                  let fullName = titleMatch[1].trim();
                  fullName = fullName.replace(/\s*[-–,].*$/, '').trim();
                  fullName = fullName.replace(/\s*,?\s*(?:Ph\.?D\.?|CSc\.?|MBA|DrSc\.?).*$/i, '').trim();
                  const nameParts = fullName.split(/\s+/);
                  if (nameParts.length >= 2 && nameParts.every((p: string) => p.length > 1)) {
                    contacts.push({
                      first_name: nameParts.slice(0, -1).join(' '),
                      last_name: nameParts[nameParts.length - 1],
                      position: 'Lékař / Vedoucí',
                      is_decision_maker: true,
                      email: company.email || undefined,
                      phone: company.phone || undefined,
                    });
                  }
                }

                // 2) Extract jednatel/ředitel from OR/detail text
                const blacklist = new Set(['jsou','jsme','naše','vaše','více','také','jako','nebo','můžete','uložit','firmu','fotka','lidský','přístup','doplňující','firma','nabízí','provoz','klinika','centrum','péče','služby','ordinace','vyšetření','zdravotní','lékařské']);
                const orPatterns = [
                  /(?:Jednatel|Ředitel|Majitel|Společník|Vedoucí lékař)\s*[:\s]\s*(?:(?:MUDr|Mgr|Ing|PhDr|RNDr|JUDr|MDDr|MVDr|Doc|Prof)\.?\s+)?([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]{2,})\s+([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]{2,})/g,
                ];
                for (const pattern of orPatterns) {
                  const matches = bodyText.matchAll(pattern);
                  for (const match of matches) {
                    const fn = match[1].trim();
                    const ln = match[2].trim();
                    if (!blacklist.has(fn.toLowerCase()) && !blacklist.has(ln.toLowerCase())) {
                      if (!contacts.some(c => c.last_name === ln && c.first_name === fn)) {
                        contacts.push({
                          first_name: fn,
                          last_name: ln,
                          position: match[0].toLowerCase().includes('jednatel') ? 'Jednatel' :
                                   match[0].toLowerCase().includes('ředitel') ? 'Ředitel' :
                                   match[0].toLowerCase().includes('majitel') ? 'Majitel' : 'Kontaktní osoba',
                          is_decision_maker: true,
                          email: company.email || undefined,
                          phone: company.phone || undefined,
                        });
                      }
                    }
                  }
                }

                // 3) LinkedIn extraction
                const linkedinLinks = await detailPage.locator('a[href*="linkedin.com/in/"]').all();
                for (const link of linkedinLinks) {
                  const href = await link.getAttribute('href');
                  if (href && href.includes('linkedin.com/in/')) {
                    const linkText = await link.textContent();
                    
                    for (const contact of contacts) {
                      if (linkText && (
                        linkText.includes(contact.first_name) || 
                        linkText.includes(contact.last_name)
                      )) {
                        contact.linkedin_url = href;
                        break;
                      }
                    }
                  }
                }

                if ((args.find_linkedin as boolean) && contacts.length > 0) {
                  for (const contact of contacts) {
                    if (!contact.linkedin_url) {
                      try {
                        const searchPage = await context.newPage();
                        const searchQuery = `"${contact.first_name} ${contact.last_name}" "${company.name}" site:linkedin.com/in/`;
                        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
                        
                        await searchPage.goto(googleUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
                        await searchPage.waitForTimeout(1500);
                        
                        const firstResult = await searchPage.locator('a[href*="linkedin.com/in/"]').first();
                        const linkedinUrl = await firstResult.getAttribute('href').catch(() => null);
                        
                        if (linkedinUrl) {
                          contact.linkedin_url = linkedinUrl.split('&')[0].split('?')[0];
                        }
                        
                        await searchPage.close();
                        await page.waitForTimeout(2000);
                      } catch (err) {
                        console.error(`LinkedIn search failed for ${contact.first_name} ${contact.last_name}`);
                      }
                    }
                  }
                }

                if (contacts.length > 0) {
                  company.contacts = contacts;
                }

                if (contacts.length === 0 && (company.email || company.phone)) {
                  contacts.push({
                    first_name: 'Recepce',
                    last_name: company.name.substring(0, 50),
                    email: company.email || undefined,
                    phone: company.phone || undefined,
                    is_decision_maker: false,
                  });
                }

                if (contacts.length > 0) {
                  company.contacts = contacts;
                }

              } catch (err) {
                company.detail_error = String(err);
              } finally {
                await detailPage.close();
              }
            }

            companies.push(company);
          }

          await browser.close();

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ source_url: url, total_found: companies.length, companies }, null, 2),
            }],
          };
        } catch (error) {
          await browser.close();
          throw error;
        }
      }

      default:
        return {
          content: [{ type: 'text', text: `Neznámý nástroj: ${name}` }],
          isError: true,
        };
    }
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Chyba: ${error.message || String(error)}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Vitalspace MCP server running on stdio');
}

main();
