/**
 * Lightweight HTML sanitizer for email content.
 * Allows only safe HTML tags and attributes suitable for email.
 * Strips all event handlers, scripts, and potentially dangerous content.
 */

// Tags allowed in email HTML content
const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4',
  'div', 'span', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
  'img', 'blockquote', 'hr',
])

// Attributes allowed per tag (all others stripped)
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target']),
  img: new Set(['src', 'alt', 'width', 'height']),
  td: new Set(['colspan', 'rowspan', 'style']),
  th: new Set(['colspan', 'rowspan', 'style']),
  // Allow style on common layout elements
  div: new Set(['style']),
  span: new Set(['style']),
  p: new Set(['style']),
  table: new Set(['style', 'width', 'cellpadding', 'cellspacing', 'border']),
  tr: new Set(['style']),
  h1: new Set(['style']),
  h2: new Set(['style']),
  h3: new Set(['style']),
  h4: new Set(['style']),
}

// Dangerous URL schemes
const DANGEROUS_SCHEMES = /^(javascript|vbscript|data):/i

/**
 * Sanitizes HTML content by removing dangerous tags, attributes, and scripts.
 * Keeps only safe tags and attributes suitable for email content.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  // Remove script tags and their content entirely
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove style tags and their content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // Remove HTML comments (can hide content)
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '')

  // Process tags — keep allowed, strip disallowed
  sanitized = sanitized.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (match, tag, attrs) => {
    const tagLower = tag.toLowerCase()
    const isClosing = match.startsWith('</')

    if (!ALLOWED_TAGS.has(tagLower)) {
      return '' // Strip disallowed tags entirely
    }

    if (isClosing) {
      return `</${tagLower}>`
    }

    // Filter attributes
    const allowedAttrsForTag = ALLOWED_ATTRS[tagLower] || new Set()
    const cleanAttrs = filterAttributes(attrs, allowedAttrsForTag, tagLower)

    return `<${tagLower}${cleanAttrs}>`
  })

  return sanitized.trim()
}

function filterAttributes(attrString: string, allowed: Set<string>, tag: string): string {
  if (!attrString.trim()) return ''

  const result: string[] = []
  // Match attribute="value", attribute='value', attribute=value, or boolean attributes
  const attrRegex = /([a-zA-Z_][\w-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g
  let match

  while ((match = attrRegex.exec(attrString)) !== null) {
    const name = match[1].toLowerCase()
    const value = match[2] ?? match[3] ?? match[4] ?? ''

    // Skip event handlers (onclick, onerror, etc.)
    if (name.startsWith('on')) continue

    // Skip disallowed attributes
    if (!allowed.has(name)) continue

    // Validate URLs in href/src
    if ((name === 'href' || name === 'src') && DANGEROUS_SCHEMES.test(value.trim())) {
      continue
    }

    // Sanitize style attribute — remove expressions, url(), behavior
    if (name === 'style') {
      const cleanStyle = sanitizeStyle(value)
      if (cleanStyle) {
        result.push(`style="${cleanStyle}"`)
      }
      continue
    }

    result.push(`${name}="${escapeAttrValue(value)}"`)
  }

  return result.length > 0 ? ' ' + result.join(' ') : ''
}

function sanitizeStyle(style: string): string {
  // Remove dangerous CSS: expression(), url(), behavior, -moz-binding, import
  return style
    .replace(/expression\s*\(/gi, '')
    .replace(/url\s*\(/gi, '')
    .replace(/behavior\s*:/gi, '')
    .replace(/-moz-binding\s*:/gi, '')
    .replace(/@import/gi, '')
    .replace(/javascript\s*:/gi, '')
    .trim()
}

function escapeAttrValue(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Validates that the content size is within limits.
 */
export function validateEmailContent(subject: string, htmlBody: string): string | null {
  if (subject.length > 200) {
    return 'Předmět emailu může mít maximálně 200 znaků'
  }
  if (htmlBody.length > 50_000) {
    return 'Tělo emailu je příliš velké (max 50 KB)'
  }
  return null
}
