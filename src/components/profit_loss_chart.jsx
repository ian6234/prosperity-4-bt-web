import { useEffect, useRef } from 'react'
import { createChart, LineSeries, LineStyle } from 'lightweight-charts'
import './product_stats_card.css'

function ProfitLossChart({ chartDataByProduct }) {
    const chartRef = useRef()

    useEffect(() => {
        const chart = createChart(chartRef.current, {
            height: 200,
            width: 2100,
            layout: {
                background: { color: '#16171d' },
                textColor:  '#9ca3af',
            },
            grid: {
                vertLines: { color: '#2e303a' },
                horzLines: { color: '#2e303a' },
            },
            leftPriceScale:  { visible: true },
            rightPriceScale: { visible: true },
            localization: {
                timeFormatter: (time) => String(time),
            },
            timeScale: {
                borderColor: '#2e303a',
                tickMarkFormatter: (time) => String(time),
            },
        })

        const chartData = chartDataByProduct

        // ── PROFIT (right axis) ──────────────────────────────────────
        const profitSeries = chart.addSeries(LineSeries, {
            color:            '#3b82f6',
            lineWidth:        2,
            priceLineVisible: false,
        })
        profitSeries.setData(chartData.map(d => ({
            time:  d.timestamp,
            value: d.profit,
        })))


        chart.timeScale().fitContent()

        return () => chart.remove()
    }, [chartDataByProduct])

    return (
        <div ref={chartRef} />
    )
}

export default ProfitLossChart