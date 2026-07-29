# Privacy & Security Policy

## Principles
1. **Server-Side API Key Isolation**: All AI and OCR keys remain strictly on the server (`.env.local`). Secrets are never exposed to client bundles or native WebViews.
2. **Zero Image Retention**: Receipt photos are processed in memory and immediately discarded. No images are saved to disk or Supabase Storage.
3. **No Unsanctioned Data Scraping**: Rupiyo does not scrape private data or read storage from other financial apps. It accepts data exclusively when shared explicitly by the user or captured via camera.
4. **Mandatory User Confirmation**: No transaction is inserted into Supabase automatically without user verification.
5. **Row Level Security**: All database operations are strictly governed by authenticated Supabase PostgreSQL RLS policies (`user_id = auth.uid()`).
