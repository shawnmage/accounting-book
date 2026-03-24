'use client';

import { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Project } from '@/types';

interface QuoteModalProps {
  project: Project;
  settings: { appName?: string; currency?: string };
  onClose: () => void;
}

export function QuoteModal({ project, settings, onClose }: QuoteModalProps) {
  const quoteRef = useRef<HTMLDivElement>(null);
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('zh-CN', { style: 'currency', currency: settings.currency || 'CNY' }).format(amount);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !quoteRef.current) return;
    
    const quoteContent = quoteRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>报价单 - ${project.name}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
          .quote-header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
          .quote-header h1 { font-size: 28px; margin: 0; color: #1f2937; }
          .quote-header .company { font-size: 14px; color: #6b7280; margin-top: 5px; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-block { flex: 1; }
          .info-block h3 { font-size: 12px; color: #6b7280; margin: 0 0 5px 0; text-transform: uppercase; }
          .info-block p { font-size: 14px; margin: 0; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f9fafb; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .text-right { text-align: right; }
          .total-section { margin-top: 30px; border-top: 2px solid #3b82f6; padding-top: 20px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .total-row.grand { font-size: 18px; font-weight: bold; color: #3b82f6; }
          .notes { margin-top: 30px; padding: 15px; background: #f9fafb; border-radius: 8px; }
          .notes h4 { margin: 0 0 10px 0; font-size: 12px; color: #6b7280; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        ${quoteContent}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPDF = () => {
    // 使用浏览器打印到 PDF 功能
    handlePrint();
  };

  const handleDownloadHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>报价单 - ${project.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 40px; background: #f5f5f5; }
    .quote-container { background: white; padding: 60px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .quote-header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 30px; margin-bottom: 40px; }
    .quote-header h1 { font-size: 32px; margin: 0; color: #1f2937; }
    .quote-header .company { font-size: 16px; color: #6b7280; margin-top: 10px; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; gap: 40px; }
    .info-block { flex: 1; }
    .info-block h3 { font-size: 12px; color: #6b7280; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-block p { font-size: 15px; margin: 0; font-weight: 500; color: #1f2937; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    th { background: #f9fafb; padding: 15px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; }
    td { padding: 15px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .text-right { text-align: right; }
    .item-name { font-weight: 500; }
    .item-desc { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .type-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
    .type-service { background: #dbeafe; color: #1e40af; }
    .type-product { background: #f3e8ff; color: #7c3aed; }
    .type-other { background: #f3f4f6; color: #374151; }
    .total-section { margin-top: 40px; border-top: 3px solid #3b82f6; padding-top: 25px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; }
    .total-row.grand { font-size: 22px; font-weight: bold; color: #3b82f6; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
    .notes { margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px; }
    .notes h4 { margin: 0 0 10px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .notes p { margin: 0; font-size: 14px; line-height: 1.6; }
    .footer { margin-top: 60px; text-align: center; font-size: 13px; color: #9ca3af; padding-top: 30px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="quote-container">
    <div class="quote-header">
      <h1>报价单</h1>
      <div class="company">${settings.appName || '专业记账服务'}</div>
    </div>
    
    <div class="info-section">
      <div class="info-block">
        <h3>报价日期</h3>
        <p>${new Date().toLocaleDateString('zh-CN')}</p>
      </div>
      <div class="info-block">
        <h3>项目编号</h3>
        <p>${project.projectNumber}</p>
      </div>
      <div class="info-block">
        <h3>客户名称</h3>
        <p>${project.customerName}</p>
      </div>
      <div class="info-block">
        <h3>项目名称</h3>
        <p>${project.name}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 35%">服务/商品</th>
          <th style="width: 12%">类型</th>
          <th style="width: 12%" class="text-right">数量</th>
          <th style="width: 18%" class="text-right">单价</th>
          <th style="width: 23%" class="text-right">小计</th>
        </tr>
      </thead>
      <tbody>
        ${project.items.map(item => `
        <tr>
          <td>
            <div class="item-name">${item.name}</div>
            ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
          </td>
          <td>
            <span class="type-badge type-${item.type}">${item.type === 'service' ? '服务' : item.type === 'product' ? '商品' : '其他'}</span>
          </td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${formatCurrency(item.unitPrice)}</td>
          <td class="text-right" style="font-weight: 600;">${formatCurrency(item.quantity * item.unitPrice)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-row">
        <span>合计</span>
        <span>${formatCurrency(project.totalAmount)}</span>
      </div>
      ${project.notes ? `
      <div class="notes">
        <h4>备注</h4>
        <p>${project.notes}</p>
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <p>本报价单有效期 30 天，最终价格以合同为准</p>
      <p style="margin-top: 8px;">如有疑问，请联系我们</p>
    </div>
  </div>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `报价单_${project.name}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">报价单预览</h3>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadHTML} className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
              <Download className="w-4 h-4" />下载 HTML
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              <Printer className="w-4 h-4" />打印 / PDF
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div ref={quoteRef} className="bg-white p-12 max-w-[800px] mx-auto shadow-lg">
            <div className="text-center border-b-2 border-blue-500 pb-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900">报价单</h1>
              <p className="text-gray-500 mt-2">{settings.appName || '专业记账服务'}</p>
            </div>
            
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">报价日期</p>
                <p className="font-medium">{new Date().toLocaleDateString('zh-CN')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">项目编号</p>
                <p className="font-medium">{project.projectNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">客户名称</p>
                <p className="font-medium">{project.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">项目名称</p>
                <p className="font-medium">{project.name}</p>
              </div>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 text-xs font-semibold text-gray-600 border-b-2 border-gray-200">服务/商品</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-600 border-b-2 border-gray-200">类型</th>
                  <th className="text-right p-3 text-xs font-semibold text-gray-600 border-b-2 border-gray-200">数量</th>
                  <th className="text-right p-3 text-xs font-semibold text-gray-600 border-b-2 border-gray-200">单价</th>
                  <th className="text-right p-3 text-xs font-semibold text-gray-600 border-b-2 border-gray-200">小计</th>
                </tr>
              </thead>
              <tbody>
                {project.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="p-3">
                      <p className="font-medium">{item.name}</p>
                      {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        item.type === 'service' ? 'bg-blue-100 text-blue-700' : 
                        item.type === 'product' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.type === 'service' ? '服务' : item.type === 'product' ? '商品' : '其他'}
                      </span>
                    </td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-3 text-right font-semibold">{formatCurrency(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t-2 border-blue-500 pt-6">
              <div className="flex justify-between items-center text-xl font-bold text-blue-600">
                <span>合计</span>
                <span>{formatCurrency(project.totalAmount)}</span>
              </div>
            </div>

            {project.notes && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase mb-2">备注</p>
                <p className="text-sm">{project.notes}</p>
              </div>
            )}

            <div className="mt-12 text-center text-sm text-gray-400">
              <p>本报价单有效期 30 天，最终价格以合同为准</p>
              <p className="mt-2">如有疑问，请联系我们</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
