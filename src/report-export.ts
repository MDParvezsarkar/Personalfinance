type ReportAccount = {id: string; name: string; kind: string; balance: number};
type ReportTransaction = {
  date: string;
  type: string;
  category: string;
  description: string;
  accountId: string;
  amount: number;
};

type ReportExport = {
  from: string;
  to: string;
  label: string;
  rows: ReportTransaction[];
  accounts: ReportAccount[];
  income: number;
  expenses: number;
  cashflow: number;
  debtPayments: number;
  transfers: number;
  incomeCategories: Record<string, number>;
  expenseCategories: Record<string, number>;
};

const escapeXml = (value: string) => value.replace(/[<>&"']/g, char => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&apos;',
}[char]!));

const textCell = (value: string, style?: string) =>
  `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;

const numberCell = (value: number, style?: string) =>
  `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="Number">${value}</Data></Cell>`;

const row = (...cells: string[]) => `<Row>${cells.join('')}</Row>`;

const worksheet = (name: string, rows: string[]) =>
  `<Worksheet ss:Name="${escapeXml(name)}"><Table>${rows.join('')}</Table></Worksheet>`;

export function downloadExcelReport(report: ReportExport) {
  const accountName = (id: string) => report.accounts.find(account => account.id === id)?.name || '';
  const summaryRows = [
    row(textCell(`${report.label} Financial Report`, 'Title')),
    row(textCell('Period'), textCell(`${report.from} to ${report.to}`)),
    row(textCell('Metric', 'Header'), textCell('Amount (BDT)', 'Header')),
    row(textCell('Total income'), numberCell(report.income, 'Currency')),
    row(textCell('Total expenses'), numberCell(report.expenses, 'Currency')),
    row(textCell('Net cash flow'), numberCell(report.cashflow, 'Currency')),
    row(textCell('Debt payments'), numberCell(report.debtPayments, 'Currency')),
    row(textCell('Transfers and card payments'), numberCell(report.transfers, 'Currency')),
    row(textCell('Transaction count'), numberCell(report.rows.length)),
    row(textCell('Income by category', 'Header')),
    ...Object.entries(report.incomeCategories).map(([category, total]) =>
      row(textCell(category), numberCell(total, 'Currency'))),
    row(textCell('Expenses by category', 'Header')),
    ...Object.entries(report.expenseCategories).map(([category, total]) =>
      row(textCell(category), numberCell(total, 'Currency'))),
  ];
  const accountRows = [
    row(textCell('Account', 'Header'), textCell('Type', 'Header'), textCell('Balance (BDT)', 'Header')),
    ...report.accounts.map(account => row(
      textCell(account.name),
      textCell(account.kind === 'credit' ? 'Credit card' : account.kind),
      numberCell(account.balance, 'Currency'),
    )),
  ];
  const transactionRows = [
    row(
      ...['Date', 'Type', 'Category', 'Description', 'Account', 'Amount (BDT)']
        .map(value => textCell(value, 'Header')),
    ),
    ...report.rows.map(transaction => row(
      textCell(transaction.date),
      textCell(transaction.type),
      textCell(transaction.category),
      textCell(transaction.description),
      textCell(accountName(transaction.accountId)),
      numberCell(transaction.amount, 'Currency'),
    )),
  ];
  const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="Title"><Font ss:Bold="1" ss:Size="16"/></Style>
<Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#3156D8" ss:Pattern="Solid"/></Style>
<Style ss:ID="Currency"><NumberFormat ss:Format="&quot;৳&quot;#,##0.00"/></Style>
</Styles>
${worksheet('Summary', summaryRows)}
${worksheet('Accounts', accountRows)}
${worksheet('Transactions', transactionRows)}
</Workbook>`;
  const blob = new Blob([workbook], {type: 'application/vnd.ms-excel;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `money-report-${report.from}-to-${report.to}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}
