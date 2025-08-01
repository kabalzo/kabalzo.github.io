// API Usage Tracking System
class APIUsageTracker {
    constructor() {
        this.USAGE_KEY = 'omdb_api_usage';
        this.EMAIL_KEY = 'omdb_alert_email';
        this.ALERT_THRESHOLD = 900;
        this.DAILY_LIMIT = 1000;
        this.alertSent = false;
    }

    // Get today's date as a string (YYYY-MM-DD)
    getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    // Get usage data from localStorage
    getUsageData() {
        try {
            const data = localStorage.getItem(this.USAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.warn('Failed to read usage data:', e);
            return {};
        }
    }

    // Save usage data to localStorage
    saveUsageData(data) {
        try {
            localStorage.setItem(this.USAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save usage data:', e);
        }
    }

    // Get or set email for alerts
    getAlertEmail() {
        return localStorage.getItem(this.EMAIL_KEY);
    }

    setAlertEmail(email) {
        if (this.validateEmail(email)) {
            localStorage.setItem(this.EMAIL_KEY, email);
            return true;
        }
        return false;
    }

    // Simple email validation
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Prompt for email if not set
    promptForEmail() {
        const currentEmail = this.getAlertEmail();
        if (currentEmail) return currentEmail;

        const email = prompt(
            'Enter your email address for API usage alerts:\n\n' +
            'You\'ll be notified when you approach your daily limit (900/1000 calls).'
        );

        if (email && this.setAlertEmail(email)) {
            console.log('Alert email saved:', email);
            return email;
        } else if (email) {
            console.warn('Invalid email format');
            return this.promptForEmail(); // Try again
        }
        return null;
    }

    // Increment usage count
    incrementUsage() {
        const today = this.getTodayKey();
        const usageData = this.getUsageData();
        
        // Clean up old data (keep only last 7 days)
        this.cleanupOldData(usageData);
        
        // Increment today's count
        usageData[today] = (usageData[today] || 0) + 1;
        this.saveUsageData(usageData);
        
        const todayCount = usageData[today];
        console.log(`API Usage Today: ${todayCount}/${this.DAILY_LIMIT}`);
        
        // Check if we need to send an alert
        this.checkForAlert(todayCount);
        
        return todayCount;
    }

    // Get today's usage count
    getTodayUsage() {
        const today = this.getTodayKey();
        const usageData = this.getUsageData();
        return usageData[today] || 0;
    }

    // Clean up data older than 7 days
    cleanupOldData(usageData) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        const cutoffKey = cutoffDate.toISOString().split('T')[0];
        
        Object.keys(usageData).forEach(date => {
            if (date < cutoffKey) {
                delete usageData[date];
            }
        });
    }

    // Check if we need to send an alert
    checkForAlert(todayCount) {
        if (todayCount >= this.ALERT_THRESHOLD && !this.alertSent) {
            this.sendAlert(todayCount);
            this.alertSent = true;
            
            // Reset alert flag at midnight
            this.scheduleAlertReset();
        }
    }

    // Schedule alert reset for next day
    scheduleAlertReset() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setDate(midnight.getDate() + 1);
        midnight.setHours(0, 0, 0, 0);
        
        const msUntilMidnight = midnight.getTime() - now.getTime();
        
        setTimeout(() => {
            this.alertSent = false;
        }, msUntilMidnight);
    }

    // Send email alert
    async sendAlert(todayCount) {
        const email = this.getAlertEmail() || this.promptForEmail();
        if (!email) return;

        const subject = `OMDB API Usage Alert - ${todayCount}/${this.DAILY_LIMIT} calls used`;
        const message = `
Your OMDB API usage is approaching the daily limit:

📊 Current Usage: ${todayCount}/${this.DAILY_LIMIT} calls (${Math.round(todayCount/this.DAILY_LIMIT*100)}%)
⚠️  Remaining: ${this.DAILY_LIMIT - todayCount} calls
📅 Date: ${new Date().toLocaleDateString()}

You'll receive this alert once per day when you exceed ${this.ALERT_THRESHOLD} calls.

Monitor your usage at: https://your-movie-site.com
        `.trim();

        // Try multiple email methods
        await this.tryEmailMethods(email, subject, message, todayCount);
    }

    // Try different email sending methods
    async tryEmailMethods(email, subject, message, todayCount) {
        // Method 1: EmailJS (recommended)
        const emailJSSent = await this.sendViaEmailJS(email, subject, message);
        if (emailJSSent) return;

        // Method 2: Netlify Forms (if using Netlify)
        const netlifyFormSent = await this.sendViaNetlifyForm(email, subject, message);
        if (netlifyFormSent) return;

        // Method 3: Browser notification as fallback
        this.showBrowserNotification(todayCount);

        // Method 4: Console warning
        console.warn(`🚨 API USAGE ALERT: ${todayCount}/${this.DAILY_LIMIT} calls used today!`);
    }

