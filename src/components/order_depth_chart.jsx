import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#1e2030', border: '1px solid #2e303a', padding: '8px 12px', borderRadius: 6, fontSize: 12, color: '#9ca3af' }}>
            <div style={{ marginBottom: 4, color: '#e5e7eb', fontWeight: 600 }}>Price {label}</div>
            {payload.map(p => p.value > 0 && (
                <div key={p.name} style={{ color: p.fill }}>{p.name}: {p.value}</div>
            ))}
        </div>
    )
}

// Find the snapshot whose timestamp is closest to (and <= ) the hovered time.
// Falls back to the last snapshot if nothing matches.
function findSnapshot(snapshots, timestamp) {
    if (!snapshots?.length) return null
    if (timestamp == null) return snapshots[snapshots.length - 1]

    let lo = 0, hi = snapshots.length - 1, best = 0
    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (snapshots[mid].timestamp <= timestamp) {
            best = mid
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    return snapshots[best]
}

// snapshots: array of { timestamp, market_buy_orders, market_sell_orders, my_buy_orders, my_sell_orders }
// timestamp: the currently hovered timestamp from the order book chart (or null)
function OrderDepthChart({ snapshots, timestamp }) {
    const orderData = findSnapshot(snapshots, timestamp)
    if (!orderData) return null

    const { market_buy_orders, market_sell_orders, my_buy_orders, my_sell_orders } = orderData

    // Collect all price levels
    const allPrices = new Set([
        ...Object.keys(market_buy_orders ?? {}),
        ...Object.keys(market_sell_orders ?? {}),
        ...Object.keys(my_buy_orders ?? {}),
        ...Object.keys(my_sell_orders ?? {}),
    ])

    const data = [...allPrices]
        .map(Number)
        .sort((a, b) => a - b)
        .map(price => {
            const key = price.toString()
            const marketBuy  = Math.abs(market_buy_orders?.[key]  ?? 0)
            const myBuy      = Math.abs(my_buy_orders?.[key]      ?? 0)
            const marketSell = Math.abs(market_sell_orders?.[key] ?? 0)
            const mySell     = Math.abs(my_sell_orders?.[key]     ?? 0)
            return { price, marketBuy, myBuy, marketSell, mySell }
        })

    return (
        <div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>
                Order book @ t={orderData.timestamp}
                {timestamp == null && <span style={{ marginLeft: 8, color: '#6b7280' }}>(hover chart to sync)</span>}
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} barCategoryGap="10%" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2e303a" vertical={false} />
                    <XAxis dataKey="price" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#2e303a' }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={CustomTooltip} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <ReferenceLine y={0} stroke="#2e303a" />

                    {/* Buy side — stacked green bars */}
                    <Bar dataKey="marketBuy" name="Market buy" stackId="buy" fill="#16a34a" radius={0} />
                    <Bar dataKey="myBuy"     name="My buy"     stackId="buy" fill="#4ade80" radius={[3, 3, 0, 0]} />

                    {/* Sell side — stacked red bars */}
                    <Bar dataKey="marketSell" name="Market sell" stackId="sell" fill="#b91c1c" radius={0} />
                    <Bar dataKey="mySell"     name="My sell"     stackId="sell" fill="#f87171" radius={[3, 3, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default OrderDepthChart