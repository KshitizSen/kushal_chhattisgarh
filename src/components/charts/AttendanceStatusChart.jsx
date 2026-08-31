import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
]);

const emptyChart = {
  categories: [],
  total_vts: [],
  present: [],
  absent: [],
  on_leave: [],
  on_duty: [],
};

const AttendanceStatusChart = ({ data = emptyChart, title = 'Attendance Status' }) => {
  const chartElementRef = useRef(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const option = useMemo(() => {
    const categories = data.categories || [];
    const axisColor = isDark ? '#9ca3af' : '#4b5563';
    const splitLineColor = isDark ? '#374151' : '#e5e7eb';
    const start = categories.length > 12 ? Math.max(0, 100 - (12 / categories.length) * 100) : 0;

    return {
      backgroundColor: 'transparent',
      title: {
        text: title,
        left: 0,
        textStyle: { color: isDark ? '#f9fafb' : '#111827', fontSize: 17, fontWeight: 600 },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow', label: { show: true } },
        valueFormatter: (value) => Number(value || 0).toLocaleString('en-IN'),
      },
      // Toolbox actions are intentionally hidden for the attendance dashboard.
      // toolbox: {
      //   show: true,
      // },
      legend: {
        top: 38,
        data: ['Total VTs', 'Present'],
        textStyle: { color: axisColor },
      },
      grid: { top: 92, left: 18, right: categories.length > 12 ? 62 : 24, bottom: 76, containLabel: true },
      xAxis: [{
        type: 'category',
        data: categories,
        axisLabel: { color: axisColor, interval: 0, rotate: categories.length > 8 ? 30 : 0 },
        axisLine: { lineStyle: { color: splitLineColor } },
      }],
      yAxis: [{
        type: 'value',
        name: 'Number of VTs',
        minInterval: 1,
        nameTextStyle: { color: axisColor },
        axisLabel: { color: axisColor, formatter: (value) => Number(value).toLocaleString('en-IN') },
        splitLine: { lineStyle: { color: splitLineColor } },
      }],
      dataZoom: [
        { show: true, start, end: 100, bottom: 12 },
        { type: 'inside', start, end: 100 },
        ...(categories.length > 12 ? [{ show: true, yAxisIndex: 0, filterMode: 'empty', width: 18, right: 4, top: 90, bottom: 76, showDataShadow: false }] : []),
      ],
      series: [
        { name: 'Total VTs', type: 'bar', data: data.total_vts || [], itemStyle: { color: '#6366f1' } },
        { name: 'Present', type: 'bar', data: data.present || [], itemStyle: { color: '#22c55e' } },
      ],
    };
  }, [data, isDark, title]);

  useEffect(() => {
    if (!chartElementRef.current) return undefined;
    const chart = echarts.init(chartElementRef.current);
    chart.setOption(option, true);
    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartElementRef.current);
    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [option]);

  return <div ref={chartElementRef} className="h-[480px] w-full" role="img" aria-label={title} />;
};

export default AttendanceStatusChart;