    // Send email via EmailJS (free service)
    async sendViaEmailJS(email, subject, message) {
        try {
            // You'll need to set up EmailJS account and get these IDs
            const serviceID = 'your_emailjs_service_id';
            const templateID = 'your_emailjs_template_id';
            const userID = 'your_emailjs_user_id';

            // Check if EmailJS is loaded
            if (typeof emailjs === 'undefined') {
                console.log('EmailJS not loaded, trying other methods...');
                return false;
            }

            await emailjs.send(serviceID, templateID, {
                to_email: email,
                subject: subject,
                message: message,
                from_name: 'Movie Site API Monitor'
            }, userID);

            console.log('✅ Email alert sent successfully via EmailJS');
            return true;
        } catch (error) {
            console.warn('EmailJS failed:', error);
            return false;
        }
    }

    // Send via Netlify form (if deployed on Netlify)
    async sendViaNetlifyForm(email, subject, message) {
        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    'form-name': 'api-alert',
                    'email': email,
                    'subject': subject,
                    'message': message
                })
            });

            if (response.ok) {
                console.log('✅ Email alert sent successfully via Netlify');
                return true;
            }
        } catch (error) {
            console.warn('Netlify form failed:', error);
        }
        return false;
    }

    // Show browser notification
    showBrowserNotification(todayCount) {
        if ('Notification' in window) {
            // Request permission if not granted
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
            
            if (Notification.permission === 'granted') {
                new Notification('OMDB API Usage Alert', {
                    body: `${todayCount}/${this.DAILY_LIMIT} API calls used today`,
                    icon: '/favicon.ico',
                    badge: '⚠️'
                });
                console.log('✅ Browser notification sent');
                return true;
            }
        }
        return false;
    }

    // Get usage statistics
    getUsageStats() {
        const usageData = this.getUsageData();
        const today = this.getTodayKey();
        const todayUsage = usageData[today] || 0;
        
        // Calculate 7-day average
        const dates = Object.keys(usageData).sort().slice(-7);
        const totalWeek = dates.reduce((sum, date) => sum + (usageData[date] || 0), 0);
        const avgDaily = dates.length > 0 ? Math.round(totalWeek / dates.length) : 0;
        
        return {
            today: todayUsage,
            remaining: this.DAILY_LIMIT - todayUsage,
            percentage: Math.round((todayUsage / this.DAILY_LIMIT) * 100),
            weeklyAverage: avgDaily,
            alertThreshold: this.ALERT_THRESHOLD,
            dailyLimit: this.DAILY_LIMIT,
            alertEmail: this.getAlertEmail()
        };
    }

    // Display usage dashboard
    displayUsageStats() {
        const stats = this.getUsageStats();
        console.group('📊 OMDB API Usage Statistics');
        console.log(`Today: ${stats.today}/${stats.dailyLimit} (${stats.percentage}%)`);
        console.log(`Remaining: ${stats.remaining} calls`);
        console.log(`7-day average: ${stats.weeklyAverage} calls/day`);
        console.log(`Alert threshold: ${stats.alertThreshold} calls`);
        console.log(`Alert email: ${stats.alertEmail || 'Not set'}`);
        console.groupEnd();
        
        return stats;
    }

    // Reset usage for testing
    resetUsage() {
        const today = this.getTodayKey();
        const usageData = this.getUsageData();
        usageData[today] = 0;
        this.saveUsageData(usageData);
        this.alertSent = false;
        console.log('Usage reset for today');
    }

    // Clear all usage data
    clearAllUsage() {
        localStorage.removeItem(this.USAGE_KEY);
        console.log('All usage data cleared');
    }

    // Update email address
    updateEmail() {
        const newEmail = prompt('Enter new email address for alerts:', this.getAlertEmail() || '');
        if (newEmail && this.setAlertEmail(newEmail)) {
            console.log('Email updated:', newEmail);
            return true;
        } else if (newEmail) {
            console.warn('Invalid email format');
            return false;
        }
        return false;
    }
}

// Create global instance
const apiUsageTracker = new APIUsageTracker();

// Expose utility functions globally
window.APIUsageUtils = {
    // View current stats
    showStats: () => apiUsageTracker.displayUsageStats(),
    
    // Update alert email
    updateEmail: () => apiUsageTracker.updateEmail(),
    
    // Reset today's usage (for testing)
    resetToday: () => apiUsageTracker.resetUsage(),
    
    // Clear all usage data
    clearAll: () => apiUsageTracker.clearAllUsage(),
    
    // Get usage object
    getTracker: () => apiUsageTracker
};

// Auto-setup email on first load
document.addEventListener('DOMContentLoaded', function() {
    // Prompt for email if not set and we're using the API
    setTimeout(() => {
        if (!apiUsageTracker.getAlertEmail()) {
            console.log('💡 Tip: Set up email alerts by running APIUsageUtils.updateEmail()');
        }
    }, 2000);
});

// Export for use in your main ratings file
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIUsageTracker;
}