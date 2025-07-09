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

    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        const token = localStorage.getItem('token');
        if (!token || !user) {
            navigate('/login');
        } else {
            setLoggedInUser(user);
            fetchExpenses();
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        handleSuccess('Logged out successfully');
        setTimeout(() => navigate('/login'), 1000);
    };

    const calculateAmounts = (list) => {
        const amounts = list.map(item => item.amount);
        const income = amounts.filter(a => a > 0).reduce((a, b) => a + b, 0);
        const expense = amounts.filter(a => a < 0).reduce((a, b) => a + b, 0) * -1;
        setIncomeAmt(income);
        setExpenseAmt(expense);
    };

    const fetchExpenses = async () => {
        try {
            const response = await fetch(`https://expenzo-cmja.onrender.com/expenses`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.status === 403) {
                localStorage.clear();
                navigate('/login');
                return;
            }
            const result = await response.json();
            setExpenses(result.data || []);
            calculateAmounts(result.data || []);
        } catch (err) {
            handleError(err);
        }
    };

    const addTransaction = async (data) => {
        try {
            const response = await fetch(`${APIUrl}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });
            if (response.status === 403) {
                localStorage.clear();
                navigate('/login');
                return;
            }
            const result = await response.json();
            handleSuccess(result?.message);
            setExpenses(result.data || []);
            calculateAmounts(result.data || []);
        } catch (err) {
            handleError(err);
        }
    };

    const deleteExpens = async (id) => {
        try {
            const response = await fetch(`${APIUrl}/expenses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.status === 403) {
                localStorage.clear();
                navigate('/login');
                return;
            }
            const result = await response.json();
            handleSuccess(result?.message);
            setExpenses(result.data || []);
            calculateAmounts(result.data || []);
        } catch (err) {
            handleError(err);
        }
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
