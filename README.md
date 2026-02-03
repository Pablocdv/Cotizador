# Cotizador

Página `cotizador.html` que carga precios desde un CSV público de Google Sheets.

Instrucciones rápidas:

1) Probar localmente

- Opción (recomendada, requiere Python):

```powershell
cd "c:\Users\Pablo\Documents\GitHub\Cotizador"
python -m http.server 8000
```
Luego abre en tu navegador: http://localhost:8000/cotizador.html

- Opción (VS Code): instala la extensión "Live Server" y abre `cotizador.html`, luego clic en "Go Live".

- Opción (Node):

```bash
npm install -g http-server
http-server -p 8000
```

2) Publicar en GitHub Pages

- Crea un repo en GitHub y sube `cotizador.html` (y este README).
- Comandos básicos (reemplaza `TU_USUARIO` y `TU_REPO`):

```bash
git init
git add cotizador.html README.md
git commit -m "Añadir cotizador"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

- En GitHub: Settings → Pages → Source: `main` branch / `/ (root)` → Save.
- La página estará en: `https://TU_USUARIO.github.io/TU_REPO/cotizador.html`

3) Notas sobre CORS y carga del CSV

- El HTML intenta usar `https://api.allorigins.win/raw?url=` como proxy público para evitar bloqueos CORS. Si el proxy falla por restricciones, publica en GitHub Pages (o usa Live Server) para evitar políticas locales que bloqueen peticiones salientes.
- Si quieres que yo te guíe con la publicación, indícame tu usuario y repo (o autorizo pasos) y te doy los comandos exactos.

---
Archivo: `cotizador.html`