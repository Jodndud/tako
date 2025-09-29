"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import RankElement from "@/components/atoms/RankElement";

interface CardPriceData {
  successfulBidTime: string;
  grade: string;
  amount: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: Readonly<CustomTooltipProps>) {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-gray-900 text-white p-3 rounded shadow-lg min-w-[120px]">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="text-md mb-1 text-white">
          {entry.name}: {entry.value ? `${entry.value.toFixed(4)}` : '데이터 없음'}
        </p>
      ))}
    </div>
  );
}

function CustomLegend() {
  // grade별 색상 매핑
  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'S+':
        return '#30E6F7';
      case 'S':
        return '#837BFF';
      case 'A+':
      case 'A1':
      case 'A':
        return '#FF5DA3';
      case 'B':
        return '#BCBCBC';
      case 'C':
        return '#8B4513';
      case 'D':
        return '#696969';
      default:
        return '#ffffff';
    }
  };

  const grades = ['S+', 'S', 'A', 'B', 'C', 'D'];
  
  return (
    <div className="flex flex-col gap-4">
      {grades.map((grade) => (
        <div key={grade} className="flex items-center gap-2">
          <div 
            className="w-4 h-0.5" 
            style={{ backgroundColor: getGradeColor(grade) }}
          />
          <RankElement rank={grade} size={30} />
        </div>
      ))}
    </div>
  );
}

export interface CardPriceChartProps {
  data: CardPriceData[];
  width?: number;
  height?: number;
  className?: string;
}

export default function CardPriceChart({ data, width = 800, height = 300, className }: Readonly<CardPriceChartProps>) {
  // grade별 색상 매핑
  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'S+':
        return '#30E6F7';
      case 'S':
        return '#837BFF';
      case 'A+':
      case 'A1':
      case 'A':
        return '#FF5DA3';
      case 'B':
        return '#BCBCBC';
      case 'C':
        return '#8B4513';
      case 'D':
        return '#696969';
      default:
        return '#ffffff';
    }
  };

  // 데이터 변환: 날짜별로 grade별 가격 정보를 그룹화
  const transformData = () => {
    if (!data || data.length === 0) return [];
    
    // 날짜별로 데이터 그룹화
    const dateGroups: { [date: string]: { [grade: string]: number[] } } = {};
    
    data.forEach(item => {
      const date = new Date(item.successfulBidTime).toISOString().split('T')[0];
      if (!dateGroups[date]) {
        dateGroups[date] = {};
      }
      if (!dateGroups[date][item.grade]) {
        dateGroups[date][item.grade] = [];
      }
      dateGroups[date][item.grade].push(item.amount);
    });
    
    // 각 날짜별로 grade별 평균 가격 계산
    const sortedDates = Object.keys(dateGroups).sort();
    
    return sortedDates.map(date => {
      const dateData: any = { date };
      
      Object.keys(dateGroups[date]).forEach(grade => {
        const amounts = dateGroups[date][grade];
        const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
        dateData[grade] = avgAmount;
      });
      
      return dateData;
    });
  };

  const chartData = transformData();

  // grade별 선 생성
  const renderLines = () => {
    if (!data || data.length === 0) return null;
    
    // 데이터에서 고유한 grade들 추출
    const uniqueGrades = [...new Set(data.map(item => item.grade))].sort();
    
    return uniqueGrades.map(grade => (
      <Line
        key={grade}
        type="monotone"
        dataKey={grade}
        name={grade}
        stroke={getGradeColor(grade)}
        strokeWidth={2}
        dot={false}
        connectNulls={false}
      />
    ));
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className={className}>
      {chartData.length > 0 ? (
        <div className="flex gap-4">
          {/* 범례를 왼쪽에 세로로 배치 */}
          <div className="flex-shrink-0">
            <CustomLegend />
          </div>
          
          {/* 차트 영역 */}
          <div className="flex-1">
            <LineChart width={width - 100} height={height} data={chartData}>
              <CartesianGrid stroke="#222" strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: "#aaa" }} 
                axisLine={false}
                tickFormatter={formatDate}
                domain={['dataMin', 'dataMax']}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                tick={{ fill: "#aaa" }} 
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(4)}`}
                padding={{ top: 20, bottom: 20 }}
                orientation="right"
              />
              <Tooltip content={<CustomTooltip />} />
              {renderLines()}
            </LineChart>
          </div>
        </div>
      ) : (
        <div className="w-[800px] h-[300px] flex items-center justify-center bg-gray-800 rounded border border-gray-700">
          <p className="text-gray-400 text-sm">시세 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
