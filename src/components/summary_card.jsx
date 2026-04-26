import './summary_card.css'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';



function SummaryCard({ summaryData }) {
    return (
        <div className='parent-container'>
            <div className="summary-card">
                <div className='title-section'>
                    <div className="card-header">
                        <h2>Summary</h2>
                        <h3>PnL: {summaryData['total_profit']}</h3>
                        <h3>Sharpe: {summaryData['sharpe_ratio']}</h3>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default SummaryCard;