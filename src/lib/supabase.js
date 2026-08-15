import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const looksSecret =
  typeof key === 'string' &&
  (key.startsWith('sb_secret_') || key.toLowerCase().includes('service_role'))

export const configured = Boolean(url && key && !looksSecret)

if (looksSecret) {
  console.error(
    'First Dice refused to initialize Supabase because a secret/service-role key was supplied to the browser. ' +
    'Use VITE_SUPABASE_PUBLISHABLE_KEY with an sb_publishable_... key.'
  )
}

export const supabase = configured
  ? createClient(url, key)
  : null
