/**
 * @file type-chart-client.tsx
 * @description 타입별 관광지 분포 차트 Client Component
 *
 * recharts를 사용하여 Donut Chart를 렌더링하는 Client Component입니다.
 *
 * @dependencies
 * - @/components/ui/chart: ChartContainer, ChartTooltip, ChartTooltipContent
 * - recharts: PieChart, Pie, Cell
 * - next/navigation: useRouter
 * - @/lib/types/stats: TypeStats 타입
 * - @/lib/types/tour: CONTENT_TYPE_ID
 */

"use client";

import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { TypeStats } from "@/lib/types/stats";
import { CONTENT_TYPE_ID } from "@/lib/types/tour";

/**
 * 숫자를 천 단위 콤마로 포맷팅
 */
function formatNumber(num: number): string {
  return num.toLocaleString("ko-KR");
}

/**
 * 관광 타입별 색상 매핑
 * 8가지 관광 타입별로 구분되는 색상
 */
const TYPE_COLORS: Record<string, string> = {
  [CONTENT_TYPE_ID.TOURIST_SPOT]: "hsl(var(--chart-1))", // 관광지
  [CONTENT_TYPE_ID.CULTURAL_FACILITY]: "hsl(var(--chart-2))", // 문화시설
  [CONTENT_TYPE_ID.FESTIVAL]: "hsl(var(--chart-3))", // 축제/행사
  [CONTENT_TYPE_ID.TOUR_COURSE]: "hsl(var(--chart-4))", // 여행코스
  [CONTENT_TYPE_ID.LEISURE_SPORTS]: "hsl(var(--chart-5))", // 레포츠
  [CONTENT_TYPE_ID.ACCOMMODATION]: "hsl(var(--chart-1))", // 숙박
  [CONTENT_TYPE_ID.SHOPPING]: "hsl(var(--chart-2))", // 쇼핑
  [CONTENT_TYPE_ID.RESTAURANT]: "hsl(var(--chart-3))", // 음식점
};

/**
 * 타입별 분포 차트 Client Component
 * recharts를 사용하여 Donut Chart를 렌더링합니다.
 */
export function TypeChartClient({ data }: { data: TypeStats[] }) {
  const router = useRouter();

  // 차트 설정
  const chartConfig = data.reduce(
    (acc, stat) => {
      acc[stat.contentTypeId] = {
        label: stat.typeName,
        color: TYPE_COLORS[stat.contentTypeId] || "hsl(var(--chart-1))",
      };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>
  );

  // 섹션 클릭 핸들러
  const handlePieClick = (data: TypeStats) => {
    // 해당 타입의 관광지 목록 페이지로 이동
    router.push(`/?contentTypeId=${data.contentTypeId}`);
  };

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[300px] md:h-[400px] lg:h-[500px]"
    >
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="typeName"
          cx="50%"
          cy="50%"
          outerRadius={120}
          innerRadius={60}
          onClick={(clickedData) => {
            if (clickedData) {
              handlePieClick(clickedData as TypeStats);
            }
          }}
          className="cursor-pointer transition-opacity hover:opacity-80"
          role="img"
          aria-label="타입별 관광지 분포 차트"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                TYPE_COLORS[entry.contentTypeId] || "hsl(var(--chart-1))"
              }
            />
          ))}
        </Pie>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => {
                const payload = item.payload as TypeStats;
                const percentage = payload.percentage
                  ? `${payload.percentage.toFixed(2)}%`
                  : "";
                return [
                  `${formatNumber(Number(value))}개${percentage ? ` (${percentage})` : ""}`,
                  name || payload.typeName,
                ];
              }}
              labelFormatter={(label) => `${label}`}
            />
          }
        />
      </PieChart>
    </ChartContainer>
  );
}

