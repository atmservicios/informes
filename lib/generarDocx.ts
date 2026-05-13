import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ImageRun,
  PageBreak,
  UnderlineType,
  VerticalAlign,
  ShadingType,
} from 'docx';
import { Informe } from '@/types/informe';
import * as fs from 'fs';
import * as path from 'path';

// Helpers de fecha
function formatFechaDocx(dateString: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy}; ${hh}:${min}`;
  } catch {
    return dateString;
  }
}

// Celda etiqueta (bold, gris claro)
function labelCell(text: string, colSpan = 1): TableCell {
  return new TableCell({
    columnSpan: colSpan,
    shading: { type: ShadingType.CLEAR, fill: 'D9D9D9' },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    },
    children: [
      new Paragraph({
        children: [
          new TextRun({ text, bold: true, size: 24, font: 'Calibri', color: '000000' }),
        ],
      }),
    ],
  });
}

// Celda valor (blanca)
function valueCell(text: string, colSpan = 1): TableCell {
  return new TableCell({
    columnSpan: colSpan,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    },
    children: [
      new Paragraph({
        children: [
          new TextRun({ text, size: 24, font: 'Calibri', color: '000000' }),
        ],
      }),
    ],
  });
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function generarDocx(informe: Informe): Promise<Buffer> {
  // ── Logo ─────────────────────────────────────────
  // Intentar con ambas variantes de capitalización
  const logoPath =
    fs.existsSync(path.join(process.cwd(), 'public', 'Imagen1.jpg'))
      ? path.join(process.cwd(), 'public', 'Imagen1.jpg')
      : path.join(process.cwd(), 'public', 'imagen1.jpg');
  let logoRun: ImageRun | null = null;
  if (fs.existsSync(logoPath)) {
    const logoBuffer = fs.readFileSync(logoPath);
    logoRun = new ImageRun({
      data: logoBuffer,
      transformation: { width: 220, height: 55 },
      type: 'jpg',
    });
  }

  // ── Página 1 ──────────────────────────────────────

  // ── Encabezado (Logo a la izquierda, OT a la derecha) ────────────────
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: logoRun
                  ? [logoRun]
                  : [new TextRun({ text: "ATM'S Servicios", bold: true, size: 28, font: 'Calibri', color: '4a7c4e' })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `OT: ${informe.numeroOT || '____'}`,
                    bold: true,
                    size: 24, // 12pt
                    font: 'Calibri',
                    color: '000000',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Título principal subrayado y centrado
  const tituloParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 300 },
    children: [
      new TextRun({
        text: 'INFORME DE ORDEN DE TRABAJO',
        bold: true,
        size: 36,
        font: 'Calibri',
        color: '000000',
        underline: { type: UnderlineType.SINGLE },
      }),
    ],
  });

  // Texto introductorio
  const solicitanteTexto = informe.destinatario || informe.solicitante || '___________';
  const introText = new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 200 },
    children: [
      new TextRun({ text: 'Estimados ', size: 24, font: 'Calibri', color: '000000' }),
      new TextRun({ text: solicitanteTexto, bold: true, size: 24, font: 'Calibri', color: '000000',
        underline: { type: UnderlineType.SINGLE } }),
      new TextRun({ text: ', informo a ustedes detalle de la supervisión realizada.', size: 24, font: 'Calibri', color: '000000' }),
    ],
  });

  // ── Tabla de datos ────────────────────────────────
  // Columnas: [label(30%) | value(70%)] o [label(20%) | value(30%) | label(20%) | value(30%)]
  // Total 9180 twips (100% = 9180 en carta)

  const COL_LBL1 = 2500; // Columna 1
  const COL_VAL2 = 2250; // Columna 2
  const COL_LBL2 = 2000; // Columna 3
  const COL_VAL_FIN = 2250; // Columna 4 (Total 9000)
  const COL_TOTAL_VAL = COL_VAL2 + COL_LBL2 + COL_VAL_FIN; // 6500

  function fullRow(label: string, value: string): TableRow {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: COL_LBL1, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: 'D9D9D9' },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
          borders: allBorders(),
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 24, font: 'Calibri', color: '000000' })] })],
        }),
        new TableCell({
          width: { size: COL_TOTAL_VAL, type: WidthType.DXA },
          columnSpan: 3,
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
          borders: allBorders(),
          children: [new Paragraph({ children: [new TextRun({ text: value, size: 24, font: 'Calibri', color: '000000' })] })],
        }),
      ],
    });
  }

  function splitRow(label1: string, val1: string, label2: string, val2: string): TableRow {
    return new TableRow({
      children: [
        mkCell(label1, COL_LBL1, true),
        mkCell(val1, COL_VAL2, false),
        mkCell(label2, COL_LBL2, true),
        mkCell(val2, COL_VAL_FIN, false),
      ],
    });
  }

  function mkCell(text: string, width: number, isLabel: boolean): TableCell {
    return new TableCell({
      width: { size: width, type: WidthType.DXA },
      shading: isLabel ? { type: ShadingType.CLEAR, fill: 'D9D9D9' } : undefined,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      borders: allBorders(),
      children: [new Paragraph({ children: [new TextRun({ text, bold: isLabel, size: 24, font: 'Calibri', color: '000000' })] })],
    });
  }

  function allBorders() {
    return {
      top: { style: BorderStyle.SINGLE, size: 12, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 12, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 12, color: '000000' },
    };
  }

  const dataTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      fullRow('Dirección', informe.direccion || ''),
      fullRow('Ubicación', informe.ubicacion || ''),
      fullRow('Comuna', informe.comuna || ''),
      splitRow('Número ATM', informe.numeroATM || '', '# Serie ATM', informe.serieATM || ''),
      splitRow('Modelo MMBB', informe.modeloMMBB || '', '# Serie MMBB', informe.serieMMBB || ''),
      fullRow('Solicitante', informe.solicitante || ''),
      fullRow('Técnico Supervisor', informe.tecnicoSupervisor || ''),
      splitRow('Fecha Inicio Trab.', formatFechaDocx(informe.fechaInicio), 'Fecha Fin Trab.', formatFechaDocx(informe.fechaFin)),
      // fila vacía
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 4,
            borders: allBorders(),
            children: [new Paragraph({ children: [new TextRun({ text: '' })] })],
          }),
        ],
      }),
      fullRow('Valor Servicio', informe.valorServicio || ''),
    ],
  });

  // Espacios y secciones de texto
  const espacioParagraph = new Paragraph({ spacing: { after: 200 }, children: [] });

  const makeSection = (titulo: string, contenido: string) => [
    new Paragraph({
      spacing: { before: 300, after: 100 },
      children: [new TextRun({ text: titulo, bold: true, size: 24, font: 'Calibri', underline: { type: UnderlineType.SINGLE } })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: contenido || '', size: 24, font: 'Calibri' })],
    }),
  ];

  // ── Páginas de imágenes ───────────────────────────
  const imageChildren: (Paragraph | Table)[] = [];

  if (informe.imagenes && informe.imagenes.length > 0) {
    imageChildren.push(new Paragraph({ children: [new PageBreak()] }));
    imageChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [new TextRun({ text: 'REGISTRO FOTOGRÁFICO', bold: true, size: 24, font: 'Calibri', underline: { type: UnderlineType.SINGLE } })],
      })
    );

    const buffers = await Promise.all(informe.imagenes.map(fetchImageBuffer));
    const chunks: (Buffer | null)[][] = [];
    for (let i = 0; i < buffers.length; i += 4) chunks.push(buffers.slice(i, i + 4));

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunk = chunks[ci];
      if (ci > 0) {
        imageChildren.push(new Paragraph({ children: [new PageBreak()] }));
        imageChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({ text: 'REGISTRO FOTOGRÁFICO (cont.)', bold: true, size: 24, font: 'Calibri', underline: { type: UnderlineType.SINGLE } })],
          })
        );
      }

      for (let row = 0; row < 2; row++) {
        const left = chunk[row * 2];
        const right = chunk[row * 2 + 1];

        const makeImgCell = (buf: Buffer | null, idx: number): TableCell =>
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 80, right: 80 },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: buf
              ? [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new ImageRun({ data: buf, transformation: { width: 290, height: 220 }, type: 'jpg' })],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: `Foto ${ci * 4 + row * 2 + idx + 1}`, size: 16, font: 'Calibri', italics: true, color: '555555' })],
                  }),
                ]
              : [new Paragraph({ children: [] })],
          });

        imageChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [new TableRow({ children: [makeImgCell(left, 0), makeImgCell(right, 1)] })],
          })
        );
        imageChildren.push(new Paragraph({ spacing: { after: 180 }, children: [] }));
      }
    }
  }

  // ── Construir documento ───────────────────────────
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 20, color: '000000' } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 900, right: 900 },
          },
        },
        children: [
          headerTable,
          new Paragraph({ spacing: { after: 300 }, children: [] }), // Espacio después del header
          tituloParagraph,
          introText,
          dataTable,
          espacioParagraph,
          ...makeSection('Detalle del Trabajo:', informe.detalle),
          ...makeSection('Resumen del Trabajo:', informe.resumenTrabajo),
          ...imageChildren,
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
