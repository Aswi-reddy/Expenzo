import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APIUrl, handleError, handleSuccess } from '../utils';
import { ToastContainer } from 'react-toastify';
import ExpenseTable from './ExpenseTable';
import ExpenseDetails from './ExpenseDetails';
import ExpenseForm from './ExpenseForm';

function Home() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [incomeAmt, setIncomeAmt] = useState(0);
    const [expenseAmt, setExpenseAmt] = useState(0);

    const navigate = useNavigate();

    // ✅ Fetch user info and expenses on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('loggedInUser');

        if (!token || !user) {
            navigate('/login');
        } else {
            setLoggedInUser(user);
            fetchExpenses();
        }
    }, []);

    // ✅ Fetch expenses from backend
    const fetchExpenses = async () => {
        try {
            const response = await fetch(`https://expenzo-cmja.onrender.com/expenses`, {
                method: 'GET',
                headers: {
                    'Authorization': localStorage.getItem('token') // 🛠 FIX: Send plain token
                }
            });

            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            const result = await response.json();
            setExpenses(result.data); // ✅ Save data to state
        } catch (err) {
            handleError(err.message || 'Failed to fetch expenses');
        }
    };

    // ✅ Add new expense
    const addTransaction = async (data) => {
        try {
            const response = await fetch(`${APIUrl}/expenses`, {
                method: 'POST',
                headers: {
                    'Authorization': localStorage.getItem('token'), // 🛠 FIX
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            const result = await response.json();
            handleSuccess(result?.message);
            setExpenses(result.data); // ✅ Update UI
        } catch (err) {
            handleError(err.message || 'Failed to add expense');
        }
    };

    // ✅ Delete an expense
    const deleteExpens = async (id) => {
        try {
            const response = await fetch(`${APIUrl}/expenses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': localStorage.getItem('token') // 🛠 FIX
                }
            });

            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            const result = await response.json();
            handleSuccess(result?.message);
            setExpenses(result.data); // ✅ Update UI
        } catch (err) {
            handleError(err.message || 'Failed to delete expense');
        }
    };

    // ✅ Recalculate income and expense totals whenever list changes
    useEffect(() => {
        const amounts = expenses.map(item => item.amount);
        const income = amounts.filter(item => item > 0)
            .reduce((acc, item) => acc + item, 0);
        const exp = amounts.filter(item => item < 0)
            .reduce((acc, item) => acc + item, 0) * -1;

        setIncomeAmt(income);
        setExpenseAmt(exp);
    }, [expenses]);

    // ✅ Logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        handleSuccess('User Logged out');
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    return (
        <div>
            <div className='user-section'>
                <h1>Welcome {loggedInUser}</h1>
                <button onClick={handleLogout}>Logout</button>
            </div>

            <ExpenseDetails incomeAmt={incomeAmt} expenseAmt={expenseAmt} />
            <ExpenseForm addTransaction={addTransaction} />
            <ExpenseTable expenses={expenses} deleteExpens={deleteExpens} />
            <ToastContainer />
        </div>
    );
}

export default Home;
