import { useState, useEffect } from 'react'
import './HomePage.css'

// Component Imports
import ProductStatsCard from "../components/product_stats_card.jsx";
import OrderBookChart from "../components/order_book_chart.jsx";
import ProfitLossChart from "../components/profit_loss_chart.jsx";
import OrderDepthChart from "../components/order_depth_chart.jsx";

function HomePage() {
    const [apiData, setApiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dataSource, setDataSource] = useState('parse-log'); // 'parse-log' | 'backtest-full' | 'backtest-fast'
    const [hoveredTimestamp, setHoveredTimestamp] = useState(null);

    const sourceOptions = [
        { value: 'parse-log', label: 'Parse Log' },
        { value: 'backtest-full', label: 'Backtest (Full)' },
        { value: 'backtest-fast', label: 'Backtest (Fast)' },
    ];

    const urlForSource = (source) => {
        if (source === 'backtest-full') return 'http://localhost:8000/backtest?use_full=true';
        if (source === 'backtest-fast') return 'http://localhost:8000/backtest';
        return 'http://localhost:8000/parse-log';
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setError(null);
        fetch(urlForSource(dataSource))
            .then(response => response.json())
            .then(data => {
                setApiData(data);
                setSelectedProduct(data['message']['products'][0]);
                setLoading(false);
            })
            .catch(err => { setError(err); setLoading(false) });
    }, [dataSource]);
    if (loading) return <p>Running backtest, please wait...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!apiData || !apiData['message']) return <p>No data available.</p>;

    const products = apiData['message']['products']

    return (
        <>
            <h1>Backtest results</h1>
            <div>
                <label>Data source: </label>
                <select value={dataSource} onChange={e => setDataSource(e.target.value)}>
                    {sourceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
            <h2>Total PnL: {apiData['message']['total_profit']}</h2>
            <p>Select Product</p>

            <div className="charts">
                    <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                        {products.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                <ProfitLossChart  chartDataByProduct={apiData['message']['chart_data'][selectedProduct]}></ProfitLossChart>
                <ProductStatsCard chartDataByProduct={apiData['message']['chart_data'][selectedProduct]} posLimit={apiData['message']['position_limits'][selectedProduct]}></ProductStatsCard>
                <OrderBookChart marketTrades={apiData['message']['market_trades'][selectedProduct]} ownTrades={apiData['message']['own_trades'][selectedProduct]}
                                priceHistory={apiData['message']['price_history'][selectedProduct]}
                                onCrosshairMove={setHoveredTimestamp}/>
                <OrderDepthChart snapshots={apiData['message']['book_snapshots'][selectedProduct]} timestamp={hoveredTimestamp}></OrderDepthChart>
            </div>
        </>
    )
}

export default HomePage
