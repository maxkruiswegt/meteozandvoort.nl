import type { MessageSchema } from './nl';

// Typed message keys for t() and <i18n-t> everywhere.
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
}
