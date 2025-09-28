# 📊 Monitoring & Logging Setup

## 🔍 Monitoring Overview

### What to Monitor
- **Application Health**: API endpoints, response times, error rates
- **Infrastructure**: CPU, memory, disk, network
- **Database**: Query performance, connections, storage
- **User Experience**: Page load times, user interactions

## 🚨 Error Tracking with Sentry

### Step 1: Create Sentry Account
```bash
# 1. Go to https://sentry.io
# 2. Create free account
# 3. Create new project (Node.js)
# 4. Get DSN from project settings
```

### Step 2: Install Sentry
```bash
# Backend
cd backend
npm install @sentry/node @sentry/integrations

# Add to server.js
const Sentry = require('@sentry/node')
const { nodeProfilingIntegration } = require('@sentry/profiling-node')

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
})
```

### Step 3: Configure Sentry
```javascript
// backend/server.js
const Sentry = require('@sentry/node')

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})

// Add Sentry middleware
app.use(Sentry.requestHandler())
app.use(Sentry.tracingHandler())

// Error handling
app.use(Sentry.errorHandler())
```

## 📝 Logging with Logtail

### Step 1: Create Logtail Account
```bash
# 1. Go to https://logtail.com
# 2. Create free account
# 3. Create new source
# 4. Get token from source settings
```

### Step 2: Install Logtail
```bash
# Backend
npm install @logtail/node

# Add to server.js
const { Logtail } = require('@logtail/node')
const logtail = new Logtail(process.env.LOGTAIL_TOKEN)
```

### Step 3: Configure Logging
```javascript
// backend/server.js
const { Logtail } = require('@logtail/node')

const logtail = new Logtail(process.env.LOGTAIL_TOKEN)

// Replace console.log with logtail
const logger = {
  info: (message, meta = {}) => {
    console.log(message, meta)
    logtail.info(message, meta)
  },
  error: (message, meta = {}) => {
    console.error(message, meta)
    logtail.error(message, meta)
  },
  warn: (message, meta = {}) => {
    console.warn(message, meta)
    logtail.warn(message, meta)
  }
}

// Use logger throughout application
logger.info('Server started', { port: process.env.PORT })
logger.error('Database connection failed', { error: err.message })
```

## 📊 Uptime Monitoring

### Option 1: UptimeRobot (Free)
```bash
# 1. Go to https://uptimerobot.com
# 2. Create free account
# 3. Add monitors:
#    - HTTP Monitor: https://your-domain.com
#    - API Monitor: https://your-domain.com:5000/api/health
# 4. Set check interval: 5 minutes
# 5. Configure alerts (email, SMS)
```

### Option 2: Pingdom
```bash
# 1. Go to https://www.pingdom.com
# 2. Create account
# 3. Add website monitor
# 4. Configure alerts
```

### Option 3: StatusCake
```bash
# 1. Go to https://www.statuscake.com
# 2. Create free account
# 3. Add website test
# 4. Configure monitoring
```

## 🔧 Server Monitoring

### Option 1: DigitalOcean Monitoring
```bash
# 1. Go to DigitalOcean Dashboard
# 2. Navigate to Monitoring
# 3. Enable monitoring for your droplet
# 4. Set up alerts for:
#    - CPU usage > 80%
#    - Memory usage > 80%
#    - Disk usage > 90%
```

### Option 2: AWS CloudWatch
```bash
# 1. Go to AWS CloudWatch
# 2. Create alarms for:
#    - CPU utilization
#    - Memory utilization
#    - Disk space
# 3. Configure SNS notifications
```

### Option 3: Google Cloud Monitoring
```bash
# 1. Go to GCP Monitoring
# 2. Create uptime checks
# 3. Set up alerting policies
# 4. Configure notification channels
```

## 📈 Performance Monitoring

### Backend Performance
```javascript
// backend/middleware/performance.js
const performanceMiddleware = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    }
    
    if (duration > 1000) {
      logger.warn('Slow request detected', logData)
    }
    
    logger.info('Request completed', logData)
  })
  
  next()
}

module.exports = performanceMiddleware
```

