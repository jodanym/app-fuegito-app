// Datos de presentacion de los personajes del Universo de Fueguito.
// Las imagenes viven en /public/personajes (servidas en /personajes/...).
import type { Personaje } from "./schema";

export interface PersonajeInfo {
  nombre: string;
  imagen: string;
  // Frase de animo que dice al celebrar (refuerzo positivo, Seccion 5.1).
  celebra: string;
}

export const PERSONAJES: Record<Personaje, PersonajeInfo> = {
  fueguito: {
    nombre: "Fueguito",
    imagen: "/personajes/fueguito.png",
    celebra: "¡Tu chispa creció! Lo hiciste genial.",
  },
  desconocido: {
    nombre: "Desconocido",
    imagen: "/personajes/desconocido.png",
    celebra: "Mmm... resolviste el misterio. ¡Bien pensado!",
  },
  acidito: {
    nombre: "Acidito",
    imagen: "/personajes/acidito.png",
    celebra: "¡Ja! No te dejaste engañar. Buen trabajo.",
  },
};
