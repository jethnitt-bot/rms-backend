import React, { forwardRef } from 'react';

const InvoicePrint = forwardRef(({ table, cashier, date, items, subtotal, discount, tax, serviceCharge, totalAmount }, ref) => {
  return (
    <div style={{ display: 'none' }}>
      <div ref={ref} style={{ width: '280px', padding: '15px', fontFamily: 'Khmer OS Battambang, sans-serif', fontSize: '12px', color: '#000' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>RESTAURANT INVOICE</h2>
          <p style={{ margin: 0, fontSize: '12px' }}>វិក្កយបត្រទូទាត់ប្រាក់</p>
          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
        </div>

        <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
          <div><strong>តុ / Table:</strong> {table}</div>
          <div><strong>បេឡាករ / Cashier:</strong> {cashier}</div>
          <div><strong>កាលបរិច្ឆេទ / Date:</strong> {date} {new Date().toLocaleTimeString()}</div>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000' }}>
              <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Item</th>
              <th style={{ textAlign: 'center', paddingBottom: '4px' }}>Qty</th>
              <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map((item, idx) => (
              <tr key={idx}>
                <td style={{ paddingTop: '4px' }}>{item.name}</td>
                <td style={{ textAlign: 'center', paddingTop: '4px' }}>{item.qty}</td>
                <td style={{ textAlign: 'right', paddingTop: '4px' }}>${(item.price * item.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

        <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>${(subtotal || 0).toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Discount:</span>
              <span>-${Number(discount).toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tax (10%):</span>
            <span>${(tax || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Service Charge (5%):</span>
            <span>${(serviceCharge || 0).toFixed(2)}</span>
          </div>
          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
            <span>Total Amount:</span>
            <span>${(totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
        <p style={{ textAlign: 'center', fontSize: '10px', margin: '10px 0 0 0' }}>សូមអរគុណ! Thank you for dining with us!</p>
      </div>
    </div>
  );
});

export default InvoicePrint;
