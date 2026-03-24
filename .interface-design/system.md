# Sistema de Diseño - Barbería

## Dirección y Feel

Tema oscuro premium con acentos dorados. Estética de barbería gentlemen&apos;s club moderna.

## Depth Strategy

- Solo borders sutiles (#27272A)
- Sin sombras
- Superficies oscuras con elevación sutil
- Acento dorado (#D4AF37) para highlights

## Spacing Base

- Base unit: 8px
- Padding: 16px, 20px, 24px, 32px
- Gap: 8px, 12px, 16px, 24px, 32px

## Palette (Dark Theme)

```css
--background: #1a1a1a;       /* Fondo principal */
--surface: #18181B;          /* Cards/superficies */
--surface-elevated: #27272A; /* Superficies elevadas */
--foreground: #FAFAFA;       /* Texto principal */
--border: #27272A;           /* Borders sutiles */
--muted-foreground: #71717A; /* Texto secundario */
--accent: #D4AF37;           /* Acento dorado */
--accent-hover: #B8860B;     /* Dorado más oscuro */
--destructive: #EF4444;
--success: #22C55E;
--warning: #F59E0B;
```

## Semantic Colors (Dark Theme)

```css
--color-activa: #14532D;      /* Activa - dark green */
--color-activa-text: #86EFAC;
--color-cancelada: #450A0A;   /* Cancelada - dark red */
--color-cancelada-text: #FCA5A5;
```

## Component Patterns

### Form inputs (Dark)
- Padding: 10px 12px
- Border radius: 8px
- Border: 1px solid #3F3F46
- Background: #27272A
- Font size: 14px
- Color: #FAFAFA

### Buttons
- Primary: background linear-gradient(135deg, #D4AF37, #B8860B), color #18181B
- Secondary: border 1px solid #3F3F46, color #A1A1AA, background transparent
- Danger: background rgba(239, 68, 68, 0.1), color #EF4444
- Padding: 10px 16px (sm), 14px 24px (md)
- Border radius: 8px
- Font size: 14px
- Font weight: 500

### Cards (Dark)
- Padding: 20px
- Border: 1px solid #27272A
- Background: #18181B
- Border radius: 12px

### Tables (Dark)
- Header: background #27272A, font-size 12px, font-weight 600, color #A1A1AA, text-transform uppercase, letter-spacing 0.05em
- Cell: padding 16px, font-size 14px, color #FAFAFA
- Row: border-bottom 1px solid #27272A

### Badges/Pills
- Padding: 6px 12px
- Border radius: 6px
- Font size: 12px
- Font weight: 600

### Sidebar (Admin Dark)
- Width: 260px
- Background: #18181B
- Border-right: 1px solid #27272A
- Position: sticky, top 0, height 100vh
- Nav items: padding 12px, border-radius 8px
- Active: background #27272A, color #FAFAFA
- Inactive: color #A1A1AA

### Navigation Header
- Fixed header con border-bottom sutil
- Links: 14px, color #A1A1AA
- Max content width: 1200px

## Typography

- Headlines: 28px, font-weight 600, letter-spacing -0.03em, color #FAFAFA
- Body: 14-16px, font-weight 400, color #FAFAFA
- Labels: 12px, font-weight 500, color #A1A1AA, text-transform uppercase

## Pages

### Auth Pages (login/register) - Dark Theme
- Background: #1a1a1a
- Centered layout, min-height 100vh
- Form max-width: 400px
- Card background: #18181B, border: 1px solid #27272A, border-radius: 16px
- Labels: 12px font-weight 500, color #A1A1AA, margin-bottom 6px
- Input background: #27272A, border: 1px solid #3F3F46
- Logo con gradiente dorado

### Dashboard
- Stats grid: repeat(4, 1fr) gap 16px
- Metric cards: padding 20px, value font-size 28px, iconos dorados

### Admin
- Sidebar: 260px, sticky, dark theme
- Main content: padding 32px, background #1a1a1a
- Tables with dark styling

### Nueva Cita
- Form max-width: 500px
- Vertical spacing: 20px

## Interactions

### Hover states
- Links: color transition 0.15s
- Buttons: cursor pointer, opacity change
- Nav items: background transition

### Focus states
- Inputs: outline none, border color #D4AF37

### Loading states
- Spinner or text "Cargando..."
- Buttons: opacity 0.6, cursor not-allowed

---

## Landing Page (Home)

### Hero Section
- Background: imagen de barbería con overlay linear-gradient (rgba(0,0,0,0.7) a rgba(0,0,0,0.8))
- Extra overlay: gradient horizontal para profundidad
- Badge: padding 8px 16px, background rgba(212,175,55,0.2), border 1px solid rgba(212,175,55,0.4), border-radius 20, color #D4AF37
- Headline: font-size 56px, font-weight 700, color #fff, letter-spacing -0.03em, line-height 1.1
- Accent text: color #D4AF37 (gold)
- Description: font-size 18px, color rgba(255,255,255,0.8), line-height 1.7, max-width 500px

### Header
- Logo: 40x40 circle, background linear-gradient(135deg, #D4AF37, #B8860B), icon white on gold
- Nav buttons: padding 10px 24px, font-size 14px, font-weight 500
- Primary button: background linear-gradient(135deg, #D4AF37, #B8860B), color #1a1a1a
- Secondary button: border 1px solid rgba(255,255,255,0.3), color #fff

### Benefits Section
- Grid: repeat(4, 1fr), gap 32px
- Icons: font-size 32px, margin-bottom 8px
- Title: color #fff, font-size 15px, font-weight 600
- Subtitle: color rgba(255,255,255,0.6), font-size 13px

### CTAs
- Primary: padding 16px 32px, font-size 15px, font-weight 600, color #1a1a1a, background gold gradient, box-shadow 0 4px 15px rgba(212,175,55,0.3)
- Secondary: padding 16px 32px, font-size 15px, font-weight 600, color #fff, border 1px solid rgba(255,255,255,0.4)

### Footer
- Border-top: 1px solid rgba(255,255,255,0.1)
- Links: color rgba(255,255,255,0.5), font-size 13px
