import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingResponseDTO } from '@interfaces/billings/billing.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'component-dashboard-billing-invoice',
  standalone: true,
  imports: [CommonModule],
  template: '',
})
export class ComponentDashboardBillingInvoice {
  print(bill: BillingResponseDTO): void {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo abrir la ventana de impresión. Por favor, permita las ventanas emergentes en su navegador.',
        icon: 'error',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    const htmlContent = this.getInvoiceHtml(bill);
    const printingHtml = htmlContent.replace(
      '</body>',
      `
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      `
    );

    printWindow.document.write(printingHtml);
    printWindow.document.close();
  }

  download(bill: BillingResponseDTO): void {
    Swal.fire({
      title: 'Generando PDF...',
      text: 'Por favor espere un momento.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.loadHtml2Pdf()
      .then((html2pdf) => {
        const container = document.createElement('div');
        container.innerHTML = this.getInvoiceHtml(bill);

        // Hide container from view
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        document.body.appendChild(container);

        const element = container.querySelector('.invoice-box');
        if (!element) {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo encontrar el contenedor de la factura.',
            icon: 'error',
            confirmButtonColor: '#2563eb',
          });
          document.body.removeChild(container);
          return;
        }

        // Adjust formatting for PDF export
        (element as HTMLElement).style.boxShadow = 'none';
        (element as HTMLElement).style.border = 'none';

        const opt = {
          margin: [0.3, 0.3, 0.3, 0.3],
          filename: `Recibo_${bill.billingNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        };

        html2pdf()
          .from(element)
          .set(opt)
          .save()
          .then(() => {
            Swal.close();
            document.body.removeChild(container);
          })
          .catch((err: any) => {
            console.error(err);
            Swal.fire({
              title: 'Error',
              text: 'Hubo un problema al generar el PDF.',
              icon: 'error',
              confirmButtonColor: '#2563eb',
            });
            document.body.removeChild(container);
          });
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({
          title: 'Error de Red',
          text: 'No se pudo cargar la librería para generar el PDF.',
          icon: 'error',
          confirmButtonColor: '#2563eb',
        });
      });
  }

  private loadHtml2Pdf(): Promise<any> {
    if ((window as any).html2pdf) {
      return Promise.resolve((window as any).html2pdf);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.onload = () => resolve((window as any).html2pdf);
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  }

  private getInvoiceHtml(bill: BillingResponseDTO): string {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const period = `${months[bill.billingMonth - 1]} ${bill.billingYear}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo de Agua - ${bill.billingNumber}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 40px;
            font-size: 14px;
            line-height: 1.5;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
            padding: 30px;
            border-radius: 8px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin: 0;
          }
          .invoice-title {
            text-align: right;
          }
          .invoice-title h1 {
            font-size: 20px;
            margin: 0 0 5px 0;
            color: #1e293b;
          }
          .invoice-title p {
            margin: 0;
            font-size: 14px;
            color: #64748b;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .details-card {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #f1f5f9;
          }
          .details-card h3 {
            margin: 0 0 12px 0;
            font-size: 14px;
            text-transform: uppercase;
            color: #475569;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
          }
          .details-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .details-row:last-child {
            margin-bottom: 0;
          }
          .details-label {
            color: #64748b;
            font-weight: 500;
          }
          .details-val {
            color: #0f172a;
            font-weight: 600;
            text-align: right;
          }
          .table-container {
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 600;
            padding: 12px;
            border-bottom: 2px solid #e2e8f0;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
          }
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
          }
          .totals-table {
            width: 300px;
          }
          .totals-table td {
            padding: 8px 12px;
            border: none;
          }
          .totals-table tr.border-t td {
            border-top: 1px solid #e2e8f0;
          }
          .totals-table tr.grand-total td {
            font-size: 16px;
            font-weight: bold;
            color: #1e3a8a;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          @media print {
            body {
              padding: 0;
            }
            .invoice-box {
              border: none;
              box-shadow: none;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div>
              <h2 class="logo-text">EPSEL S.A.</h2>
            </div>
            <div class="invoice-title">
              <h1>FACTURA DE SERVICIOS</h1>
              <p>Nº ${bill.billingNumber}</p>
            </div>
          </div>

          <div class="details-grid">
            <div class="details-card">
              <h3>Datos del Cliente</h3>
              <div class="details-row">
                <span class="details-label">Cliente:</span>
                <span class="details-val">${bill.customerName}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Dirección:</span>
                <span class="details-val">${bill.propertyAddress || 'No especificada'}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Zona:</span>
                <span class="details-val">${bill.zoneName || 'General'}</span>
              </div>
            </div>
            <div class="details-card">
              <h3>Información del Suministro</h3>
              <div class="details-row">
                <span class="details-label">Nº Suministro:</span>
                <span class="details-val">${bill.supplyNumber}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Periodo:</span>
                <span class="details-val">${period}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Vencimiento:</span>
                <span class="details-val" style="color: #ef4444;">${new Date(bill.dueDate).toLocaleDateString('es-PE')}</span>
              </div>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Concepto de Cobro</th>
                  <th style="text-align: right;">Cantidad / Detalle</th>
                  <th style="text-align: right;">P. Unitario</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Consumo de Agua Potable</td>
                  <td style="text-align: right;">${bill.consumption} m³</td>
                  <td style="text-align: right;">S/. ${bill.unitPrice.toFixed(2)}</td>
                  <td style="text-align: right;">S/. ${(bill.consumption * bill.unitPrice).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Cargo Fijo Ley de Concesión</td>
                  <td style="text-align: right;">1 Serv.</td>
                  <td style="text-align: right;">S/. ${bill.fixedCharge.toFixed(2)}</td>
                  <td style="text-align: right;">S/. ${bill.fixedCharge.toFixed(2)}</td>
                </tr>
                ${bill.lateFeeAmount > 0 ? `
                <tr>
                  <td style="color: #ef4444;">Mora por Pago Tardío</td>
                  <td style="text-align: right; color: #ef4444;">1 Serv.</td>
                  <td style="text-align: right; color: #ef4444;">S/. ${bill.lateFeeAmount.toFixed(2)}</td>
                  <td style="text-align: right; color: #ef4444;">S/. ${bill.lateFeeAmount.toFixed(2)}</td>
                </tr>
                ` : ''}
              </tbody>
            </table>
          </div>

          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td class="details-label">Subtotal:</td>
                <td class="details-val">S/. ${bill.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td class="details-label">IGV (${bill.taxPercentage}%):</td>
                <td class="details-val">S/. ${bill.taxAmount.toFixed(2)}</td>
              </tr>
              <tr class="border-t grand-total">
                <td style="color: #1e3a8a;">TOTAL A PAGAR:</td>
                <td style="color: #1e3a8a; font-weight: 800;">S/. ${bill.totalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>Este documento es una representación impresa de la factura electrónica emitida por EPSEL S.A.</p>
            <p>¡Gracias por mantener sus pagos al día!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
