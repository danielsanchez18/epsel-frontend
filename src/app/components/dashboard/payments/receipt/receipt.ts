import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentResponseDTO } from '@interfaces/payments/payment.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'component-dashboard-payments-receipt',
  standalone: true,
  imports: [CommonModule],
  template: '',
})
export class ComponentDashboardPaymentsReceipt {
  print(payment: PaymentResponseDTO): void {
    const printWindow = window.open('', '_blank', 'width=500,height=700');
    if (!printWindow) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo abrir la ventana de impresión. Por favor, permita las ventanas emergentes en su navegador.',
        icon: 'error',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    const htmlContent = this.getReceiptHtml(payment);
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
      `,
    );

    printWindow.document.write(printingHtml);
    printWindow.document.close();
  }

  download(payment: PaymentResponseDTO): void {
    Swal.fire({
      title: 'Generando Constancia...',
      text: 'Por favor espere un momento.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.loadHtml2Pdf()
      .then((html2pdf) => {
        const container = document.createElement('div');
        container.innerHTML = this.getReceiptHtml(payment);

        // Hide container from view
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        document.body.appendChild(container);

        const element = container.querySelector('.receipt-box');
        if (!element) {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo encontrar el contenedor de la constancia.',
            icon: 'error',
            confirmButtonColor: '#2563eb',
          });
          document.body.removeChild(container);
          return;
        }

        // Adjust formatting for PDF export
        (element as HTMLElement).style.boxShadow = 'none';
        (element as HTMLElement).style.border = 'none';
        (element as HTMLElement).style.margin = '0';

        const opt = {
          margin: [0.3, 0.3, 0.3, 0.3],
          filename: `Constancia_Pago_${payment.receiptNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: [5, 7], orientation: 'portrait' }, // Ticket size format
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
              text: 'Hubo un problema al generar la constancia en PDF.',
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
          text: 'No se pudo cargar la librería para generar la constancia.',
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
      script.src =
        'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.onload = () => resolve((window as any).html2pdf);
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  }

  private getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'CASH':
        return 'Efectivo';
      case 'CARD':
        return 'Tarjeta';
      case 'YAPE':
        return 'Yape';
      case 'PLIN':
        return 'Plin';
      case 'BANK_TRANSFER':
        return 'Transferencia Bancaria';
      default:
        return method || 'Otro';
    }
  }

  private getReceiptHtml(payment: PaymentResponseDTO): string {
    const formattedDate = new Date(payment.paymentDate).toLocaleString(
      'es-PE',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      },
    );

    const onlyDate = new Date(payment.paymentDate).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Constancia de Pago - ${payment.receiptNumber}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 20px;
            font-size: 13px;
            line-height: 1.6;
            background-color: #f8fafc;
          }
          .receipt-box {
            max-width: 450px;
            margin: 20px auto;
            border: 1px dashed #cbd5e1;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .logo-text {
            font-size: 20px;
            font-weight: 800;
            color: #2563eb;
            margin: 0;
            letter-spacing: 1px;
          }
          .subtitle {
            font-size: 11px;
            color: #64748b;
            margin: 4px 0 12px 0;
            text-transform: uppercase;
            font-weight: 600;
          }
          .receipt-title {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .receipt-number {
            font-size: 13px;
            color: #2563eb;
            font-weight: 700;
            margin-top: 4px;
          }
          .details-list {
            margin-bottom: 24px;
          }
          .details-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
          }
          .details-row:last-child {
            border-bottom: none;
          }
          .details-label {
            color: #64748b;
            font-weight: 500;
          }
          .details-value {
            font-weight: 600;
            color: #0f172a;
            text-align: right;
          }
          .amount-box {
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            margin-bottom: 24px;
          }
          .amount-label {
            font-size: 11px;
            color: #1e3a8a;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .amount-value {
            font-size: 20px;
            font-weight: 800;
            color: #2563eb;
          }
          .footer {
            border-top: 2px dashed #e2e8f0;
            padding-top: 16px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
          }
          .footer p {
            margin: 4px 0;
          }
          .user-info {
            font-family: monospace;
            background-color: #f1f5f9;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 6px;
            font-size: 10px;
            color: #475569;
          }
          @media print {
            body {
              background-color: #fff;
              padding: 0;
            }
            .receipt-box {
              border: none;
              box-shadow: none;
              margin: 0 auto;
              padding: 10px;
              max-width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <h2 class="logo-text">EPSEL S.A.</h2>
            <p class="subtitle">Comprobante de Operación</p>
            <h1 class="receipt-title">Constancia de Pago</h1>
            <p class="receipt-number">${payment.receiptNumber}</p>
          </div>

          <div class="details-list">
            <div class="details-row">
              <span class="details-label">Nro Factura:</span>
              <span class="details-value">${payment.billingNumber}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Cliente:</span>
              <span class="details-value">${payment.customerFullName}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Fecha de Cobranza:</span>
              <span class="details-value">${onlyDate}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Cobrado por:</span>
              <span class="details-value">${payment.registeredBy || 'Sistema'}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Tipo de Operación:</span>
              <span class="details-value">${this.getPaymentMethodLabel(payment.paymentMethod)}</span>
            </div>
          </div>

          <div class="amount-box">
            <div class="amount-label">Monto Pagado</div>
            <div class="amount-value">S/. ${payment.amount.toFixed(2)}</div>
          </div>

          <div class="footer">
            <p><strong>Fecha/Hora emisión:</strong> ${formattedDate}</p>
            <p>${payment.registeredBy || 'Sistema'}</p>
            <p>${payment.registeredById || 'N/A'}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
