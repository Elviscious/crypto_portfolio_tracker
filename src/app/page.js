import styles from "./page.module.css";

export default function Home() {
	// Mock data representing the FastAPI /portfolio/analysis endpoint response
	const MOCK_ANALYSIS_DATA = {
		total_portfolio_value: 17650.0,
		total_profit_loss: 650.0,
		total_percent_change: 3.82,
		trades_analysis: [
			{
				coin_symbol: "BTC",
				quantity: 0.5,
				avg_buy_price: 20000.0,
				current_price: 22500.0,
				unrealized_pnl: 1250.0,
				percent_change: 12.5,
			},
			{
				coin_symbol: "ETH",
				quantity: 2.0,
				avg_buy_price: 3500.0,
				current_price: 3200.0,
				unrealized_pnl: -600.0,
				percent_change: -8.57,
			},
			{
				coin_symbol: "SOL",
				quantity: 10.0,
				avg_buy_price: 30.0,
				current_price: 35.0,
				unrealized_pnl: 50.0,
				percent_change: 16.67,
			},
		],
	};

	return (
		<div className={styles.page}>
			<div className={styles.header}>
				<h1>CRYPTO PORTFOLIO TRACKER</h1>
				<div className={styles.portfolioInfo}>
					<span>Total Portfolio Value: $12,345.67</span> <br />
					<span>Total P&L: +$1,234.56</span>
				</div>
			</div>
			<div className={styles.content}>
				<form className={styles.form}>
					<h2>Log New Trade</h2>
					<input type="text" placeholder="Coin Symbol (e.g., BTC)" required />
					<input type="number" step="0.0001" placeholder="Quantity" required />
					<input type="number" step="0.01" placeholder="Buy Price" required />
					<button type="submit">Add Trade</button>
				</form>
				<div className={styles.portfolioPerformance}>
					<div className={styles.tableContainer}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Coin</th>
									<th>Quantity</th>
									<th>Avg Buy Price</th>
									<th>Current Price</th>
									<th>Unrealized P&L</th>
									<th>% Change</th>
								</tr>
							</thead>

							<tbody>
								{MOCK_ANALYSIS_DATA.trades_analysis.map((trade) => (
									<tr key={trade.coin_symbol}>
										<td>{trade.coin_symbol}</td>
										<td>{trade.quantity}</td>
										<td>${trade.avg_buy_price.toFixed(2)}</td>
										<td>${trade.current_price.toFixed(2)}</td>
										<td>${trade.unrealized_pnl.toFixed(2)}</td>
										<td>{trade.percent_change.toFixed(2)}%</td>
									</tr>
								))}
								<tr>
									<td
										colSpan={2}
										style={{ fontSize: "25px", fontWeight: "bold" }}
									>
										Total
									</td>
									<td></td>
									<td></td>
									<td></td>
									<td>+600%</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
