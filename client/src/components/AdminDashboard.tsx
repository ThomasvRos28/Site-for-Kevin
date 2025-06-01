import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PurchaseOrderContext } from '../contexts/PurchaseOrderContext';
import type { PurchaseOrderContextType } from '../contexts/PurchaseOrderContext';
import { format } from 'date-fns';
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { RefreshCw, FileDown, Search, Plus, ArrowLeft } from 'lucide-react';
import './AdminDashboard.css';

// Extended from the PurchaseOrderContext type to include trucker workflow fields
interface PurchaseOrder {
  _id: string;
  jobDetails: string;
  clientId: {
    name: string;
    email: string;
  };
  haulerId?: {
    name: string;
    email: string;
  };
  status: string;
  haulerRates?: Array<{
    materialType: string;
    rate: number;
    unit: string;
  }>;
  resaleRates?: Array<{
    materialType: string;
    rate: number;
    unit: string;
  }>;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  geofence?: {
    type: 'Polygon' | 'Circle';
    coordinates?: number[][];
    center?: [number, number];
    radius?: number;
  };
  // Additional fields for trucker workflow
  truckNumber?: string;
  driverName?: string;
  startLocation?: string;
  estimatedArrival?: string;
  notes?: string;
  // We'll use materialType from haulerRates for display
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { purchaseOrders, loading, error, updatePurchaseOrderStatus, useMockData, setUseMockData } = useContext(PurchaseOrderContext) as PurchaseOrderContextType;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await setUseMockData(!useMockData);
    setIsRefreshing(false);
  };

  const handleExportCSV = () => {
    const headers = ['Job Name', 'Client Name', 'Hauler', 'Material Type', 'Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...purchaseOrders.map(po => [
        po.jobDetails,
        po.clientId.name,
        po.haulerId?.name || '',
        po.haulerRates?.[0]?.materialType || 'Not specified',
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

  const handleVerify = async (poId: string) => {
    try {
      // Using 'approved' as a fallback status since 'verified' isn't in the allowed types
      await updatePurchaseOrderStatus(poId, 'approved');
    } catch (error) {
      console.error('Error updating status to verified:', error);
    }
  };

  const handleReopen = async (poId: string) => {
    try {
      // Using 'approved' as a fallback status since 'available' isn't in the allowed types
      await updatePurchaseOrderStatus(poId, 'approved');
    } catch (error) {
      console.error('Error updating status to available:', error);
    }
  };

  // Filter purchase orders based on search query
  const filteredPOs = purchaseOrders.filter(po => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      po.jobDetails.toLowerCase().includes(query) ||
      po.clientId.name.toLowerCase().includes(query) ||
      (po.haulerId?.name && po.haulerId.name.toLowerCase().includes(query)) ||
      (po.haulerRates?.[0]?.materialType ? po.haulerRates[0].materialType.toLowerCase().includes(query) : false)
    );
  });

  // Group purchase orders by status
  const pendingPOs = filteredPOs.filter(po => ['available'].includes(po.status));
  const inProgressPOs = filteredPOs.filter(po => ['accepted', 'en_route', 'on_site', 'in_progress'].includes(po.status));
  const completedPOs = filteredPOs.filter(po => ['completed', 'verified'].includes(po.status));

  const getStatusBadge = (status: string) => {
    // Define a mapping of status to valid Badge variants
    const getVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' => {
      switch (status) {
        case 'available':
          return 'secondary';
        case 'accepted':
          return 'default';
        case 'en_route':
        case 'on_site':
          return 'warning';
        case 'in_progress':
          return 'destructive';
        case 'completed':
          return 'success';
        case 'verified':
          return 'outline';
        default:
          return 'secondary';
      }
    };

    return (
      <Badge variant={getVariant(status)}>
        {t(`po.status.${status}`)}
      </Badge>
    );
  };

  const renderPOCard = (po: PurchaseOrder) => {
    return (
      <div key={po._id} className="po-card">
        <div className="po-card-header">
          <h3 className="po-job-title">{po.jobDetails}</h3>
          {getStatusBadge(po.status)}
        </div>
        
        <div className="po-card-content">
          <div className="po-detail">
            <span className="po-detail-label">{t('po.client')}:</span>
            <span className="po-detail-value">{po.clientId.name}</span>
          </div>
          
          <div className="po-detail">
            <span className="po-detail-label">{t('po.hauler')}:</span>
            <span className="po-detail-value">{po.haulerId?.name || '-'}</span>
          </div>
          
          <div className="po-detail">
            <span className="po-detail-label">{t('po.materialType')}:</span>
            <span className="po-detail-value">{po.haulerRates?.[0]?.materialType || 'Not specified'}</span>
          </div>
          
          {po.driverName && (
            <div className="po-detail">
              <span className="po-detail-label">{t('trucker.driverName')}:</span>
              <span className="po-detail-value">{po.driverName}</span>
            </div>
          )}
          
          {po.truckNumber && (
            <div className="po-detail">
              <span className="po-detail-label">{t('trucker.truckNumber')}:</span>
              <span className="po-detail-value">{po.truckNumber}</span>
            </div>
          )}
          
          <div className="po-detail">
            <span className="po-detail-label">{t('po.createdAt')}:</span>
            <span className="po-detail-value">{format(new Date(po.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
        
        <div className="po-card-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/purchase-orders/${po._id}`)}
          >
            {t('common.view')}
          </Button>
          
          {po.status === 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVerify(po._id)}
              className="text-green-600"
            >
              {t('po.verify')}
            </Button>
          )}
          
          {po.status === 'verified' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReopen(po._id)}
              className="text-blue-600"
            >
              {t('po.reopen')}
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="spinner-large"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-title">
          <h1>{t('admin.dashboard')}</h1>
          <p>{t('admin.dashboardDescription')}</p>
        </div>
        
        <div className="header-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/home')}
            className="back-button"
          >
            <ArrowLeft size={16} />
            <span>{t('common.backToHome')}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className={isRefreshing ? 'refreshing' : ''}
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
            <span>{t('common.refresh')}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
          >
            <FileDown size={16} />
            <span>{t('common.exportCSV')}</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/purchase-orders/new')}
          >
            <Plus size={16} />
            <span>{t('po.createNew')}</span>
          </Button>
        </div>
      </div>
      
      <div className="search-bar">
        <div className="search-input-container">
          <Search size={18} className="search-icon" />
          <Input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="po-columns">
          <div className="po-column pending-column">
            <div className="column-header">
              <h2>{t('po.statusGroup.pending')}</h2>
              <Badge variant="secondary">{pendingPOs.length}</Badge>
            </div>
            <div className="column-content">
              {pendingPOs.length === 0 ? (
                <div className="empty-state">
                  <p>{t('po.noPendingJobs')}</p>
                </div>
              ) : (
                pendingPOs.map(po => renderPOCard(po))
              )}
            </div>
          </div>
          
          <div className="po-column in-progress-column">
            <div className="column-header">
              <h2>{t('po.statusGroup.inProgress')}</h2>
              <Badge variant="default">{inProgressPOs.length}</Badge>
            </div>
            <div className="column-content">
              {inProgressPOs.length === 0 ? (
                <div className="empty-state">
                  <p>{t('po.noInProgressJobs')}</p>
                </div>
              ) : (
                inProgressPOs.map(po => renderPOCard(po))
              )}
            </div>
          </div>
          
          <div className="po-column completed-column">
            <div className="column-header">
              <h2>{t('po.statusGroup.completed')}</h2>
              <Badge variant="success">{completedPOs.length}</Badge>
            </div>
            <div className="column-content">
              {completedPOs.length === 0 ? (
                <div className="empty-state">
                  <p>{t('po.noCompletedJobs')}</p>
                </div>
              ) : (
                completedPOs.map(po => renderPOCard(po))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
