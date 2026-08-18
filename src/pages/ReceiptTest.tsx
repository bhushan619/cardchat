import TransferReceiptImage from "@/components/admin/TransferReceiptImage";
export default function ReceiptTest() {
  return (
    <div className="p-8">
      <TransferReceiptImage
        receipt={{ amount: 200, fee: 0, status: "Success", bankName: "Access Bank Plc", accountNumber: "0123456789", accountName: "A** B****", balance: 0, transactionNumber: "10293847561" }}
      />
    </div>
  );
}
