import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Link,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { expenses } from "../../utils/api";
import type { Expense, ExpenseFormData } from "../../types/expense";

const EXPENSE_CATEGORIES = ["TRAVEL", "EQUIPMENT", "MATERIAL", "OTHER"];

interface ExpenseListProps {
  taskId: number;
}

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData, file?: File) => Promise<void>;
  initialData?: Expense;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: initialData?.amount || 0,
    description: initialData?.description || "",
    category: initialData?.category || "OTHER",
    date:
      initialData?.date.split("T")[0] || new Date().toISOString().split("T")[0],
    taskId: initialData?.taskId || 0,
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append("amount", formData.amount.toString());
    form.append("description", formData.description);
    form.append("category", formData.category);
    form.append("date", formData.date);
    form.append("taskId", formData.taskId.toString());
    if (receiptFile) {
      form.append("receipt", receiptFile);
    }
    await onSubmit(formData, receiptFile || undefined);
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? "Edit Expense" : "Add Expense"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*,.pdf"
              style={{ display: "none" }}
              id="receipt-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="receipt-file">
              <Button variant="outlined" component="span">
                {receiptFile ? receiptFile.name : "Upload Receipt"}
              </Button>
            </label>
            {initialData?.receiptUrl && !receiptFile && (
              <Box sx={{ mt: 1 }}>
                <Link
                  href={`${import.meta.env.VITE_API_URL}${
                    initialData.receiptUrl
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Current Receipt
                </Link>
              </Box>
            )}
          </Box>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="normal"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: parseFloat(e.target.value) })
            }
            required
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
          <TextField
            select
            label="Category"
            fullWidth
            margin="normal"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="normal"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <input
              accept="image/*,.pdf"
              style={{ display: "none" }}
              id="receipt-file"
              type="file"
              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="receipt-file">
              <Button variant="outlined" component="span">
                {receiptFile ? receiptFile.name : "Upload Receipt"}
              </Button>
            </label>
            {initialData?.receiptUrl && !receiptFile && (
              <Box sx={{ mt: 1 }}>
                <Link
                  href={`${process.env.REACT_APP_API_URL}${initialData.receiptUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Current Receipt
                </Link>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const ExpenseList: React.FC<ExpenseListProps> = ({ taskId }) => {  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();
  const fetchExpenses = async () => {
    try {
      const data = await expenses.getTaskExpenses(taskId);
      setExpenseList(data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [taskId]);

  const handleCreateExpense = async (data: ExpenseFormData, file?: File) => {
    try {
      const form = new FormData();
      form.append("amount", data.amount.toString());
      form.append("description", data.description);
      form.append("category", data.category);
      form.append("date", data.date);
      form.append("taskId", taskId.toString());
      if (file) {
        form.append("receipt", file);
      }

      const newExpense = await expenses.createExpense(form);
      setExpenseList([...expenseList, newExpense]);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to create expense:", error);
    }
  };

  const handleUpdateExpense = async (data: ExpenseFormData, file?: File) => {
    if (!selectedExpense) return;
    try {
      const form = new FormData();
      form.append("amount", data.amount.toString());
      form.append("description", data.description);
      form.append("category", data.category);
      form.append("date", data.date);
      form.append("taskId", taskId.toString());
      if (file) {
        form.append("receipt", file);
      }

      const updatedExpense = await expenses.updateExpense(
        selectedExpense.id,
        form
      );
      setExpenseList(
        expenseList.map((expense) =>
          expense.id === updatedExpense.id ? updatedExpense : expense
        )
      );
      setSelectedExpense(undefined);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to update expense:", error);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;
    try {
      await expenses.deleteExpense(id);
      await fetchExpenses();
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  const totalExpenses = expenseList.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Expenses</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsFormOpen(true)}
        >
          Add Expense
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Receipt</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenseList.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  {new Date(expense.date).toLocaleDateString()}
                </TableCell>
                <TableCell>${expense.amount.toFixed(2)}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>
                  {expense.receiptUrl ? (
                    <IconButton
                      color="primary"
                      component="a"
                      href={`${import.meta.env.VITE_API_URL}${
                        expense.receiptUrl
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ReceiptIcon />
                    </IconButton>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => setSelectedExpense(expense)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteExpense(expense.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Total
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  ${totalExpenses.toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <ExpenseForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedExpense(undefined);
        }}
        onSubmit={selectedExpense ? handleUpdateExpense : handleCreateExpense}
        initialData={selectedExpense}
      />
    </Box>
  );
};

export default ExpenseList;
