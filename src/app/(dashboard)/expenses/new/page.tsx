import { Header } from '@/components/layout/Header'
import { ExpenseForm } from '../ExpenseForm'

export default function NewExpensePage() {
  return (
    <div>
      <Header title="Add Expense" />
      <div className="p-6">
        <ExpenseForm />
      </div>
    </div>
  )
}
