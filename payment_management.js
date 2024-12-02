class PaymentManagement {
    constructor() {
        // معلومات حساب المطور (يجب تعبئتها)
        this.developerAccounts = {
            stripe: {
                publishableKey: 'YOUR_STRIPE_PUBLISHABLE_KEY',
                secretKey: 'YOUR_STRIPE_SECRET_KEY',
                accountId: 'YOUR_STRIPE_ACCOUNT_ID'
            },
            paypal: {
                clientId: 'YOUR_PAYPAL_CLIENT_ID',
                clientSecret: 'YOUR_PAYPAL_CLIENT_SECRET',
                merchantId: 'YOUR_PAYPAL_MERCHANT_ID'
            }
        };

        // إحصائيات المبيعات
        this.salesStats = {
            totalRevenue: 0,
            monthlySales: {},
            transactionHistory: [],
            topSellingItems: new Map()
        };

        this.setupPaymentDashboard();
    }

    setupPaymentDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'payment-dashboard';
        dashboard.innerHTML = `
            <div class="dashboard-container">
                <h2>لوحة تحكم المدفوعات</h2>
                
                <div class="revenue-summary">
                    <div class="total-revenue">
                        <h3>إجمالي الإيرادات</h3>
                        <span class="amount">$0.00</span>
                    </div>
                    <div class="monthly-revenue">
                        <h3>إيرادات هذا الشهر</h3>
                        <span class="amount">$0.00</span>
                    </div>
                </div>

                <div class="payment-accounts">
                    <div class="account-setup">
                        <h3>إعداد حسابات الدفع</h3>
                        <div class="stripe-setup">
                            <h4>Stripe</h4>
                            <input type="text" placeholder="Publishable Key" id="stripe-pub-key">
                            <input type="password" placeholder="Secret Key" id="stripe-secret-key">
                            <input type="text" placeholder="Account ID" id="stripe-account-id">
                            <button onclick="saveStripeCredentials()">حفظ بيانات Stripe</button>
                        </div>
                        <div class="paypal-setup">
                            <h4>PayPal</h4>
                            <input type="text" placeholder="Client ID" id="paypal-client-id">
                            <input type="password" placeholder="Client Secret" id="paypal-client-secret">
                            <input type="text" placeholder="Merchant ID" id="paypal-merchant-id">
                            <button onclick="savePayPalCredentials()">حفظ بيانات PayPal</button>
                        </div>
                    </div>
                </div>

                <div class="withdrawal-options">
                    <h3>خيارات السحب</h3>
                    <div class="withdrawal-methods">
                        <button onclick="withdrawToBank()">سحب إلى الحساب البنكي</button>
                        <button onclick="withdrawToPayPal()">سحب إلى PayPal</button>
                    </div>
                </div>

                <div class="sales-analytics">
                    <h3>تحليلات المبيعات</h3>
                    <div class="analytics-grid">
                        <div class="chart">
                            <!-- رسم بياني للمبيعات -->
                        </div>
                        <div class="top-items">
                            <h4>العناصر الأكثر مبيعاً</h4>
                            <ul id="top-selling-list"></ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // إضافة الأنماط
        const style = document.createElement('style');
        style.textContent = `
            #payment-dashboard {
                padding: 20px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }

            .dashboard-container {
                max-width: 1200px;
                margin: 0 auto;
            }

            .revenue-summary {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 20px 0;
            }

            .revenue-summary > div {
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                text-align: center;
            }

            .amount {
                font-size: 24px;
                font-weight: bold;
                color: #28a745;
            }

            .payment-accounts {
                margin: 20px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }

            .account-setup input {
                width: 100%;
                padding: 8px;
                margin: 5px 0;
                border: 1px solid #ddd;
                border-radius: 4px;
            }

            .withdrawal-options {
                margin: 20px 0;
            }

            .withdrawal-methods {
                display: flex;
                gap: 10px;
            }

            button {
                padding: 10px 20px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }

            button:hover {
                background: #0056b3;
            }

            .sales-analytics {
                margin: 20px 0;
            }

            .analytics-grid {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 20px;
            }

            .chart {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                height: 300px;
            }

            .top-items {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
            }
        `;
        document.head.appendChild(style);
    }

    async setupStripeAccount(credentials) {
        try {
            // التحقق من صحة البيانات
            const response = await fetch('/api/stripe/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) throw new Error('فشل في إعداد حساب Stripe');

            this.developerAccounts.stripe = credentials;
            this.saveAccountSettings();
            return true;
        } catch (error) {
            console.error('خطأ في إعداد Stripe:', error);
            return false;
        }
    }

    async setupPayPalAccount(credentials) {
        try {
            // التحقق من صحة البيانات
            const response = await fetch('/api/paypal/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) throw new Error('فشل في إعداد حساب PayPal');

            this.developerAccounts.paypal = credentials;
            this.saveAccountSettings();
            return true;
        } catch (error) {
            console.error('خطأ في إعداد PayPal:', error);
            return false;
        }
    }

    async withdrawFunds(method, amount) {
        try {
            const withdrawalDetails = {
                method,
                amount,
                timestamp: Date.now()
            };

            const response = await fetch('/api/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(withdrawalDetails)
            });

            if (!response.ok) throw new Error('فشل في عملية السحب');

            // تحديث الإحصائيات
            this.updateStats('withdrawal', withdrawalDetails);
            return true;
        } catch (error) {
            console.error('خطأ في السحب:', error);
            return false;
        }
    }

    updateStats(type, data) {
        switch(type) {
            case 'sale':
                this.salesStats.totalRevenue += data.amount;
                const month = new Date().toISOString().slice(0, 7);
                this.salesStats.monthlySales[month] = 
                    (this.salesStats.monthlySales[month] || 0) + data.amount;
                this.salesStats.transactionHistory.push(data);
                break;
            case 'withdrawal':
                // تسجيل عمليات السحب
                break;
        }

        this.updateDashboard();
    }

    updateDashboard() {
        // تحديث عرض الإحصائيات
        document.querySelector('.total-revenue .amount').textContent = 
            `$${this.salesStats.totalRevenue.toFixed(2)}`;

        const currentMonth = new Date().toISOString().slice(0, 7);
        document.querySelector('.monthly-revenue .amount').textContent = 
            `$${(this.salesStats.monthlySales[currentMonth] || 0).toFixed(2)}`;

        this.updateTopSellingItems();
        this.updateSalesChart();
    }

    updateTopSellingItems() {
        const topItemsList = document.getElementById('top-selling-list');
        const sortedItems = Array.from(this.salesStats.topSellingItems.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        topItemsList.innerHTML = sortedItems.map(([item, sales]) => `
            <li>${item}: ${sales} مبيعات</li>
        `).join('');
    }

    updateSalesChart() {
        // تحديث الرسم البياني باستخدام Chart.js
        const ctx = document.querySelector('.chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(this.salesStats.monthlySales),
                datasets: [{
                    label: 'المبيعات الشهرية',
                    data: Object.values(this.salesStats.monthlySales),
                    borderColor: '#007bff',
                    tension: 0.1
                }]
            }
        });
    }

    saveAccountSettings() {
        localStorage.setItem('paymentAccounts', 
            JSON.stringify(this.developerAccounts));
    }

    loadAccountSettings() {
        const saved = localStorage.getItem('paymentAccounts');
        if (saved) {
            this.developerAccounts = JSON.parse(saved);
        }
    }
}
