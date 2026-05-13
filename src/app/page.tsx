import Link from "next/link";
import { FileText, Plus, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen dot-grid flex flex-col">
      {/* Gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, #4c6ef5 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] glass">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #4c6ef5, #7c3aed)",
              }}
            >
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500 leading-none mb-0.5">ATM Servicios</p>
              <h1 className="text-sm font-semibold text-slate-200 leading-none">
                Informes OT
              </h1>
            </div>
          </div>
          <Link href="/nuevo" className="btn-primary">
            <Plus className="w-4 h-4" />
            Nuevo Informe
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-2xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{
              background: "rgba(76,110,245,0.12)",
              border: "1px solid rgba(76,110,245,0.25)",
              color: "#818cf8",
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            Sistema de Gestión de Informes
          </div>
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            <span className="text-white">Genera tus</span>{" "}
            <span className="gradient-text">Informes OT</span>{" "}
            <br />
            <span className="text-white">en segundos</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Completa el formulario, sube las imágenes y exporta directamente
            a Word. Todo guardado automáticamente en la nube.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/nuevo" className="btn-primary text-base py-3 px-8">
              <Plus className="w-5 h-5" />
              Crear Nuevo Informe
            </Link>
          </div>
          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-4 mt-16">
            {[
              {
                icon: "📋",
                title: "Formulario Completo",
                desc: "Todos los campos del informe OT en un solo lugar",
              },
              {
                icon: "☁️",
                title: "Guardado en Nube",
                desc: "Datos e imágenes almacenados en Supabase",
              },
              {
                icon: "📄",
                title: "Exportar a Word",
                desc: "Genera .docx profesional con imágenes incluidas",
              },
            ].map((f) => (
              <div key={f.title} className="glass-card p-5 text-left">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
