"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Download,
  AlertCircle,
} from "lucide-react";
import type {
  PDFDocumentProxy,
  PDFDocumentLoadingTask,
  RenderTask,
} from "pdfjs-dist";
import type { PdfAsset } from "@/data/portfolio";
import { cloudinaryPdfDownload } from "@/lib/cloudinary";

export default function PdfViewer({ asset }: { asset: PdfAsset }) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [mode, setMode] = useState<"page" | "width">("page");
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Loading PDF…");
  const [pageText, setPageText] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let task: PDFDocumentLoadingTask | undefined;
    void import("pdfjs-dist")
      .then((pdfjs) => {
        if (disposed) return;
        pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs/pdf.worker.min.mjs?v=${pdfjs.version}`;
        task = pdfjs.getDocument({ url: asset.src });
        task.onProgress = ({
          loaded,
          total,
        }: {
          loaded: number;
          total: number;
        }) => {
          if (!disposed && total)
            setStatus(`Loading PDF ${Math.round((loaded / total) * 100)}%`);
        };
        return task.promise;
      })
      .then((pdf) => {
        if (!disposed && pdf) {
          setDocument(pdf);
          setStatus("");
        }
      })
      .catch(() => {
        if (!disposed) {
          setError(
            "Unable to load this PDF. Open the original document below.",
          );
          setStatus("");
        }
      });
    return () => {
      disposed = true;
      void task?.destroy().catch(() => {});
    };
  }, [asset.src]);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    let resizeTimer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(([entry]) => {
      clearTimeout(resizeTimer);
      const next = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      };
      resizeTimer = setTimeout(() => setSize(next), 120);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => {
    if (!document || !canvas.current || size.width <= 1) return;
    let disposed = false;
    let render: RenderTask | undefined;
    const target = canvas.current;
    void document
      .getPage(page)
      .then(async (pdfPage) => {
        if (disposed) return;
        const natural = pdfPage.getViewport({ scale: 1 });
        const widthFit = Math.max(1, size.width - 48) / natural.width;
        const pageFit = Math.min(
          widthFit,
          Math.max(1, size.height - 32) / natural.height,
        );
        const view = pdfPage.getViewport({
          scale: (mode === "width" ? widthFit : pageFit) * scale,
        });
        const ratio = Math.min(
          window.devicePixelRatio || 1,
          2,
          Math.sqrt(16_000_000 / (view.width * view.height)),
        );
        target.width = Math.max(1, Math.floor(view.width * ratio));
        target.height = Math.max(1, Math.floor(view.height * ratio));
        target.style.width = `${view.width}px`;
        target.style.height = `${view.height}px`;
        render = pdfPage.render({
          canvas: target,
          viewport: view,
          transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
        });
        const text = await pdfPage.getTextContent();
        if (!disposed)
          setPageText(
            text.items.map((item) => ("str" in item ? item.str : "")).join(" "),
          );
        await render.promise;
        if (!disposed) setStatus("");
      })
      .catch((reason: unknown) => {
        if (
          !disposed &&
          !(
            reason instanceof Error &&
            reason.name === "RenderingCancelledException"
          )
        )
          setError(
            "Unable to display this page. You can open the original PDF.",
          );
      });
    return () => {
      disposed = true;
      render?.cancel();
    };
  }, [document, page, scale, mode, size]);

  function turnPage(next: number) {
    setPage(Math.max(1, Math.min(document?.numPages ?? 1, next)));
    viewport.current?.scrollTo({ top: 0, left: 0 });
  }
  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar" role="group" aria-label="PDF controls">
        <button
          className="icon-button"
          aria-label="Previous PDF page"
          disabled={!document || page === 1}
          onClick={() => turnPage(page - 1)}
        >
          <ArrowLeft size={18} />
        </button>
        <label className="pdf-page-control">
          Page
          <input
            type="number"
            aria-label="PDF page number"
            min={1}
            max={document?.numPages ?? 1}
            value={page}
            disabled={!document}
            onChange={(event) => turnPage(Number(event.target.value) || 1)}
          />
        </label>
        <span className="pdf-page-total" aria-live="polite">
          / {document?.numPages ?? "—"}
        </span>
        <button
          className="icon-button"
          aria-label="Next PDF page"
          disabled={!document || page === document.numPages}
          onClick={() => turnPage(page + 1)}
        >
          <ArrowRight size={18} />
        </button>
        <button
          className="icon-button"
          aria-label="Zoom PDF out"
          disabled={scale <= 0.5 || !document}
          onClick={() => setScale(Math.max(0.5, scale / 1.25))}
        >
          <ZoomOut size={18} />
        </button>
        <output aria-label="PDF zoom level">{Math.round(scale * 100)}%</output>
        <button
          className="icon-button"
          aria-label="Zoom PDF in"
          disabled={scale >= 4 || !document}
          onClick={() => setScale(Math.min(4, scale * 1.25))}
        >
          <ZoomIn size={18} />
        </button>
        <button
          className="zoom-fit-button"
          disabled={!document}
          onClick={() => {
            setMode("width");
            setScale(1);
          }}
        >
          Fit width
        </button>
        <button
          className="zoom-fit-button"
          disabled={!document}
          onClick={() => {
            setMode("page");
            setScale(1);
          }}
        >
          Fit page
        </button>
        <a
          className="icon-button"
          href={cloudinaryPdfDownload(asset.src)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download PDF"
        >
          <Download size={18} />
        </a>
      </div>
      <div
        ref={viewport}
        className="pdf-viewport"
        tabIndex={0}
        role="region"
        aria-label="PDF document pages"
      >
        <div className="pdf-canvas-wrap">
          <canvas
            ref={canvas}
            role="img"
            aria-label={`${asset.alt}, page ${page}`}
          />
        </div>
        {status && (
          <div className="pdf-status" role="status">
            {status}
          </div>
        )}
        {error && (
          <div className="pdf-error" role="alert">
            <AlertCircle size={24} />
            <p>{error}</p>
            <a
              className="button button-outline"
              href={asset.src}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open original PDF
              <ExternalLink size={16} />
            </a>
          </div>
        )}
        <p className="sr-only">{pageText}</p>
      </div>
    </div>
  );
}
