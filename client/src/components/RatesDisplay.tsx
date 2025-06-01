import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SyncService from '../services/SyncService';
import type { Rate } from '../types';

const RatesDisplay: React.FC = () => {
  const { t } = useTranslation();
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const syncService = SyncService.getInstance();
        const data = await syncService.getRates();
        setRates(data);
        setError(null);
      } catch (err) {
        setError(t('errors.fetchRatesFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [t]);

  if (loading) {
    return <div className="text-center p-4">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  const haulingRates = rates.filter(rate => rate.type === 'hauling');
  const materialRates = rates.filter(rate => rate.type === 'material');

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{t('rates.title')}</h2>
      
      {/* Hauling Rates */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">{t('rates.hauling')}</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rates.rate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rates.unit')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rates.effectiveDate')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {haulingRates.map((rate) => (
                <tr key={rate._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${rate.rate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {rate.unitOfMeasure}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(rate.effectiveDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Material Rates */}
      <div>
        <h3 className="text-xl font-semibold mb-2">{t('rates.material')}</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rates.materialType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rates.rate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rates.unit')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rates.effectiveDate')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materialRates.map((rate) => (
                <tr key={rate._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {rate.materialType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${rate.rate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {rate.unitOfMeasure}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(rate.effectiveDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RatesDisplay; 