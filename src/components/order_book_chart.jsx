import { createChart, createSeriesMarkers, LineSeries, LineStyle } from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'

const OrderBookChart = ({ priceHistory, marketTrades, ownTrades, onCrosshairMove }) => {
    const chartRef     = useRef()
    const chartObjRef  = useRef()  // store chart instance for cleanup

    useEffect(() => {
        const chart = createChart(chartRef.current, {
            height: 600,
            width: 2100,
            layout: {
                background: { color: '#16171d' },
                textColor:  '#9ca3af',
            },
            grid: {
                vertLines: { color: '#2e303a' },
                horzLines: { color: '#2e303a' },
            },
            crosshair: { mode: 1 },  // magnet mode — snaps to data points
            localization: {
                timeFormatter: (time) => String(time),
            },
            timeScale: {
                borderColor: '#2e303a',
                minBarSpacing: 2,
                tickMarkFormatter: (time) => String(time),
            },
        })

        // ── MID PRICE ───────────────────────────────────────────────
        const midSeries = chart.addSeries(LineSeries, {
            color:       '#8725ff',
            lineWidth:   2,
            priceLineVisible: false,
        })
        midSeries.setData(priceHistory.map(p => ({
            time:  p.timestamp,
            value: p.mid
        })))

        // ── BID/ASK BAND ────────────────────────────────────────────
        // Best ask — upper bound of band
        const askSeries = chart.addSeries(LineSeries, {
            color:           'rgba(239,68,68,0.75)',  // transparent red
            lineWidth:       1,
            lineStyle:       LineStyle.Dashed,
            priceLineVisible: false,
        })
        askSeries.setData(priceHistory.map(p => ({
            time:  p.timestamp,
            value: p.best_ask
        })))

        // Best bid — lower bound of band
        const bidSeries = chart.addSeries(LineSeries, {
            color:           'rgba(34,197,94,0.75)',  // transparent green
            lineWidth:       1,
            lineStyle:       LineStyle.Dashed,
            priceLineVisible: false,
        })
        bidSeries.setData(priceHistory.map(p => ({
            time:  p.timestamp,
            value: p.best_bid
        })))

        // ── MARKET TRADE MARKERS ────────────────────────────────────
        // Small grey markers — background activity
        createSeriesMarkers(midSeries, [
            ...marketTrades.map(t => ({
                time:     t.timestamp,
                position: t.side === 'BUY' ? 'belowBar' : 'aboveBar',
                color:    '#1a69ff',   // grey — not your trades
                shape:    'circle',
                size:     1,
                text:     `M ${t.quantity}@${t.price}`
            })),
            // ── YOUR TRADE MARKERS ──────────────────────────────────
            // Larger, coloured — your fills
            ...ownTrades.map(t => ({
                time:     t.timestamp,
                position: t.side === 'BUY' ? 'belowBar' : 'aboveBar',
                color:    t.side === 'BUY' ? '#22c55e' : '#ef4444',
                shape:    t.side === 'BUY' ? 'arrowUp'  : 'arrowDown',
                size:     2,
                text:     `${t.quantity}@${t.price}`
            }))
        ].sort((a, b) => a.time - b.time))

        chartObjRef.current = chart

        // Sync crosshair position to OrderDepthChart
        if (onCrosshairMove) {
            chart.subscribeCrosshairMove(param => {
                onCrosshairMove(param.time ?? null)
            })
        }

        // Fit all data on mount
        chart.timeScale().fitContent()

        return () => chart.remove()
    }, [priceHistory, marketTrades, ownTrades])

    return <div ref={chartRef} />
}

export default OrderBookChart;