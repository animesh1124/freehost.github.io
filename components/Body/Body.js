import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const Body = () => {
  const [members, setMembers] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [expense, setExpense] = useState({
    name: "",
    amount: "",
    paidBy: "",
    splitBetween: [],
  });
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [transactions, setTransactions] = useState([]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (inputValue.trim() !== "") {
      setMembers([...members, inputValue.trim()]);
      setBalances((prev) => ({ ...prev, [inputValue.trim()]: 0 }));
      setInputValue("");
    }
  };

  const handleExpenseChange = (event) => {
    const { name, value, selectedOptions } = event.target;
    if (name === "splitBetween") {
      const splitBetween = Array.from(selectedOptions, (option) => option.value);
      setExpense({ ...expense, splitBetween });
    } else {
      setExpense({ ...expense, [name]: value });
    }
  };

  const handleExpenseSubmit = (event) => {
    event.preventDefault();
    const amount = parseFloat(expense.amount);
    if (
      amount > 0 &&
      members.includes(expense.paidBy) &&
      expense.splitBetween.length > 0
    ) {
      const newExpenses = [
        ...expenses,
        {
          id: uuidv4(),
          name: expense.name,
          amount: amount,
          paidBy: expense.paidBy,
          splitBetween: expense.splitBetween,
        },
      ];
      setExpenses(newExpenses);
      calculateBalances(newExpenses);
      setExpense({ name: "", amount: "", paidBy: "", splitBetween: [] });
    }
  };

  const handleDeleteExpense = (id) => {
    const newExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(newExpenses);
    calculateBalances(newExpenses);
  };

  const calculateBalances = (expenses) => {
    const newBalances = members.reduce((acc, member) => {
      acc[member] = 0;
      return acc;
    }, {});

    expenses.forEach(({ amount, paidBy, splitBetween }) => {
      const splitAmount = amount / splitBetween.length;

      splitBetween.forEach((member) => {
        newBalances[member] -= splitAmount;
      });

      newBalances[paidBy] += amount;
    });

    setBalances(newBalances);
    calculateTransactions(newBalances);
  };

  const calculateTransactions = (balances) => {
    const transactions = [];
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([member, balance]) => {
      if (balance > 0) creditors.push({ member, balance });
      if (balance < 0) debtors.push({ member, balance });
    });

    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => a.balance - b.balance);

    while (creditors.length && debtors.length) {
      const creditor = creditors[0];
      const debtor = debtors[0];
      const amount = Math.min(creditor.balance, -debtor.balance);

      transactions.push({
        from: debtor.member,
        to: creditor.member,
        amount: amount.toFixed(2),
      });

      creditor.balance -= amount;
      debtor.balance += amount;

      if (creditor.balance === 0) creditors.shift();
      if (debtor.balance === 0) debtors.shift();
    }

    setTransactions(transactions);
  };

  return (
    <div className="flex justify-center">
      <div className=" bg-gray-200 h-max p-8 rounded-lg shadow-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-4">Expense Tracker</h1>
          <form onSubmit={handleFormSubmit} className="flex items-center">
            <input
              type="text"
              placeholder="Enter Member Name"
              value={inputValue}
              onChange={handleInputChange}
              className="bg-white border border-gray-300 rounded py-2 px-4 mr-2 w-full"
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Add Member
            </button>
          </form>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Add Expense</h2>
          <form onSubmit={handleExpenseSubmit}>
            <input
              type="text"
              placeholder="Expense Name"
              name="name"
              value={expense.name}
              onChange={handleExpenseChange}
              className="bg-white border border-gray-300 rounded py-2 px-4 mb-2 w-full"
            />
            <input
              type="number"
              placeholder="Expense Amount"
              name="amount"
              value={expense.amount}
              onChange={handleExpenseChange}
              className="bg-white border border-gray-300 rounded py-2 px-4 mb-2 w-full"
            />

            <div className="flex mb-2">
              <div className="text-lg mr-4">Paid By</div>
              <select
                name="paidBy"
                value={expense.paidBy}
                onChange={handleExpenseChange}
                className="bg-white border border-gray-300 rounded py-2 px-4 w-full"
              >
                <option value="">Select Member</option>
                {members.map((member, index) => (
                  <option key={index} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex mb-2">
              <div className="text-lg mr-4">Split Between</div>
              <select
                name="splitBetween"
                multiple
                value={expense.splitBetween}
                onChange={handleExpenseChange}
                className="bg-white border border-gray-300 rounded py-2 px-4 w-full"
              >
                {members.map((member, index) => (
                  <option key={index} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out w-full"
            >
              Add Expense
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Members</h2>
          <ul className="list-disc pl-6 mb-8">
            {members.map((member, index) => (
              <li key={index}>{member}</li>
            ))}
          </ul>

          <h2 className="text-xl font-bold mb-4">Balances</h2>
          <ul className="list-disc pl-6 mb-8">
            {Object.entries(balances).map(([member, balance], index) => (
              <li key={index}>
                {member} {balance > 0 ? "should receive" : "owes"} ₹
                {Math.abs(balance).toFixed(2)}
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-bold mb-4">Transactions</h2>
          <ul className="list-disc pl-6 mb-8">
            {transactions.map((transaction, index) => (
              <li key={index}>
                {transaction.from} owes {transaction.to} ₹{transaction.amount}
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-bold mb-4">Expense History</h2>
          <ul className="list-disc pl-6">
            {expenses.map((expense, index) => (
              <li key={expense.id}>
                {expense.name}: {expense.amount} paid by {expense.paidBy} - Split
                between: {expense.splitBetween.join(", ")}
                <button
                  onClick={() => handleDeleteExpense(expense.id)}
                  className="ml-4 bg-red-500 text-white font-bold py-1 px-2 rounded"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Body;
