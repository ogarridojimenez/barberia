import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const HORARIOS_MAÑANA = ["08:00:00", "08:30:00", "09:00:00", "09:30:00", "10:00:00", "10:30:00", "11:00:00", "11:30:00"];
const HORARIOS_TARDE = ["14:00:00", "14:30:00", "15:00:00", "15:30:00", "16:00:00", "16:30:00", "17:00:00", "17:30:00"];
const TODOS_HORARIOS = [...HORARIOS_MAÑANA, ...HORARIOS_TARDE];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get("fecha");

    if (!fecha) {
      return NextResponse.json(
        { error: "MISSING_DATE", details: "Fecha requerida" },
        { status: 400 }
      );
    }

    const fechaObj = new Date(fecha + "T00:00:00");
    const diaSemana = fechaObj.getDay();

    if (diaSemana === 0) {
      return NextResponse.json(
        { error: "DIA_NO_HABIL", details: "La barbería no abre los domingos" },
        { status: 400 }
      );
    }

    if (diaSemana === 6) {
      return NextResponse.json(
        { error: "DIA_NO_HABIL", details: "La barbería no abre los sábados" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: citasExistentes, error: citasError } = await supabase
      .from("citas")
      .select("hora_inicio, hora_fin")
      .eq("barbero_id", id)
      .eq("fecha", fecha)
      .in("estado", ["activa"]);

    if (citasError) {
      return NextResponse.json(
        { error: "DB_ERROR", details: citasError.message },
        { status: 500 }
      );
    }

    const horasOcupadas = new Set(citasExistentes?.map(c => c.hora_inicio) || []);

    const horarios = TODOS_HORARIOS.map((horaInicio, index) => {
      const horaFin = TODOS_HORARIOS[index + 1] || "18:00:00";
      const disponible = !horasOcupadas.has(horaInicio);
      return {
        id: `${id}-${fecha}-${horaInicio}`,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        disponible
      };
    });

    const horariosDisponibles = horarios.filter(h => h.disponible);

    return NextResponse.json({ 
      horarios, 
      horariosDisponibles,
      citas: citasExistentes || []
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
