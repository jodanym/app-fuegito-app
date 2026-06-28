import { describe, it, expect } from "vitest";
import {
  elegirModo,
  habilidadMenosReforzada,
  elegirDificultad,
  siguienteLeccion,
  type PerfilVector,
  type LeccionResumen,
  type ProgresoResumen,
  type MaestriaResumen,
} from "./motor";

const perfilNeutro: PerfilVector = {
  modalidad: 50,
  entrada: 50,
  dinamica: 50,
  ritmo: 50,
};

describe("elegirModo", () => {
  it("perfil muy manual -> modo manual", () => {
    const p = { ...perfilNeutro, modalidad: 20 };
    expect(elegirModo(p, ["interactivo", "audio_narrativo", "manual"])).toBe("manual");
  });

  it("perfil muy auditivo -> audio_narrativo", () => {
    const p = { ...perfilNeutro, entrada: 20 };
    expect(elegirModo(p, ["interactivo", "audio_narrativo", "manual"])).toBe("audio_narrativo");
  });

  it("perfil neutro -> interactivo", () => {
    expect(elegirModo(perfilNeutro, ["interactivo", "audio_narrativo", "manual"])).toBe("interactivo");
  });

  it("usa respaldo si el modo preferido no esta disponible", () => {
    const p = { ...perfilNeutro, modalidad: 20 }; // querria manual
    expect(elegirModo(p, ["interactivo", "audio_narrativo"])).toBe("interactivo");
  });

  it("sin modos disponibles -> interactivo por defecto", () => {
    expect(elegirModo(perfilNeutro, [])).toBe("interactivo");
  });
});

describe("habilidadMenosReforzada", () => {
  it("elige la de menor maestria", () => {
    const m: MaestriaResumen[] = [
      { habilidad: "logica", maestria: 80 },
      { habilidad: "critica", maestria: 30 },
      { habilidad: "resolucion", maestria: 60 },
    ];
    expect(habilidadMenosReforzada(m)).toBe("critica");
  });

  it("habilidad ausente cuenta como 0", () => {
    const m: MaestriaResumen[] = [{ habilidad: "logica", maestria: 50 }];
    // critica y resolucion estan en 0; gana 'critica' por orden fijo
    expect(habilidadMenosReforzada(m)).toBe("critica");
  });

  it("empate -> orden fijo (logica primero)", () => {
    expect(habilidadMenosReforzada([])).toBe("logica");
  });
});

describe("elegirDificultad", () => {
  it("sin historial -> 1", () => {
    expect(elegirDificultad([])).toBe(1);
  });

  it("promedio alto -> 3", () => {
    const h: ProgresoResumen[] = [
      { lesson_id: "a", habilidad: "logica", completado: true, resultado: 90 },
      { lesson_id: "b", habilidad: "logica", completado: true, resultado: 85 },
    ];
    expect(elegirDificultad(h)).toBe(3);
  });

  it("promedio medio -> 2", () => {
    const h: ProgresoResumen[] = [
      { lesson_id: "a", habilidad: "logica", completado: true, resultado: 60 },
    ];
    expect(elegirDificultad(h)).toBe(2);
  });

  it("ignora lecciones no completadas", () => {
    const h: ProgresoResumen[] = [
      { lesson_id: "a", habilidad: "logica", completado: false, resultado: 0 },
    ];
    expect(elegirDificultad(h)).toBe(1);
  });
});

describe("siguienteLeccion", () => {
  const lecciones: LeccionResumen[] = [
    { id: "brasas-logica-u1-l1", habilidad: "logica", modos: ["interactivo"] },
    { id: "brasas-critica-u1-l1", habilidad: "critica", modos: ["interactivo", "manual"] },
    { id: "brasas-resolucion-u1-l1", habilidad: "resolucion", modos: ["interactivo"] },
  ];

  it("recomienda una leccion de la habilidad menos reforzada", () => {
    const maestria: MaestriaResumen[] = [
      { habilidad: "logica", maestria: 90 },
      { habilidad: "critica", maestria: 10 },
      { habilidad: "resolucion", maestria: 90 },
    ];
    const rec = siguienteLeccion(perfilNeutro, lecciones, [], maestria);
    expect(rec?.leccion.habilidad).toBe("critica");
  });

  it("no repite lecciones ya completadas", () => {
    const historial: ProgresoResumen[] = [
      { lesson_id: "brasas-critica-u1-l1", habilidad: "critica", completado: true, resultado: 100 },
    ];
    const maestria: MaestriaResumen[] = [
      { habilidad: "critica", maestria: 5 },
    ];
    const rec = siguienteLeccion(perfilNeutro, lecciones, historial, maestria);
    expect(rec?.leccion.id).not.toBe("brasas-critica-u1-l1");
  });

  it("devuelve null cuando todo esta completado", () => {
    const historial: ProgresoResumen[] = lecciones.map((l) => ({
      lesson_id: l.id,
      habilidad: l.habilidad,
      completado: true,
      resultado: 100,
    }));
    expect(siguienteLeccion(perfilNeutro, lecciones, historial, [])).toBeNull();
  });

  it("es determinista: misma entrada, misma salida", () => {
    const a = siguienteLeccion(perfilNeutro, lecciones, [], []);
    const b = siguienteLeccion(perfilNeutro, lecciones, [], []);
    expect(a).toEqual(b);
  });
});
