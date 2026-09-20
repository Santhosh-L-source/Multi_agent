import { useEffect, useState } from "react";
import Chat from "../components/Chat";

function Dashboard() {

    const [account, setAccount] = useState(null);
    const [error, setError] = useState("");
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {

        const token = localStorage.getItem("access_token");

        fetch("http://127.0.0.1:8000/accounts/5/balance", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(async (response) => {

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || "Failed to fetch account");
                }

                return data;
            })
            .then((data) => {
                setAccount(data);
            })
            .catch((error) => {
                setError(error.message);
            });
            fetch("http://127.0.0.1:8000/transactions/5", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(async (response) => {

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Failed to fetch transactions"
                    );
                }

                return data;
            })
            .then((data) => {
                setTransactions(data.transactions);
            })
            .catch((error) => {
                setError(error.message);
            });
    }, []);
    return (
        <div>

            <h1>Bank AI Dashboard</h1>

            {error && (
                <p>{error}</p>
            )}

            {account && (
                <div>
                    <h2>Account</h2>

                    <p>
                        Account Number: {account.account_number}
                    </p>

                    <p>
                        Balance: ₹{account.balance}
                    </p>

                    <p>
                        Currency: {account.currency}
                    </p>

                    <p>
                        Status: {account.status}
                    </p>
                </div>
            )}
             <h2>Recent Transactions</h2>

            {transactions.length === 0 ? (
                <p>No transactions found.</p>
            ) : (
                <div>
                    {transactions.map((transaction) => (
                        <div key={transaction.transaction_id}>

                            <p>
                                Transaction ID: {transaction.transaction_id}
                            </p>

                            <p>
                                Amount: ₹{transaction.amount}
                            </p>

                            <p>
                                Type: {transaction.transaction_type}
                            </p>

                            <p>
                                Status: {transaction.status}
                            </p>

                            <p>
                                Description: {transaction.description}
                            </p>

                            <hr />

                        </div>
                    ))}
                </div>
            )}
            <Chat />
        </div>
    );
}

export default Dashboard;