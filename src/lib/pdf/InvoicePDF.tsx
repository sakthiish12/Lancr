import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Invoice, InvoiceLineItem, Client, Tenant } from '@/types'

// ─── Styles ───────────────────────────────────────────────────────────────────

const ACCENT = '#7c3aed'
const GRAY_LIGHT = '#f3f4f6'
const GRAY_MED = '#9ca3af'
const GRAY_DARK = '#374151'
const BLACK = '#111827'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: BLACK,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    backgroundColor: '#ffffff',
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 9,
    color: GRAY_MED,
    lineHeight: 1.5,
  },
  invoiceLabelBlock: {
    alignItems: 'flex-end',
  },
  invoiceLabel: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    letterSpacing: 2,
  },
  invoiceNumber: {
    fontSize: 10,
    color: GRAY_DARK,
    marginTop: 4,
  },
  invoiceMeta: {
    fontSize: 9,
    color: GRAY_MED,
    marginTop: 2,
  },
  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: GRAY_LIGHT,
    marginBottom: 20,
  },
  // Bill To
  billToSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  billToName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    marginBottom: 2,
  },
  billToDetail: {
    fontSize: 9,
    color: GRAY_DARK,
    marginBottom: 2,
  },
  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: ACCENT,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_LIGHT,
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  tableCell: {
    fontSize: 9,
    color: GRAY_DARK,
  },
  // Column widths
  colDescription: { flex: 3 },
  colQty: { flex: 1, textAlign: 'right' },
  colUnitPrice: { flex: 1.5, textAlign: 'right' },
  colTax: { flex: 1, textAlign: 'right' },
  colAmount: { flex: 1.5, textAlign: 'right' },
  // Totals
  totalsContainer: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  totalsBox: {
    width: 220,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: GRAY_MED,
  },
  totalValue: {
    fontSize: 9,
    color: GRAY_DARK,
  },
  totalDivider: {
    borderBottomWidth: 1,
    borderBottomColor: GRAY_LIGHT,
    marginVertical: 4,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
  },
  grandTotalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
  },
  // Notes / Footer
  notesSection: {
    marginTop: 28,
    borderTopWidth: 1,
    borderTopColor: GRAY_LIGHT,
    paddingTop: 16,
  },
  notesText: {
    fontSize: 9,
    color: GRAY_DARK,
    lineHeight: 1.6,
  },
  gstNote: {
    marginTop: 8,
    fontSize: 9,
    color: GRAY_MED,
  },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(cents: number, symbol: string): string {
  return `${symbol}${(cents / 100).toFixed(2)}`
}

function currencySymbol(currency: string): string {
  const map: Record<string, string> = {
    SGD: 'S$',
    MYR: 'RM',
    USD: '$',
    IDR: 'Rp',
  }
  return map[currency] ?? currency
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  invoice: Invoice & { client: Client; line_items: InvoiceLineItem[] }
  tenant: Tenant
}

export function InvoicePDF({ invoice, tenant }: Props) {
  const sym = currencySymbol(invoice.currency)
  const lineItems = invoice.line_items ?? []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyName}>
              {tenant.business_name ?? tenant.name}
            </Text>
            {tenant.address ? (
              <Text style={styles.companyAddress}>{tenant.address}</Text>
            ) : null}
            <Text style={styles.companyAddress}>{tenant.email}</Text>
          </View>
          <View style={styles.invoiceLabelBlock}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <Text style={styles.invoiceMeta}>
              Issued: {fmtDate(invoice.created_at)}
            </Text>
            {invoice.due_date ? (
              <Text style={styles.invoiceMeta}>
                Due: {fmtDate(invoice.due_date)}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill To */}
        <View style={styles.billToSection}>
          <Text style={styles.sectionLabel}>Bill To</Text>
          <Text style={styles.billToName}>{invoice.client.name}</Text>
          {invoice.client.company ? (
            <Text style={styles.billToDetail}>{invoice.client.company}</Text>
          ) : null}
          <Text style={styles.billToDetail}>{invoice.client.email}</Text>
          {invoice.client.address ? (
            <Text style={styles.billToDetail}>{invoice.client.address}</Text>
          ) : null}
        </View>

        {/* Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
          <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, styles.colUnitPrice]}>Unit Price</Text>
          <Text style={[styles.tableHeaderCell, styles.colTax]}>Tax%</Text>
          <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
        </View>

        {lineItems.map((item, idx) => (
          <View
            key={item.id}
            style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
          >
            <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
            <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.colUnitPrice]}>
              {fmtCurrency(item.unit_price_cents, sym)}
            </Text>
            <Text style={[styles.tableCell, styles.colTax]}>{item.tax_rate}%</Text>
            <Text style={[styles.tableCell, styles.colAmount]}>
              {fmtCurrency(item.amount_cents, sym)}
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{fmtCurrency(invoice.subtotal_cents, sym)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                GST ({tenant.gst_registered ? '9' : '0'}%)
              </Text>
              <Text style={styles.totalValue}>{fmtCurrency(invoice.tax_cents, sym)}</Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>{fmtCurrency(invoice.total_cents, sym)}</Text>
            </View>
          </View>
        </View>

        {/* Notes / Footer */}
        {(invoice.notes ?? tenant.gst_registered) ? (
          <View style={styles.notesSection}>
            {invoice.notes ? (
              <>
                <Text style={styles.sectionLabel}>Notes</Text>
                <Text style={styles.notesText}>{invoice.notes}</Text>
              </>
            ) : null}
            {tenant.gst_registered && tenant.gst_number ? (
              <Text style={styles.gstNote}>
                GST Reg No: {tenant.gst_number}
              </Text>
            ) : null}
          </View>
        ) : null}
      </Page>
    </Document>
  )
}
