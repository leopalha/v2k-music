import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Transaction {
  id: string;
  type: "BUY" | "SELL" | "TRANSFER" | "ROYALTY_CLAIM" | "DEPOSIT" | "WITHDRAWAL";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  amount: number;
  price: number;
  totalValue: number;
  fee: number;
  track: {
    title: string;
    artistName: string;
  };
  createdAt: string;
}

interface Summary {
  totalInvested: number;
  totalRoyalties: number;
  totalWithdrawn: number;
  totalTransactions: number;
}

const V2K_COLORS = {
  primary: [139, 92, 246], // #8B5CF6 - Purple
  secondary: [236, 72, 153], // #EC4899 - Pink
  accent: [251, 191, 36], // #FBBF24 - Yellow
  success: [34, 197, 94], // #22C55E - Green
  error: [239, 68, 68], // #EF4444 - Red
  text: [17, 24, 39], // #111827 - Dark gray
  textSecondary: [107, 114, 128], // #6B7280 - Medium gray
};

export function exportTransactionsToPDF(
  transactions: Transaction[],
  summary: Summary,
  filters?: {
    type?: string;
    status?: string;
    dateRange?: { startDate: Date | null; endDate: Date | null };
  }
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Header with gradient-like effect
  doc.setFillColor(
    V2K_COLORS.primary[0],
    V2K_COLORS.primary[1],
    V2K_COLORS.primary[2]
  );
  doc.rect(0, 0, pageWidth, 50, "F");

  // V2K Logo Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("V2K", 20, 25);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Music Investment Platform", 20, 35);

  // Document Title
  yPos = 60;
  doc.setTextColor(
    V2K_COLORS.text[0],
    V2K_COLORS.text[1],
    V2K_COLORS.text[2]
  );
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Transações", 20, yPos);

  // Date generated
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(
    V2K_COLORS.textSecondary[0],
    V2K_COLORS.textSecondary[1],
    V2K_COLORS.textSecondary[2]
  );
  doc.text(
    `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
    20,
    yPos
  );

  // Filter information
  if (filters) {
    yPos += 6;
    const filterTexts: string[] = [];

    if (filters.type) {
      const typeLabels: Record<string, string> = {
        BUY: "Compras",
        SELL: "Vendas",
        ROYALTY_CLAIM: "Royalties",
        TRANSFER: "Transferências",
      };
      filterTexts.push(`Tipo: ${typeLabels[filters.type] || filters.type}`);
    }

    if (filters.status) {
      const statusLabels: Record<string, string> = {
        COMPLETED: "Concluídas",
        PENDING: "Pendentes",
        FAILED: "Falhadas",
      };
      filterTexts.push(`Status: ${statusLabels[filters.status] || filters.status}`);
    }

    if (filters.dateRange?.startDate || filters.dateRange?.endDate) {
      const start = filters.dateRange.startDate
        ? new Date(filters.dateRange.startDate).toLocaleDateString("pt-BR")
        : "Início";
      const end = filters.dateRange.endDate
        ? new Date(filters.dateRange.endDate).toLocaleDateString("pt-BR")
        : "Hoje";
      filterTexts.push(`Período: ${start} - ${end}`);
    }

    if (filterTexts.length > 0) {
      doc.text(`Filtros aplicados: ${filterTexts.join(" • ")}`, 20, yPos);
    }
  }

  // Summary Section
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    V2K_COLORS.text[0],
    V2K_COLORS.text[1],
    V2K_COLORS.text[2]
  );
  doc.text("Resumo", 20, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Summary boxes
  const summaryData = [
    {
      label: "Total Investido",
      value: `R$ ${summary.totalInvested.toFixed(2)}`,
      color: V2K_COLORS.primary,
    },
    {
      label: "Total em Royalties",
      value: `R$ ${summary.totalRoyalties.toFixed(2)}`,
      color: V2K_COLORS.success,
    },
    {
      label: "Total Retirado",
      value: `R$ ${summary.totalWithdrawn.toFixed(2)}`,
      color: V2K_COLORS.accent,
    },
    {
      label: "Transações",
      value: summary.totalTransactions.toString(),
      color: V2K_COLORS.secondary,
    },
  ];

  const boxWidth = (pageWidth - 50) / 4;
  summaryData.forEach((item, index) => {
    const xPos = 20 + index * (boxWidth + 3);

    // Box background
    doc.setFillColor(item.color[0], item.color[1], item.color[2], 0.1);
    doc.roundedRect(xPos, yPos, boxWidth, 18, 2, 2, "F");

    // Label
    doc.setTextColor(
      V2K_COLORS.textSecondary[0],
      V2K_COLORS.textSecondary[1],
      V2K_COLORS.textSecondary[2]
    );
    doc.setFontSize(8);
    doc.text(item.label, xPos + 3, yPos + 5);

    // Value
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(item.value, xPos + 3, yPos + 13);
  });

  doc.setFont("helvetica", "normal");

  // Transactions Table
  yPos += 28;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    V2K_COLORS.text[0],
    V2K_COLORS.text[1],
    V2K_COLORS.text[2]
  );
  doc.text("Transações", 20, yPos);

  yPos += 3;

  const tableData = transactions.map((tx) => [
    new Date(tx.createdAt).toLocaleDateString("pt-BR"),
    getTypeLabel(tx.type),
    `${tx.track.title}\n${tx.track.artistName}`,
    tx.amount.toString(),
    `R$ ${tx.totalValue.toFixed(2)}`,
    getStatusLabel(tx.status),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Data", "Tipo", "Música", "Qtd", "Valor", "Status"]],
    body: tableData,
    theme: "striped",
headStyles: {
      fillColor: [V2K_COLORS.primary[0], V2K_COLORS.primary[1], V2K_COLORS.primary[2]] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: "bold",
      fontSize: 9,
    },
bodyStyles: {
      fontSize: 8,
      textColor: [V2K_COLORS.text[0], V2K_COLORS.text[1], V2K_COLORS.text[2]] as [number, number, number],
    },
alternateRowStyles: {
      fillColor: [249, 250, 251] as [number, number, number],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 25 },
      2: { cellWidth: 60 },
      3: { cellWidth: 18 },
      4: { cellWidth: 28 },
      5: { cellWidth: 25 },
    },
    styles: {
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    didDrawCell: (data) => {
      // Color code transaction types
      if (data.column.index === 1 && data.section === "body") {
        const type = transactions[data.row.index].type;
        let color = V2K_COLORS.text;

        if (type === "BUY") color = [59, 130, 246]; // Blue
        else if (type === "SELL") color = [249, 115, 22]; // Orange
        else if (type === "ROYALTY_CLAIM") color = V2K_COLORS.success;

        doc.setTextColor(color[0], color[1], color[2]);
      }

      // Color code status
      if (data.column.index === 5 && data.section === "body") {
        const status = transactions[data.row.index].status;
        let color = V2K_COLORS.text;

        if (status === "COMPLETED") color = V2K_COLORS.success;
        else if (status === "PENDING") color = V2K_COLORS.accent;
        else if (status === "FAILED") color = V2K_COLORS.error;

        doc.setTextColor(color[0], color[1], color[2]);
      }
    },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;

  if (finalY < pageHeight - 30) {
    doc.setFontSize(8);
    doc.setTextColor(
      V2K_COLORS.textSecondary[0],
      V2K_COLORS.textSecondary[1],
      V2K_COLORS.textSecondary[2]
    );
    doc.text(
      "V2K - Invista na próxima grande música",
      pageWidth / 2,
      pageHeight - 15,
      { align: "center" }
    );
    doc.text(
      "www.v2k.com.br",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Save PDF
  const fileName = `v2k-transacoes-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

function getTypeLabel(type: Transaction["type"]): string {
  const labels: Record<string, string> = {
    BUY: "Compra",
    SELL: "Venda",
    ROYALTY_CLAIM: "Royalty",
    TRANSFER: "Transferência",
    DEPOSIT: "Depósito",
    WITHDRAWAL: "Saque",
  };
  return labels[type] || type;
}

function getStatusLabel(status: Transaction["status"]): string {
  const labels: Record<string, string> = {
    COMPLETED: "Concluída",
    PENDING: "Pendente",
    FAILED: "Falhou",
    REFUNDED: "Reembolsada",
  };
  return labels[status] || status;
}
