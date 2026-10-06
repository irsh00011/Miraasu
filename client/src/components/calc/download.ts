/**
 * Download the result as a PDF.
 *
 * Opens the browser print dialog showing ONLY the clean result summary sheet,
 * so the user picks "Save as PDF" and gets a real .pdf file.
 *
 * Why print instead of a PDF library: client-side PDF generators (jsPDF etc.)
 * cannot shape Tamil, Arabic or Urdu text — letters render disconnected or as
 * boxes. The OS print pipeline renders all four languages perfectly.
 */
export function printSummaryAsPdf(filename: string) {
  const previousTitle = document.title;
  document.title = filename;
  document.body.classList.add("print-summary");
  const cleanup = () => {
    document.body.classList.remove("print-summary");
    document.title = previousTitle;
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
  // Fallback for browsers where afterprint is unreliable (some mobile browsers)
  window.setTimeout(cleanup, 2000);
}
