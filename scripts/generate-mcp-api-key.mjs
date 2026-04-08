#!/usr/bin/env node
/**
 * Generates a new MCP API key, prints the raw key (store it in your
 * MCP server's `.env` as VITALSPACE_API_KEY) and a SQL INSERT statement
 * to register its hash in the `mcp_api_keys` table.
 *
 * Usage:
 *   API_KEY_PEPPER=$YOUR_PEPPER node scripts/generate-mcp-api-key.mjs "Claude MCP production"
 *
 * The pepper MUST match `process.env.API_KEY_PEPPER` used by the running
 * Next.js app — otherwise the hash won't match at request time.
 */
import crypto from 'node:crypto'

const name = process.argv[2] || 'MCP key'
const pepper = process.env.API_KEY_PEPPER

if (!pepper) {
  console.error(
    'WARNING: API_KEY_PEPPER not set — falling back to plain SHA-256.\n' +
      '         This must match the running Next.js app or auth will fail.'
  )
}

const rawKey = `vs_mcp_${crypto.randomBytes(32).toString('hex')}`
const hash = pepper
  ? crypto.createHmac('sha256', pepper).update(rawKey).digest('hex')
  : crypto.createHash('sha256').update(rawKey).digest('hex')

const escapedName = name.replace(/'/g, "''")

console.log('\n=== Raw API key (store in mcp-server/.env as VITALSPACE_API_KEY) ===')
console.log(rawKey)
console.log('\n=== SQL to register the key ===')
console.log(
  `INSERT INTO mcp_api_keys (name, key_hash, permissions, is_active)\n` +
    `VALUES ('${escapedName}', '${hash}', ARRAY['crm:read', 'crm:write'], true);`
)
console.log()
