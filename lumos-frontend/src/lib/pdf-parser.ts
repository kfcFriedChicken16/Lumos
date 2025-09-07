// PDF Processing Library using PDF.js (Client-side only)
let pdfjsLib: any = null;

// Dynamically import PDF.js only on client-side
const loadPdfJs = async () => {
  if (typeof window === 'undefined') {
    throw new Error('PDF processing is only available on the client-side');
  }
  
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }
  
  return pdfjsLib;
};

export interface OutlineNode {
  id: string;
  title: string;
  level: number;    // 1=chapter, 2=section, 3=subsection
  text: string;     // concatenated raw text
  children: OutlineNode[];
}

export interface PdfParseResult {
  pages: string[];
  outline: OutlineNode[];
  totalPages: number;
}

export async function parsePdf(file: File): Promise<PdfParseResult> {
  const pdfjs = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  
  const pages: string[] = [];
  
  // Extract text from all pages
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pages.push(text);
  }
  
  // Build outline from extracted text
  const outline = buildHeuristicOutline(pages);
  
  return {
    pages,
    outline,
    totalPages: pdf.numPages
  };
}

// Simple heuristic outline builder
function buildHeuristicOutline(pages: string[]): OutlineNode[] {
  const headingRegex = /\b((Chapter|CHAPTER)\s+\d+|[A-Z][A-Z \d:&-]{6,}|^\d+(\.\d+){0,2}\s+[A-Z].{3,})/g;
  const nodes: OutlineNode[] = [];
  let current1: OutlineNode | null = null;
  let current2: OutlineNode | null = null;

  const pushText = (node: OutlineNode, text: string) => {
    node.text += ' ' + text;
  };

  pages.forEach((raw, pageIndex) => {
    // Split into candidate lines
    const lines = raw.split(/(?<=\.|\?|!)\s+|[\n\r]+/);
    
    for (const lineRaw of lines) {
      const line = lineRaw.trim();
      if (!line) continue;

      const isHeading = headingRegex.test(line);
      headingRegex.lastIndex = 0;

      if (isHeading) {
        const level = guessLevel(line);
        const node: OutlineNode = {
          id: `${pageIndex}-${Math.random().toString(36).slice(2)}`,
          title: cleanTitle(line),
          level,
          text: '',
          children: []
        };

        if (level === 1) {
          nodes.push(node);
          current1 = node;
          current2 = null;
        } else if (level === 2) {
          if (!current1) {
            current1 = {
              id: `auto-${pageIndex}`,
              title: 'Chapter',
              level: 1,
              text: '',
              children: []
            };
            nodes.push(current1);
          }
          current1.children.push(node);
          current2 = node;
        } else {
          const parent = current2 ?? current1;
          if (!parent) {
            current1 = {
              id: `auto-${pageIndex}`,
              title: 'Chapter',
              level: 1,
              text: '',
              children: []
            };
            nodes.push(current1);
          }
          (current2 ?? current1)!.children.push(node);
        }
      } else {
        if (current2) pushText(current2, line);
        else if (current1) pushText(current1, line);
        else {
          current1 = {
            id: `intro-${pageIndex}`,
            title: 'Introduction',
            level: 1,
            text: line,
            children: []
          };
          nodes.push(current1);
        }
      }
    }
  });

  return nodes;
}

function guessLevel(title: string): number {
  if (/chapter\s+\d+/i.test(title)) return 1;
  if (/^\d+(\.\d+)?\s+/.test(title)) return 2;     // 1, 1.1
  if (/^\d+\.\d+\.\d+\s+/.test(title)) return 3;   // 1.1.1
  if (/^[A-Z ][A-Z \d:&-]{8,}$/.test(title)) return 1; // BIG CAPS line
  return 2;
}

function cleanTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim();
}

// Extract subtopics from outline for study pack generation
export function extractSubtopics(outline: OutlineNode[]): string[] {
  const subtopics: string[] = [];
  
  function traverse(nodes: OutlineNode[]) {
    for (const node of nodes) {
      if (node.level <= 2 && node.title.length > 3) {
        subtopics.push(node.title);
      }
      if (node.children.length > 0) {
        traverse(node.children);
      }
    }
  }
  
  traverse(outline);
  return [...new Set(subtopics)]; // Remove duplicates
}

// Generate study pack from PDF content
export async function generateStudyPackFromPdf(
  pdfResult: PdfParseResult,
  apiClient: any
): Promise<any> {
  const subtopics = extractSubtopics(pdfResult.outline);
  
  // For now, return a basic study pack structure
  // In a real implementation, you'd send this to your LLM API
  return {
    topic: pdfResult.outline[0]?.title || 'PDF Content',
    subtopics: subtopics.slice(0, 5), // Limit to 5 subtopics
    questions: [] // Would be generated by LLM
  };
}
