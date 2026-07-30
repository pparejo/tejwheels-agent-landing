# TEJ Wheels · Landing con asesor IA

Landing independiente construida con Vite a partir de información y recursos
públicos de la web oficial de TEJ Wheels. Integra el agente **Asesor TEJ
Wheels** mediante el widget de AgentForge.

## Desarrollo

```bash
npm install
npm run dev
```

## Actualizar recursos oficiales

```bash
npm run sync:content
```

El script descarga las imágenes de producto y corporativas desde
`tejwheels.com`, y genera una versión web optimizada del vídeo de portada. Los
recursos resultantes se guardan en `public/assets` y se versionan para que el
despliegue en Vercel sea reproducible.

## Compilar

```bash
npm run build
```

Vercel detecta Vite automáticamente. No se necesitan variables de entorno.

## Criterio comercial

La landing no publica ni inventa precios, disponibilidad, compatibilidades o
plazos. El asesor recopila los datos técnicos necesarios y diferencia una
orientación inicial de una confirmación u oferta oficial de TEJ Wheels.
