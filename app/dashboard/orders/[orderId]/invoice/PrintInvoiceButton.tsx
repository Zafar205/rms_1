"use client";

export default function PrintInvoiceButton() {
  const handleClick = () => {
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition-transform hover:scale-[0.99] print:hidden"
    >
      Download PDF
    </button>
  );
}
