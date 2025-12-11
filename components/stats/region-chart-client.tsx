/**
 * @file region-chart-client.tsx
 * @description 지역별 관광지 분포 차트 Client Component
 *
 * recharts를 사용하여 Bar Chart를 렌더링하는 Client Component입니다.
 *
 * @dependencies
 * - @/components/ui/chart: ChartContainer, ChartTooltip, ChartTooltipContent
 * - recharts: BarChart, Bar, XAxis, YAxis, CartesianGrid
 * - next/navigation: useRouter
 * - @/lib/types/stats: RegionStats 타입
 */

"use client";

import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { RegionStats } from "@/lib/types/stats";

/**
 * 숫자를 천 단위 콤마로 포맷팅
 */
function formatNumber(num: number): string {
  return num.toLocaleString("ko-KR");
}

/**
 * 지역별 분포 차트 Client Component
 * recharts를 사용하여 Bar Chart를 렌더링합니다.
 */
export function RegionChartClient({ data }: { data: RegionStats[] }) {
  const router = useRouter();

  // 상위 10개 지역만 표시
  const displayData = data.slice(0, 10);

  // 차트 설정
  const chartConfig = {
    count: {
      label: "관광지 개수",
      color: "hsl(var(--chart-1))",
    },
  };

  // 바 클릭 핸들러
  const handleBarClick = (data: RegionStats) => {
    // 해당 지역의 관광지 목록 페이지로 이동
    router.push(`/?areaCode=${data.areaCode}`);
  };

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[300px] md:h-[400px] lg:h-[500px]"
    >
      <BarChart
        data={displayData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
        onClick={(e) => {
          if (e?.activePayload?.[0]?.payload) {
            handleBarClick(e.activePayload[0].payload as RegionStats);
          }
        }}
        role="img"
        aria-label="지역별 관광지 분포 차트"
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="regionName"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
          className="text-xs"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-xs"
          tickFormatter={(value) => formatNumber(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [
                `${formatNumber(Number(value))}개`,
                "관광지 개수",
              ]}
              labelFormatter={(label) => `${label}`}
            />
          }
        />
        <Bar
          dataKey="count"
          fill="var(--color-count)"
          radius={[4, 4, 0, 0]}
          className="cursor-pointer transition-opacity hover:opacity-80"
        />
      </BarChart>
    </ChartContainer>
  );
}

