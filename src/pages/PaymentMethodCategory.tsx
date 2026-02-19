import { DashboardLayout } from "@/components/Layout/dashboard-layout";
import { CreatePaymentCategoryModal } from "@/components/PaymentMethodCategory/Create";

export default function PaymentMethodCategoryPages() {
  return (
    <DashboardLayout>
      <div className="flex justify-end mb-4">
        <CreatePaymentCategoryModal />
      </div>
    </DashboardLayout>
  );
}
