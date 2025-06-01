import React, { useEffect, useState } from 'react';
import TicketList from './TicketList';
import { useTranslation } from 'react-i18next';

const TicketHistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/tickets?limit=1000')
      .then(res => res.json())
      .then(data => {
        setTickets(data.tickets || []);
      })
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="ticket-history-page">
      <header className="page-header">
        <h1>{t('navigation.materialTicketHistory')}</h1>
      </header>
      <main>
        {loading ? (
          <div className="loading">{t('common.loading')}</div>
        ) : (
          <TicketList
            tickets={tickets}
            selectedTickets={[]}
            onTicketSelect={() => {}}
            onSelectAll={() => {}}
            onEditTicket={() => {}}
            onDeleteTicket={() => {}}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
          />
        )}
      </main>
    </div>
  );
};

export default TicketHistoryPage;
