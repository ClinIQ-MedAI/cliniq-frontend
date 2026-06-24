import React, { useState, useEffect } from 'react';
import './MonthlyRevenue.css';

const MonthlyRevenue = ({ compact = true }) => {
 
  const [revenueData, setRevenueData] = useState({
    currentMonth: {
      total: 24580,
      change: 15,
      breakdown: {
        consultations: 9832,
        surgeries: 8603,
        medications: 3865,
        others: 2280
      }
    },
    monthlyTrend: [
      { month: 'Jan', revenue: 18500, consultations: 7400, surgeries: 6475, medications: 2775, others: 1850 },
      { month: 'Feb', revenue: 21000, consultations: 8400, surgeries: 7350, medications: 3150, others: 2100 },
      { month: 'Mar', revenue: 19800, consultations: 7920, surgeries: 6930, medications: 2970, others: 1980 },
      { month: 'Apr', revenue: 23000, consultations: 9200, surgeries: 8050, medications: 3450, others: 2300 },
      { month: 'May', revenue: 24580, consultations: 9832, surgeries: 8603, medications: 3865, others: 2280 },
      { month: 'Jun', revenue: 22500, consultations: 9000, surgeries: 7875, medications: 3375, others: 2250 }
    ],
    comparison: {
      vsLastMonth: 15,
      vsLastYear: 28,
      targetAchievement: 82
    }
  });

  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('total'); // total, consultations, surgeries, medications, others
  
  // تجربه دمي داتا 
  useEffect(() => {
    const fetchRevenueData = async () => {
      setIsLoading(true);
      try {
        setTimeout(() => {
          const mockData = {
            currentMonth: {
              total: Math.floor(Math.random() * 50000) + 15000,
              change: Math.floor(Math.random() * 40) - 10,
              breakdown: {
                consultations: Math.floor(Math.random() * 20000) + 8000,
                surgeries: Math.floor(Math.random() * 15000) + 7000,
                medications: Math.floor(Math.random() * 8000) + 3000,
                others: Math.floor(Math.random() * 5000) + 2000
              }
            },
            monthlyTrend: (function generateMonthlyTrend(){
              const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              return months.map((m,i)=>{
                const base = 15000 + (i*2000);
                const rand = Math.floor(Math.random()*5000)-2500;
                const revenue = base + rand;
                return { month: m, revenue, consultations: Math.floor(revenue*0.4), surgeries: Math.floor(revenue*0.35), medications: Math.floor(revenue*0.15), others: Math.floor(revenue*0.1) };
              });
            })(),
            comparison: { vsLastMonth: Math.floor(Math.random()*40)-10, vsLastYear: Math.floor(Math.random()*50)+10, targetAchievement: Math.floor(Math.random()*30)+70 }
          };
          setRevenueData(mockData);
          setIsLoading(false);
        }, 800);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };

    fetchRevenueData();
    const t = setInterval(fetchRevenueData, 60000);
    return ()=>clearInterval(t);
  }, [selectedPeriod]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  const calculatePercentage = (part, total) => ((part/total)*100).toFixed(1);
  const getChangeColor = (change) => change >= 0 ? '#10b981' : '#ef4444';
  const getChartData = () => {
    if (activeChart === 'total') return revenueData.monthlyTrend.map(item => ({ month: item.month, value: item.revenue, label: formatCurrency(item.revenue) }));
    return revenueData.monthlyTrend.map(item => ({ month: item.month, value: item[activeChart], label: formatCurrency(item[activeChart]) }));
  };
  const getMaxValue = () => Math.max(...getChartData().map(d=>d.value));
  
  if (isLoading) {
    return (
      <div className={`monthly-revenue ${compact ? 'compact' : ''} loading`}>
        <div className="skeleton skeleton-title"></div>
      </div>
    );
  }

  const chartData = getChartData();

  if (compact) {

    const values = chartData.map(d => d.value);
    const max = Math.max(...values, 1);
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - (v / max) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="monthly-revenue compact">
        <div className="compact-left">
          <div className="compact-title">Monthly Revenue</div>
          <div className="compact-amount">{formatCurrency(revenueData.currentMonth.total)}</div>
          <div className="compact-change" style={{color: getChangeColor(revenueData.currentMonth.change)}}>
            {revenueData.currentMonth.change >= 0 ? '↗' : '↘'} {Math.abs(revenueData.currentMonth.change)}% vs last month
          </div>
          <div className="compact-status">On track</div>
        </div>

        <div className="compact-chart">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mini-line">
            <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

   
      </div>
    );
  }

  // Non-compact: keep previous full layout
  const chartDataFull = getChartData();
  const maxValue = getMaxValue();

  return (
    <div className="monthly-revenue">
      <div className="revenue-header">
        <div className="header-left">
          <h3>Monthly Revenue</h3>
          <div className="revenue-summary">
            <span className="revenue-amount">{formatCurrency(revenueData.currentMonth.total)}</span>
            <span className="revenue-change" style={{ color: getChangeColor(revenueData.currentMonth.change) }}>{revenueData.currentMonth.change >= 0 ? '+' : ''}{revenueData.currentMonth.change}%</span>
          </div>
        </div>
     
      </div>

      <div className="revenue-chart-container dual-line">
        <svg viewBox="0 0 600 120" preserveAspectRatio="none" className="dual-line-chart">
          {/* build points for two series: primary = revenue, secondary = smoothed */}
          {(() => {
            const vals = chartDataFull.map(d => d.value);
            const max = Math.max(...vals, 1);
            const stepX = 600 / (vals.length - 1);
            const primaryPoints = vals.map((v, i) => `${i * stepX},${120 - (v / max) * 100}`).join(' ');
            
            const secVals = vals.map((v,i)=>{
              const prev = vals[i-1] ?? v; const next = vals[i+1] ?? v;
              return Math.round((prev + v + next)/3);
            });
            const secondaryPoints = secVals.map((v,i)=>`${i * stepX},${120 - (v / max) * 100}`).join(' ');
        
            const peakIndex = vals.indexOf(Math.max(...vals));
            const peakX = peakIndex * stepX;
            const peakY = 120 - (vals[peakIndex] / max) * 100;

            return (
              <g>
                <polyline points={secondaryPoints} fill="none" stroke="#9fc5ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
                <polyline points={primaryPoints} fill="none" stroke="#1e3a8a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle className="highlight-circle" cx={peakX} cy={peakY} r="5" fill="#fff" stroke="#1e3a8a" strokeWidth="2" />
                <rect x={peakX-28} y={peakY-34} rx={6} ry={6} width={56} height={20} fill="#1e3a8a" />
                <text x={peakX} y={peakY-20} textAnchor="middle" fontSize="11" fill="#fff">{formatCurrency(vals[peakIndex])}</text>
                {/* month labels */}
                {chartDataFull.map((d,i)=>(
                  <text key={d.month} x={i*stepX} y={115} textAnchor="middle" fontSize="10" fill="#9ca3af">{d.month}</text>
                ))}
              </g>
            );
          })()}
        </svg>
      </div>



     
    </div>
  );
};

export default MonthlyRevenue;
