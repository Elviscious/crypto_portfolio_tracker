"use client";
import styles from "./page.module.css";
import { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
	const [userId, setUserId] = useState(null);
	const [symbol, setsymbol] = useState("");
	const [error, setError] = useState(null);
	const [quantity, setQuantity] = useState(0);
	const [buyPrice, setBuyPrice] = useState(0);
	const [portfolioData, setPortfolioData] = useState({
		total_portfolio_value: 0,
		total_profit_loss: 0,
		total_percent_change: 0,
		trades_analysis: [],
	});

	const generateUserId = () => {
		return `user_${uuidv4()}`;
	};

	const initializeUserId = useCallback(() => {
		const storedUserId = localStorage.getItem("cryptoPortfolioUserId");
		if (storedUserId) {
			setUserId(storedUserId);
		} else {
			const newUserId = generateUserId();
			localStorage.setItem("cryptoPortfolioUserId", newUserId);
			setUserId(newUserId);
		}
	}, []);

	const fetchPortfolioData = useCallback(async () => {
		if (!userId) return;
		setError(null);

		try {
			const response = await fetch(
				"https://cryptoportfoliotrackerapi-production.up.railway.app/portfolio/analysis",
				{
					headers: {
						"User-ID": userId,
					},
				}
			);

			const data = await response.json();

			// Check for the specific "No trades found" message
			if (
				data.detail &&
				data.detail.includes("No trades found for this user")
			) {
				setPortfolioData({
					total_portfolio_value: 0,
					total_profit_loss: 0,
					total_percent_change: 0,
					trades_analysis: [],
				});
				setError("No trades found for this user. Add your first trade!");
				return;
			}

			if (!response.ok) {
				throw new Error(data.detail || "Failed to fetch portfolio data");
			}

			setPortfolioData(data);
			setError(null);
		} catch (err) {
			console.error("Error fetching portfolio data:", err);
			setPortfolioData({
				total_portfolio_value: 0,
				total_profit_loss: 0,
				total_percent_change: 0,
				trades_analysis: [],
			});

			// Check if the error message contains "No trades found"
			if (
				err.message &&
				err.message.includes("No trades found for this user")
			) {
				setError("No trades found for this user. Add your first trade!");
			} else {
				setError("Unable to fetch portfolio data. Please try again later.");
			}
		}
	}, [userId]);

	// Initialize userId and fetch portfolio data on component mount
	useEffect(() => {
		initializeUserId();
	}, [initializeUserId]);

	// Fetch portfolio data when userId changes or component mounts
	useEffect(() => {
		if (userId) {
			fetchPortfolioData();
		}
	}, [userId, fetchPortfolioData]);

	async function handleSubmit() {
		setError(null);

		try {
			const response = await fetch(
				"https://cryptoportfoliotrackerapi-production.up.railway.app/trades",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"User-ID": userId,
					},
					body: JSON.stringify({
						coin_symbol: symbol,
						quantity: quantity,
						avg_buy_price: buyPrice,
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to add trade");
			}

			// Clear form on success
			setsymbol("");
			setQuantity(0);
			setBuyPrice(0);

			// Refresh portfolio data
			await fetchPortfolioData();
		} catch (err) {
			console.error("Error submitting trade:", err);
			setError(err.message || "Failed to add trade. Please try again.");
		}
	}

	return (
		<div className={styles.page}>
			<div className={styles.header}>
				<h1>CRYPTO PORTFOLIO TRACKER</h1>
				<div className={styles.portfolioInfo}>
					<span>
						Total Portfolio Value: $
						{portfolioData.total_portfolio_value.toFixed(2)}
					</span>{" "}
					<br />
					<span>
						Total P&L: ${portfolioData.total_profit_loss > 0 ? "+" : ""}
						{portfolioData.total_profit_loss.toFixed(2)}
					</span>
				</div>
			</div>
			<div className={styles.content}>
				<form
					className={styles.form}
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
				>
					<h2>Log New Trade</h2>
					<input
						type="text"
						placeholder="Coin Symbol (e.g., BTC)"
						onChange={(e) => setsymbol(e.target.value.toUpperCase())}
						value={symbol}
						required
					/>
					<input
						type="number"
						step="0.0001"
						placeholder="Quantity"
						onChange={(e) => setQuantity(parseFloat(e.target.value))}
						value={quantity || ""}
						required
					/>
					<input
						type="number"
						step="0.01"
						placeholder="Buy Price For 1 Token"
						onChange={(e) => setBuyPrice(parseFloat(e.target.value))}
						value={buyPrice || ""}
						required
					/>
					<button type="submit">Add Trade</button>
					{error && <p style={{ color: "red" }}>{error}</p>}
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
								{portfolioData.trades_analysis.map((trade) => (
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
									<td>${portfolioData.total_profit_loss.toFixed(2)}</td>
									<td>{portfolioData.total_percent_change.toFixed(2)}%</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
