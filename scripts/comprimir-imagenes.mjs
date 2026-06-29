// Comprime las imagenes de public/ (redimensiona a tamanos sensatos + optimiza
// PNG con cuantizacion de paleta). Mantiene los nombres y la transparencia.
// Uso: node scripts/comprimir-imagenes.mjs
import sharp from "sharp";
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Ancho maximo por carpeta (suficiente para como se ven en la app, con margen).
const CARPETAS = [
  { dir: "public/fondos", maxW: 1280 }, // fondos de mapa + banner
  { dir: "public/mundos", maxW: 600 }, // tiles de mundo
  { dir: "public/medallas", maxW: 400 }, // medallas
  { dir: "public/personajes", maxW: 600 }, // personajes
];

let totalAntes = 0;
let totalDespues = 0;

for (const c of CARPETAS) {
  let archivos;
  try {
    archivos = readdirSync(c.dir).filter((f) => f.toLowerCase().endsWith(".png"));
  } catch {
    continue;
  }
  for (const f of archivos) {
    const p = join(c.dir, f);
    const antes = statSync(p).size;
    const buf = await sharp(p)
      .resize({ width: c.maxW, withoutEnlargement: true })
      .png({ quality: 80, compressionLevel: 9, palette: true })
      .toBuffer();
    // Solo reemplaza si quedo mas pequeno.
    if (buf.length < antes) {
      writeFileSync(p, buf);
    }
    const despues = statSync(p).size;
    totalAntes += antes;
    totalDespues += despues;
    const pct = Math.round((1 - despues / antes) * 100);
    console.log(
      `${f.padEnd(22)} ${(antes / 1024 / 1024).toFixed(2)}MB -> ${(despues / 1024 / 1024).toFixed(2)}MB  (-${pct}%)`
    );
  }
}

console.log(
  `\nTOTAL: ${(totalAntes / 1024 / 1024).toFixed(1)}MB -> ${(totalDespues / 1024 / 1024).toFixed(1)}MB  (-${Math.round((1 - totalDespues / totalAntes) * 100)}%)`
);
