import React, { useState, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PurchaseOrderContext } from '../contexts/PurchaseOrderContext';
import type { PurchaseOrderContextType } from '../contexts/PurchaseOrderContext';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Badge } from "../components/ui/badge";
import { RefreshCw, FileDown, Search } from 'lucide-react';
import './PurchaseOrderList.css';

const PurchaseOrderList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { purchaseOrders, loading, error, updatePurchaseOrderStatus, userRole, useMockData, setUseMockData } = useContext(PurchaseOrderContext) as PurchaseOrderContextType;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await setUseMockData(!useMockData);
    setIsRefreshing(false);
  };

  const handleExportCSV = () => {
    const filteredPOs = filteredAndSortedPOs;
    const headers = ['Job Name', 'Client Name', 'Resale Rate', 'Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredPOs.map(po => [
        po.jobDetails,
        po.clientId.name,
        po.resaleRates?.[0]?.rate || '',
        po.status,
        format(new Date(po.createdAt), 'yyyy-MM-dd HH:mm:ss')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `purchase_orders_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const handleApprove = async (poId: string) => {
    await updatePurchaseOrderStatus(poId, 'approved');
  };

  const handleReject = async (poId: string) => {
    await updatePurchaseOrderStatus(poId, 'rejected');
  };

  const handleReminder = async (poId: string) => {
    // TODO: Implement reminder logic
    console.log('Sending reminder for PO:', poId);
  };

  const filteredAndSortedPOs = useMemo(() => {
    let filtered = purchaseOrders;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(po => {
        const jobDetails = po.jobDetails?.toLowerCase() || '';
        const clientName = po.clientId?.name?.toLowerCase() || '';
        const haulerName = po.haulerId?.name?.toLowerCase() || '';
        return jobDetails.includes(query) || clientName.includes(query) || haulerName.includes(query);
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(po => po.status === statusFilter);
    }

    // Normalize statuses for sorting
    return filtered.sort((a, b) => {
      const aStatus = ['pending', 'approved', 'in_progress', 'available', 'accepted'].includes(a.status) ? 'open' : a.status;
      const bStatus = ['pending', 'approved', 'in_progress', 'available', 'accepted'].includes(b.status) ? 'open' : b.status;
      
      if (aStatus === 'open' && bStatus !== 'open') return -1;
      if (aStatus !== 'open' && bStatus === 'open') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [purchaseOrders, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'success',
      completed: 'secondary'
    } as const;

    // Default to 'open' if status is one of the old statuses
    const normalizedStatus = ['pending', 'approved', 'in_progress', 'available', 'accepted'].includes(status) 
      ? 'open' 
      : (status === 'completed' ? 'completed' : 'open');

    return (
      <Badge variant={variants[normalizedStatus as keyof typeof variants]}>
        {normalizedStatus === 'open' ? t('po.status.open') : t('po.status.completed')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="po-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="po-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="po-container">
      <header className="page-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <div className="page-brand">
            <div className="page-title">
              <h1>Purchase Orders</h1>
              <p>Create and manage purchase orders</p>
            </div>
          </div>
        </div>
      </header>

      <div className="po-content">
        <div className="po-header">
          <h2>{t('po.list')}</h2>
          <div className="po-actions-header">
            {userRole === 'hauler' && (
              <Button
                onClick={() => navigate('/purchase-orders/new')}
                className="create-po-button"
              >
                <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                {t('po.create')}
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleExportCSV}
            >
              <FileDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="po-filters">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>{t('po.filtersTitle', 'Filters')}</h3>
          <div className="search-container">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search by job name or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="po-table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('po.jobDetails')}</TableHead>
                <TableHead>{userRole === 'hauler' ? t('po.client') : t('po.hauler')}</TableHead>
                <TableHead>{t('po.resaleRate')}</TableHead>
                <TableHead>{t('po.status')}</TableHead>
                <TableHead>{t('po.createdAt')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedPOs.map((po) => (
                <TableRow key={po._id}>
                  <TableCell>
                    <div className="po-job-details">{po.jobDetails}</div>
                  </TableCell>
                  <TableCell>
                    <div className="po-contact">
                      <div className="contact-name">
                        {userRole === 'hauler' ? po.clientId.name : po.haulerId.name}
                      </div>
                      <div className="contact-email">
                        {userRole === 'hauler' ? po.clientId.email : po.haulerId.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(po.resaleRates && po.resaleRates.length > 0 && po.resaleRates[0].rate != null) ? (
                      `$${Number(po.resaleRates[0].rate).toFixed(2)} (${po.resaleRates[0].unit})`
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-muted-foreground cursor-default">-</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('po.noResaleRate', 'No resale rate set')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(po.status)}</TableCell>
                  <TableCell>
                    {format(new Date(po.createdAt), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="po-actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/purchase-orders/${po._id}`)}
                      >
                        {t('common.view')}
                      </Button>
                      {userRole === 'client' && po.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(po._id)}
                            className="text-green-600"
                          >
                            {t('po.approve')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(po._id)}
                            className="text-red-600"
                          >
                            {t('po.reject')}
                          </Button>
                        </>
                      )}
                      {po.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReminder(po._id)}
                        >
                          {t('po.reminder')}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderList; 