/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_RAZORPAY_KEY: string;
  readonly VITE_STAGING?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
