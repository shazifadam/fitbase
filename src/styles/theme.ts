import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        neutral: {
          50: { value: "#fafafa" },
          100: { value: "#f5f5f5" },
          200: { value: "#e5e5e5" },
          300: { value: "#d4d4d4" },
          400: { value: "#a3a3a3" },
          500: { value: "#737373" },
          600: { value: "#525252" },
          700: { value: "#404040" },
          800: { value: "#262626" },
          900: { value: "#171717" },
          950: { value: "#0a0a0a" },
        },
        pink: {
          50: { value: "#fdf2f8" },
          100: { value: "#fce7f3" },
          200: { value: "#fbcfe8" },
          300: { value: "#f9a8d4" },
          400: { value: "#f472b6" },
          500: { value: "#ec4899" },
          600: { value: "#db2777" },
          700: { value: "#be185d" },
          800: { value: "#9d174d" },
          900: { value: "#831843" },
          950: { value: "#500724" },
        },
        success: {
          50: { value: "#f0fdf4" },
          100: { value: "#dcfce7" },
          200: { value: "#bbf7d0" },
          300: { value: "#86efac" },
          400: { value: "#4ade80" },
          500: { value: "#22c55e" },
          600: { value: "#16a34a" },
          700: { value: "#15803d" },
          800: { value: "#166534" },
          900: { value: "#14532d" },
          950: { value: "#052e16" },
        },
        warning: {
          50: { value: "#fffbeb" },
          100: { value: "#fef3c7" },
          200: { value: "#fde68a" },
          300: { value: "#fcd34d" },
          400: { value: "#fbbf24" },
          500: { value: "#f59e0b" },
          600: { value: "#d97706" },
          700: { value: "#b45309" },
          800: { value: "#92400e" },
          900: { value: "#78350f" },
          950: { value: "#451a03" },
        },
        danger: {
          50: { value: "#fef2f2" },
          100: { value: "#fee2e2" },
          200: { value: "#fecaca" },
          300: { value: "#fca5a5" },
          400: { value: "#f87171" },
          500: { value: "#ef4444" },
          600: { value: "#dc2626" },
          700: { value: "#b91c1c" },
          800: { value: "#991b1b" },
          900: { value: "#7f1d1d" },
          950: { value: "#450a0a" },
        },
      },
      fonts: {
        heading: { value: "var(--font-inter)" },  // Inter for headings
        body: { value: "var(--font-inter)" },     // Inter for body
      },
      fontWeights: {
        normal: { value: "400" },    // Regular - for body text
        medium: { value: "500" },    // Medium - for headings
        semibold: { value: "600" },
        bold: { value: "700" },
      },
      radii: {
        none: { value: "0" },
        sm: { value: "0.25rem" },
        base: { value: "0.5rem" },
        md: { value: "0.75rem" },    // 12px - primary from screenshots
        lg: { value: "1rem" },
        xl: { value: "1.5rem" },
        "2xl": { value: "2rem" },
        full: { value: "9999px" },
      },
    },
    semanticTokens: {
      colors: {
        primary: {
          solid: { value: "{colors.pink.800}" },
          contrast: { value: "white" },
          fg: { value: "{colors.pink.800}" },
          muted: { value: "{colors.pink.100}" },
          subtle: { value: "{colors.pink.50}" },
          emphasized: { value: "{colors.pink.900}" },
          focusRing: { value: "{colors.pink.800}" },
        },
        success: {
          solid: { value: "{colors.success.600}" },
          contrast: { value: "white" },
          fg: { value: "{colors.success.700}" },
          muted: { value: "{colors.success.100}" },
          subtle: { value: "{colors.success.50}" },
          emphasized: { value: "{colors.success.700}" },
        },
        warning: {
          solid: { value: "{colors.warning.500}" },
          contrast: { value: "{colors.neutral.900}" },
          fg: { value: "{colors.warning.700}" },
          muted: { value: "{colors.warning.100}" },
          subtle: { value: "{colors.warning.50}" },
          emphasized: { value: "{colors.warning.600}" },
        },
        danger: {
          solid: { value: "{colors.danger.600}" },
          contrast: { value: "white" },
          fg: { value: "{colors.danger.700}" },
          muted: { value: "{colors.danger.100}" },
          subtle: { value: "{colors.danger.50}" },
          emphasized: { value: "{colors.danger.700}" },
        },
        bg: {
          DEFAULT: { value: "{colors.neutral.100}" },
          canvas: { value: "{colors.neutral.50}" },
          surface: { value: "white" },
          subtle: { value: "{colors.neutral.100}" },
          muted: { value: "{colors.neutral.200}" },
          emphasized: { value: "{colors.neutral.300}" },
        },
        fg: {
          DEFAULT: { value: "{colors.neutral.950}" },
          muted: { value: "{colors.neutral.500}" },
          subtle: { value: "{colors.neutral.400}" },
          emphasized: { value: "{colors.neutral.950}" },
          inverted: { value: "white" },
        },
        border: {
          DEFAULT: { value: "{colors.neutral.200}" },
          muted: { value: "{colors.neutral.100}" },
          subtle: { value: "{colors.neutral.50}" },
          emphasized: { value: "{colors.neutral.300}" },
        },
        card: {
          bg: { value: "white" },
          border: { value: "{colors.neutral.200}" },
        },
        input: {
          bg: { value: "white" },
          border: { value: "{colors.neutral.200}" },
          placeholder: { value: "{colors.neutral.400}" },
          focusBorder: { value: "{colors.pink.800}" },
        },
        button: {
          primary: {
            bg: { value: "{colors.pink.800}" },
            hover: { value: "{colors.pink.900}" },
            active: { value: "{colors.pink.950}" },
            text: { value: "white" },
          },
          secondary: {
            bg: { value: "{colors.neutral.100}" },
            hover: { value: "{colors.neutral.200}" },
            active: { value: "{colors.neutral.300}" },
            text: { value: "{colors.neutral.950}" },
          },
          ghost: {
            bg: { value: "transparent" },
            hover: { value: "{colors.neutral.100}" },
            active: { value: "{colors.neutral.200}" },
            text: { value: "{colors.neutral.900}" },
          },
        },
        badge: {
          active: {
            bg: { value: "{colors.success.600}" },
            text: { value: "white" },
          },
          expiring: {
            bg: { value: "{colors.warning.500}" },
            text: { value: "{colors.neutral.900}" },
          },
          expired: {
            bg: { value: "{colors.danger.600}" },
            text: { value: "white" },
          },
        },
        tag: {
          strength: {
            bg: { value: "{colors.neutral.100}" },
            text: { value: "{colors.neutral.900}" },
            border: { value: "{colors.neutral.300}" },
          },
          bodyTrans: {
            bg: { value: "{colors.pink.50}" },
            text: { value: "{colors.pink.900}" },
            border: { value: "{colors.pink.200}" },
          },
          rehab: {
            bg: { value: "{colors.warning.50}" },
            text: { value: "{colors.warning.900}" },
            border: { value: "{colors.warning.200}" },
          },
          athlete: {
            bg: { value: "{colors.success.50}" },
            text: { value: "{colors.success.900}" },
            border: { value: "{colors.success.200}" },
          },
        },
      },
    },
  },
  globalCss: {
    "html, body": {
      bg: "bg",
      color: "fg",
      fontFamily: "body",
    },
    "*": {
      borderColor: "border",
    },
  },
})

export const system = createSystem(defaultConfig, config)
