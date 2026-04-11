import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';
import mammoth from 'mammoth';
import * as xlsx from 'xlsx';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    const mime = file.type;
    const name = file.name.toLowerCase();

    if (mime === 'application/pdf' || name.endsWith('.pdf')) {
      text = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true);
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
        pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
        pdfParser.parseBuffer(buffer);
      });
    }
    else if (name.endsWith('.docx') || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const parsed = await mammoth.extractRawText({ buffer });
      text = parsed.value;
    }
    else if (name.endsWith('.xlsx') || name.endsWith('.xls') || mime.includes('spreadsheet') || mime.includes('excel')) {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      text = xlsx.utils.sheet_to_csv(worksheet);
    } 
    else {
      return NextResponse.json({ error: "Formato no soportado. Usa PDF, DOCX o XLSX." }, { status: 400 });
    }

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: "No se pudo extraer texto. Asegúrate de que el documento no sea una imagen escaneada." }, { status: 400 });
    }

    return NextResponse.json({ text: text.trim() });
  } catch (error: any) {
    console.error("Parse Error:", error);
    return NextResponse.json({ error: "Error interno: " + (error?.message || String(error)) }, { status: 500 });
  }
}
