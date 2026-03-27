# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e6]
      - heading "Gentleman's Cut" [level=1] [ref=e9]
      - paragraph [ref=e10]: Inicia sesión en tu cuenta
    - generic [ref=e11]:
      - alert [ref=e12]: Email o contraseña incorrectos
      - generic [ref=e13]:
        - generic [ref=e14]:
          - generic [ref=e15]: Email
          - textbox "Email" [ref=e16]:
            - /placeholder: tu@email.com
            - text: cliente@test.com
        - generic [ref=e17]:
          - generic [ref=e18]: Contraseña
          - textbox "Contraseña" [ref=e19]:
            - /placeholder: ••••••••
            - text: password123
      - button "Iniciar sesión" [ref=e20] [cursor=pointer]
    - link "¿No tienes cuenta? Regístrate" [ref=e22] [cursor=pointer]:
      - /url: /register
  - alert [ref=e23]
```