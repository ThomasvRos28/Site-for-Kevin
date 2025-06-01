import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Ticket } from '../types';

interface PhysicalTicketProps {
  ticket: Ticket;
}

const PhysicalTicket: React.FC<PhysicalTicketProps> = ({ ticket }) => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 print:p-0">
      {/* Print button - hidden when printing */}
      <button
        onClick={handlePrint}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded print:hidden"
      >
        {t('tickets.print')}
      </button>

      {/* Ticket content */}
      <div className="border-2 border-gray-800 p-4 max-w-md mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">{t('tickets.title')}</h1>
          <p className="text-sm text-gray-600">{t('tickets.backup')}</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="font-semibold">{t('tickets.ticketNumber')}</p>
            <p>{ticket.ticketNumber}</p>
          </div>

          <div>
            <p className="font-semibold">{t('tickets.poNumber')}</p>
            <p>{ticket.poId}</p>
          </div>

          <div>
            <p className="font-semibold">{t('tickets.materialType')}</p>
            <p>{ticket.materialType}</p>
          </div>

          <div>
            <p className="font-semibold">{t('tickets.quantity')}</p>
            <p>{ticket.quantity} {ticket.unitOfMeasure}</p>
          </div>

          <div>
            <p className="font-semibold">{t('tickets.date')}</p>
            <p>{new Date(ticket.timestamp).toLocaleString()}</p>
          </div>

          <div>
            <p className="font-semibold">{t('tickets.location')}</p>
            <p>
              {ticket.location.lat.toFixed(6)}, {ticket.location.lng.toFixed(6)}
            </p>
          </div>
        </div>

        {/* Signature lines */}
        <div className="mt-8 space-y-4">
          <div className="border-t border-gray-400 pt-2">
            <p className="text-sm">{t('tickets.driverSignature')}</p>
          </div>
          <div className="border-t border-gray-400 pt-2">
            <p className="text-sm">{t('tickets.customerSignature')}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>{t('tickets.footer')}</p>
        </div>
      </div>
    </div>
  );
};

export default PhysicalTicket; 