import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scripts de utilidad/administración (CommonJS, se ejecutan con `node` y
    // no forman parte del build de la app). No se lintean con las reglas de TS.
    "create-first-admin.js",
    "create-user-21.js",
    "gen-types.js",
    "sync-auth-users.js",
    "test-auth.js",
  ]),
  {
    rules: {
      // Patrones intencionales y estándar (sincronizar estado de formularios
      // desde props, bloqueo de scroll del body, lectura de cookie/localStorage
      // al montar). Es un aviso de rendimiento, no un error.
      "react-hooks/set-state-in-effect": "warn",
      // Permite prefijar con "_" args/vars intencionalmente sin usar.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