### Frontend Performance
```javascript
// frontend/src/utils/performance.js
export const trackPerformance = () => {
  // Track page load time
  window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
    console.log('Page load time:', loadTime)
    
    // Send to analytics
    if (loadTime > 3000) {
      console.warn('Slow page load detected:', loadTime)
    }
  })
  
  // Track API response times
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    const start = Date.now()
    const response = await originalFetch(...args)
    const duration = Date.now() - start
    
    console.log('API call duration:', duration, args[0])
    
    if (duration > 2000) {
      console.warn('Slow API call detected:', duration, args[0])
    }
    
    return response
  }
}
```

## 🗄️ Database Monitoring

### Supabase Monitoring
```bash
# 1. Go to Supabase Dashboard
# 2. Navigate to Settings > Database
# 3. Enable monitoring
# 4. Set up alerts for:
#    - High query latency
#    - Connection pool exhaustion
#    - Storage usage
```

### Custom Database Monitoring
```javascript
// backend/middleware/db-monitoring.js
const dbMonitoring = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    
    // Log slow database queries
    if (duration > 500) {
      logger.warn('Slow database query', {
        method: req.method,
        url: req.url,
        duration: duration,
        timestamp: new Date().toISOString()
      })
    }
  })
  
  next()
}
```

## 📊 Analytics Setup

### Google Analytics
```html
<!-- frontend/public/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Custom Analytics
```javascript
// frontend/src/utils/analytics.js
export const trackEvent = (eventName, properties = {}) => {
  console.log('Analytics Event:', eventName, properties)
  
  // Send to your analytics service
  // Example: send to your backend
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: eventName,
      properties: properties,
      timestamp: new Date().toISOString(),
      userId: getCurrentUserId()
    })
  })
}

// Track user interactions
export const trackUserAction = (action, details = {}) => {
  trackEvent('user_action', {
    action: action,
    details: details,
    page: window.location.pathname
  })
}
```

## 🚨 Alerting Setup

### Email Alerts
```javascript
// backend/utils/alerting.js
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

const sendAlert = async (subject, message) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ALERT_EMAIL,
      subject: `[Pet Health Assistant] ${subject}`,
      text: message,
      html: `<pre>${message}</pre>`
    })
  } catch (error) {
    console.error('Failed to send alert:', error)
  }
}

module.exports = { sendAlert }
```

### Slack Alerts
```javascript
// backend/utils/slack-alerts.js
const axios = require('axios')

const sendSlackAlert = async (message) => {
  try {
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: `🚨 Pet Health Assistant Alert: ${message}`,
      channel: '#alerts'
    })
  } catch (error) {
    console.error('Failed to send Slack alert:', error)
  }
}

module.exports = { sendSlackAlert }
```

## 📋 Monitoring Checklist

### ✅ Application Monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] User analytics

### ✅ Infrastructure Monitoring
- [ ] Server resources (CPU, memory, disk)
- [ ] Network monitoring
- [ ] Database performance
- [ ] Log aggregation

### ✅ Alerting
- [ ] Error alerts
- [ ] Performance alerts
- [ ] Uptime alerts
- [ ] Resource alerts

### ✅ Logging
- [ ] Structured logging
- [ ] Log aggregation
- [ ] Log retention
- [ ] Log analysis

## 🛠️ Maintenance Tasks

### Daily
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Verify backups

### Weekly
- [ ] Review monitoring reports
- [ ] Update dependencies
- [ ] Check security alerts

### Monthly
- [ ] Analyze usage patterns
- [ ] Optimize performance
- [ ] Review costs
- [ ] Update documentation

---

**🎉 Your monitoring and logging system is now ready!**

**Next Steps:**
1. Set up monitoring dashboards
2. Configure alerting rules
3. Test monitoring systems
4. Train team on monitoring tools
