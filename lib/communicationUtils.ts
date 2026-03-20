
import { Order } from '../types';
import { SystemSettings } from '../types/systemSettings';


export const generateUPILink = (order: Order, settings: SystemSettings) => {
  if (!settings.upiId) return '';
  const amount = order.totalAmount.toFixed(2);
  const note = `${order.id} - ${order.customerName || 'Guest'}`;
  const params = new URLSearchParams({
    pa: settings.upiId,
    pn: settings.restaurantName,
    am: amount,
    tn: note,
    cu: 'INR'
  });
  return `upi://pay?${params.toString()}`;
};

export const shareOnWhatsApp = (order: Order, settings: SystemSettings, type: 'CONFIRM' | 'SETTLE', includePaymentLink: boolean = false) => {
  if (!order.customerPhone) return;

  const DEFAULT_CONFIRM_TEMPLATE = "Hello {{customer}}, your order #{{orderId}} at {{restaurant}} for {{currency}} {{total}} has been confirmed. Items: {{items}}";
  const DEFAULT_SETTLE_TEMPLATE = "Hello {{customer}}, your order #{{orderId}} at {{restaurant}} for {{currency}} {{total}} has been settled. Thank you!";

  const template = type === 'CONFIRM' 
    ? (settings.whatsappConfirmationTemplate || DEFAULT_CONFIRM_TEMPLATE)
    : (settings.whatsappSettledTemplate || DEFAULT_SETTLE_TEMPLATE);

  const itemsString = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

  let message = template
    .replace('{{customer}}', order.customerName || 'Guest')
    .replace('{{orderId}}', order.id)
    .replace('{{total}}', order.totalAmount.toLocaleString('en-IN'))
    .replace('{{currency}}', settings.currency)
    .replace('{{restaurant}}', settings.restaurantName)
    .replace('{{items}}', itemsString);

  if (includePaymentLink && settings.upiId) {
    const upiLink = generateUPILink(order, settings);
    message += `\n\nPay instantly via UPI: ${upiLink}`;
  }

  const phone = order.customerPhone.startsWith('91') ? order.customerPhone : `91${order.customerPhone}`;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  
  window.open(url, '_blank');
};

export const shareOfferOnWhatsApp = (offer: any, settings: SystemSettings, phone?: string) => {
  let message = offer.whatsappMessage || `Check out this offer at ${settings.restaurantName}: ${offer.title}! ${offer.description}`;
  
  // Replace placeholders if any
  message = message.replace('{{restaurant}}', settings.restaurantName);

  const url = phone 
    ? `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  
  window.open(url, '_blank');
};
