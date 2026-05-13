'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Informe } from '@/types/informe';
import InputField from '@/components/InputField';
import ImageUploader from '@/components/ImageUploader';
import {
  Save,
  FileDown,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  MapPin,
  Server,
  Cpu,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const emptyForm = (): Omit<Informe, 'id'> => ({
  numeroOT: '',
  destinatario: '',
  direccion: '',
  ubicacion: '',
  comuna: '',
  numeroATM: '',
  serieATM: '',
  modeloMMBB: '',
  serieMMBB: '',
  solicitante: '',
  tecnicoSupervisor: '',
  fechaInicio: '',
  fechaFin: '',
  valorServicio: '',
  detalle: '',
  resumenTrabajo: '',
  imagenes: [],
});

type Status = { type: 'idle' | 'saving' | 'saved' | 'error'; message?: string };

export default function FormularioInforme() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm());
  const [savedId, setSavedId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ type: 'idle' });
  const [generando, setGenerando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagesReady = (urls: string[]) => {
    setForm((prev) => ({ ...prev, imagenes: urls }));
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar configuración de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (!supabaseUrl || supabaseUrl.includes('YOUR_PROJECT')) {
      setStatus({
        type: 'error',
        message: '⚙️ Configura las credenciales de Supabase en .env.local',
      });
      return;
    }

    setStatus({ type: 'saving' });

    const payload = {
      numero_ot: form.numeroOT,
      destinatario: form.destinatario,
      direccion: form.direccion,
      ubicacion: form.ubicacion,
      comuna: form.comuna,
      numero_atm: form.numeroATM,
      serie_atm: form.serieATM,
      modelo_mmbb: form.modeloMMBB,
      serie_mmbb: form.serieMMBB,
      solicitante: form.solicitante,
      tecnico_supervisor: form.tecnicoSupervisor,
      fecha_inicio: form.fechaInicio || null,
      fecha_fin: form.fechaFin || null,
      valor_servicio: form.valorServicio,
      detalle: form.detalle,
      resumen_trabajo: form.resumenTrabajo,
      imagenes: form.imagenes,
    };

    try {
      let result;
      if (savedId) {
        result = await supabase
          .from('informes')
          .update(payload)
          .eq('id', savedId)
          .select()
          .single();
      } else {
        result = await supabase.from('informes').insert(payload).select().single();
      }

      if (result.error) {
        setStatus({ type: 'error', message: result.error.message });
        return;
      }

      setSavedId(result.data.id);
      setStatus({ type: 'saved', message: 'Informe guardado correctamente' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de conexión';
      setStatus({
        type: 'error',
        message: `Error de conexión con Supabase: ${msg}`,
      });
    }
  };

  const handleGenerarDocx = async () => {
    // Generar Word sin necesidad de Supabase (usa datos del form local)
    setGenerando(true);
    try {
      const res = await fetch('/api/generar-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ informe: { ...form, id: savedId ?? 'borrador' } }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(err.error || 'Error generando documento');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Informe-OT-${form.numeroATM || 'nuevo'}-${Date.now()}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus({ type: 'saved', message: 'Documento generado y descargado ✓' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setStatus({ type: 'error', message: msg });
    } finally {
      setGenerando(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleGuardar} noValidate>
      {/* Status Bar */}
      {status.type !== 'idle' && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl transition-all duration-300"
          style={{
            background:
              status.type === 'saved'
                ? 'rgba(16,185,129,0.15)'
                : status.type === 'error'
                ? 'rgba(239,68,68,0.15)'
                : 'rgba(76,110,245,0.15)',
            border:
              status.type === 'saved'
                ? '1px solid rgba(16,185,129,0.3)'
                : status.type === 'error'
                ? '1px solid rgba(239,68,68,0.3)'
                : '1px solid rgba(76,110,245,0.3)',
            color:
              status.type === 'saved'
                ? '#10b981'
                : status.type === 'error'
                ? '#f87171'
                : '#818cf8',
          }}
        >
          {status.type === 'saved' && <CheckCircle className="w-4 h-4" />}
          {status.type === 'error' && <AlertCircle className="w-4 h-4" />}
          {status.type === 'saving' && (
            <span className="inline-block w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          )}
          {status.type === 'saving' ? 'Guardando...' : status.message}
        </div>
      )}

      <div className="space-y-6">
        <Section icon={<FileText className="w-4 h-4" />} title="General">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="numeroOT"
              name="numeroOT"
              label="Número de OT"
              value={form.numeroOT}
              onChange={handleChange}
              placeholder="Ej: 12345"
              required
            />
          </div>
        </Section>

        {/* ── Sección 1: Ubicación ── */}
        <Section icon={<MapPin className="w-4 h-4" />} title="Ubicación">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              id="direccion"
              name="direccion"
              label="Dirección"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Ej: Av. Principal 123"
              required
            />
            <InputField
              id="ubicacion"
              name="ubicacion"
              label="Ubicación / Referencia"
              value={form.ubicacion}
              onChange={handleChange}
              placeholder="Ej: Entrada principal"
            />
            <InputField
              id="comuna"
              name="comuna"
              label="Comuna"
              value={form.comuna}
              onChange={handleChange}
              placeholder="Ej: Santiago"
              required
            />
          </div>
        </Section>

        {/* ── Sección 2: Equipos ATM ── */}
        <Section icon={<Server className="w-4 h-4" />} title="Datos del ATM">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="numeroATM"
              name="numeroATM"
              label="Número ATM"
              value={form.numeroATM}
              onChange={handleChange}
              placeholder="Ej: 00123"
              required
            />
            <InputField
              id="serieATM"
              name="serieATM"
              label="Serie ATM"
              value={form.serieATM}
              onChange={handleChange}
              placeholder="Ej: ATM-XYZ-2024"
            />
          </div>
        </Section>

        {/* ── Sección 3: MMBB ── */}
        <Section icon={<Cpu className="w-4 h-4" />} title="Datos MMBB">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="modeloMMBB"
              name="modeloMMBB"
              label="Modelo MMBB"
              value={form.modeloMMBB}
              onChange={handleChange}
              placeholder="Ej: Wincor Nixdorf 2550"
            />
            <InputField
              id="serieMMBB"
              name="serieMMBB"
              label="Serie MMBB"
              value={form.serieMMBB}
              onChange={handleChange}
              placeholder="Ej: MMBB-001"
            />
          </div>
        </Section>

        {/* ── Sección 4: Personal ── */}
        <Section icon={<Users className="w-4 h-4" />} title="Personal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="destinatario"
              name="destinatario"
              label="Destinatario (para &quot;Estimados...&quot;)"
              value={form.destinatario}
              onChange={handleChange}
              placeholder="Ej: Carol, Gerencia, Sr. Pérez"
              required
            />
            <InputField
              id="solicitante"
              name="solicitante"
              label="Solicitante"
              value={form.solicitante}
              onChange={handleChange}
              placeholder="Nombre del solicitante"
            />
            <InputField
              id="tecnicoSupervisor"
              name="tecnicoSupervisor"
              label="Técnico / Supervisor"
              value={form.tecnicoSupervisor}
              onChange={handleChange}
              placeholder="Nombre del técnico"
              required
            />
          </div>
        </Section>

        {/* ── Sección 5: Fechas y Valor ── */}
        <Section icon={<Calendar className="w-4 h-4" />} title="Período y Servicio">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              id="fechaInicio"
              name="fechaInicio"
              label="Fecha y Hora Inicio"
              type="datetime-local"
              value={form.fechaInicio}
              onChange={handleChange}
              required
            />
            <InputField
              id="fechaFin"
              name="fechaFin"
              label="Fecha y Hora Fin"
              type="datetime-local"
              value={form.fechaFin}
              onChange={handleChange}
              required
            />
            <InputField
              id="valorServicio"
              name="valorServicio"
              label="Valor del Servicio"
              type="text"
              value={form.valorServicio}
              onChange={handleChange}
              placeholder="Ej: $ 139.000 + IVA"
            />
          </div>
        </Section>

        {/* ── Sección 6: Descripción ── */}
        <Section icon={<FileText className="w-4 h-4" />} title="Descripción del Trabajo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="detalle"
              name="detalle"
              label="Detalle del Trabajo"
              value={form.detalle}
              onChange={handleChange}
              placeholder="Describe en detalle el trabajo realizado..."
              multiline
              rows={5}
              required
            />
            <InputField
              id="resumenTrabajo"
              name="resumenTrabajo"
              label="Resumen del Trabajo"
              value={form.resumenTrabajo}
              onChange={handleChange}
              placeholder="Resumen ejecutivo del trabajo..."
              multiline
              rows={5}
            />
          </div>
        </Section>

        {/* ── Sección 7: Imágenes ── */}
        <Section icon={<ImageIcon className="w-4 h-4" />} title="Imágenes del Trabajo">
          {savedId ? (
            <ImageUploader
              informeId={savedId}
              onUploadComplete={handleImagesReady}
              existingUrls={form.imagenes}
            />
          ) : (
            <div
              className="rounded-xl p-6 text-center"
              style={{
                background: 'rgba(76,110,245,0.05)',
                border: '1px dashed rgba(76,110,245,0.2)',
              }}
            >
              <ImageIcon className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              <p className="text-sm text-slate-500">
                Primero guarda el informe para poder subir imágenes
              </p>
            </div>
          )}
        </Section>

        {/* ── Acciones ── */}
        <div
          className="flex flex-col sm:flex-row gap-3 pt-2 pb-4 sticky bottom-0"
          style={{
            background: 'linear-gradient(to top, rgba(15,23,42,1) 80%, transparent)',
            paddingTop: '1.5rem',
          }}
        >
          <button
            type="submit"
            disabled={status.type === 'saving'}
            className="btn-primary flex-1 sm:flex-none py-3"
            id="btn-guardar"
          >
            {status.type === 'saving' ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {savedId ? 'Actualizar Informe' : 'Guardar Informe'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleGenerarDocx}
            disabled={generando}
            className="btn-success flex-1 sm:flex-none py-3"
            id="btn-generar-docx"
          >
            {generando ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Generando...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Generar Word
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card p-6">
      <div className="section-title">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}
