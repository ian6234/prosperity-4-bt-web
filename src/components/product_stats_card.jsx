import { useEffect, useRef } from 'react'
import { createChart, LineSeries, LineStyle } from 'lightweight-charts'
import './product_stats_card.css'

function ProductStatsCard({ chartDataByProduct, posLimit }) {
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

        // ── POSITION (left axis) ─────────────────────────────────────
        const positionSeries = chart.addSeries(LineSeries, {
            color:            '#22c55e',
            lineWidth:        2,
            priceLineVisible: false,
        })
        positionSeries.setData(chartData.map(d => ({
            time:  d.timestamp,
            value: d.position,
        })))


        // ── POSITION LIMIT LINES ─────────────────────────────────────
        if (posLimit != null) {
            const limitStyle = {
                lineStyle:  LineStyle.Dotted,
                lineWidth:  2,
                color:      '#f55d0b',
                axisLabelVisible: true,
            }
            const neutralStyle = {
                lineStyle:  LineStyle.Dotted,
                lineWidth:  2,
                color:      '#ffe017',
                axisLabelVisible: true,
            }
            positionSeries.createPriceLine({ price:  posLimit, ...limitStyle })
            positionSeries.createPriceLine({ price: -posLimit, ...limitStyle })
            positionSeries.createPriceLine({ price: 0, ...neutralStyle })
        }

        chart.timeScale().fitContent()

        return () => chart.remove()
    }, [chartDataByProduct, posLimit])

    return (
        <div ref={chartRef} />
    )
}

export default ProductStatsCard