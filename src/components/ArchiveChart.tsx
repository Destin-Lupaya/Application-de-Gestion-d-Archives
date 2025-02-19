import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ArchiveChartProps {
  documents: Array<{
    created_at: string;
    type: string;
  }>;
}

const ArchiveChart: React.FC<ArchiveChartProps> = ({ documents }) => {
  // Grouper les documents par mois
  const groupedDocuments = documents.reduce((acc, doc) => {
    const date = new Date(doc.created_at);
    const monthYear = format(date, 'MMMM yyyy', { locale: fr });
    
    if (!acc[monthYear]) {
      acc[monthYear] = { total: 0, byType: { doc: 0, pdf: 0, ppt: 0, xls: 0 } };
    }
    
    acc[monthYear].total += 1;
    acc[monthYear].byType[doc.type as keyof typeof acc[typeof monthYear]['byType']] += 1;
    
    return acc;
  }, {} as Record<string, { total: number; byType: Record<string, number> }>);

  const labels = Object.keys(groupedDocuments);
  const data = {
    labels,
    datasets: [
      {
        label: 'Word',
        data: labels.map(label => groupedDocuments[label].byType.doc),
        backgroundColor: 'rgba(37, 99, 235, 0.5)',
      },
      {
        label: 'PDF',
        data: labels.map(label => groupedDocuments[label].byType.pdf),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      },
      {
        label: 'PowerPoint',
        data: labels.map(label => groupedDocuments[label].byType.ppt),
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
      },
      {
        label: 'Excel',
        data: labels.map(label => groupedDocuments[label].byType.xls),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Évolution des archives par type',
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Bar options={options} data={data} />
    </div>
  );
};

export default ArchiveChart;