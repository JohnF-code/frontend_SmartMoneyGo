import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@component/contexts/AuthContext";
import { PaymentsProvider } from "@component/contexts/PaymentsContext";
import { ClientsProvider } from "@component/contexts/ClientsContext";
import 'react-toastify/dist/ReactToastify.css';
import { LoansProvider } from "@component/contexts/LoansContext";
import { BillsProvider } from "@component/contexts/BillsContext";
import { WithdrawalProvider } from "@component/contexts/WithdrawalContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SmartMoneyGo",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <PaymentsProvider>
            <ClientsProvider>
              <LoansProvider>
                <BillsProvider>
                  <WithdrawalProvider>
                    {children}
                  </WithdrawalProvider>
                </BillsProvider>
              </LoansProvider>
            </ClientsProvider>
          </PaymentsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
