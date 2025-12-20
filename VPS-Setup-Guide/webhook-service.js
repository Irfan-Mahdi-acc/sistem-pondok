const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9000;

// Load configuration
const config = {
    secret: process.env.WEBHOOK_SECRET || 'change-this-secret',
    deployScripts: {
        'sistem-pondok': '/var/www/sistem-pondok/deploy.sh',
        'radio-tsn': '/var/www/radio-tsn/deploy.sh',
        'psb-subdomain': '/var/www/psb-subdomain/deploy.sh'
    },
    logFile: '/var/www/logs/webhook-deployments.log'
};

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Verify Gitea signature
function verifySignature(payload, signature, secret) {
    if (!signature) return false;
    
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    
    return signature === digest;
}

// Log deployment
function logDeployment(repo, status, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${repo} - ${status}: ${message}\n`;
    
    try {
        fs.appendFileSync(config.logFile, logEntry);
    } catch (error) {
        console.error('Failed to write log:', error.message);
    }
    
    console.log(logEntry.trim());
}

// Execute deployment script
function executeDeploy(repo, deployScript) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        exec(`bash ${deployScript}`, {
            cwd: path.dirname(deployScript),
            timeout: 300000, // 5 minutes timeout
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        }, (error, stdout, stderr) => {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            
            if (error) {
                logDeployment(repo, 'FAILED', `Error after ${duration}s: ${error.message}`);
                reject({
                    error: 'Deployment failed',
                    details: error.message,
                    stderr: stderr,
                    duration: duration
                });
            } else {
                logDeployment(repo, 'SUCCESS', `Completed in ${duration}s`);
                resolve({
                    message: 'Deployment successful',
                    output: stdout,
                    duration: duration
                });
            }
        });
    });
}

// Webhook endpoint
app.post('/webhook/:repo', async (req, res) => {
    const repo = req.params.repo;
    const signature = req.headers['x-gitea-signature'];
    const payload = JSON.stringify(req.body);
    
    console.log(`Webhook received for: ${repo}`);
    
    // Verify signature
    if (!verifySignature(payload, signature, config.secret)) {
        logDeployment(repo, 'REJECTED', 'Invalid signature');
        return res.status(401).json({ 
            error: 'Invalid signature',
            message: 'Webhook signature verification failed'
        });
    }
    
    // Check if deployment script exists
    const deployScript = config.deployScripts[repo];
    if (!deployScript) {
        logDeployment(repo, 'ERROR', 'Repository not configured');
        return res.status(404).json({ 
            error: 'Repository not configured',
            available: Object.keys(config.deployScripts)
        });
    }
    
    if (!fs.existsSync(deployScript)) {
        logDeployment(repo, 'ERROR', 'Deploy script not found');
        return res.status(404).json({ 
            error: 'Deploy script not found',
            path: deployScript
        });
    }
    
    // Check if push to main branch
    const branch = req.body.ref;
    if (branch !== 'refs/heads/main') {
        logDeployment(repo, 'SKIPPED', `Push to ${branch}, not main`);
        return res.json({ 
            message: 'Not main branch, skipping deployment',
            branch: branch
        });
    }
    
    // Get commit information
    const commits = req.body.commits || [];
    const commitCount = commits.length;
    const lastCommit = commits[commits.length - 1];
    const commitMessage = lastCommit ? lastCommit.message : 'No commit message';
    const author = lastCommit ? lastCommit.author.name : 'Unknown';
    
    logDeployment(repo, 'STARTED', `${commitCount} commit(s) by ${author}: "${commitMessage}"`);
    
    // Execute deployment asynchronously
    try {
        const result = await executeDeploy(repo, deployScript);
        res.json(result);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        memory: {
            rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`
        },
        repositories: Object.keys(config.deployScripts)
    });
});

// Deployment logs endpoint
app.get('/logs', (req, res) => {
    const lines = parseInt(req.query.lines) || 50;
    
    try {
        const logContent = fs.readFileSync(config.logFile, 'utf8');
        const logLines = logContent.split('\n').filter(line => line.trim());
        const recentLogs = logLines.slice(-lines);
        
        res.json({
            logs: recentLogs,
            total: logLines.length,
            showing: recentLogs.length
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to read logs',
            message: error.message
        });
    }
});

// Repository status endpoint
app.get('/status/:repo', (req, res) => {
    const repo = req.params.repo;
    const deployScript = config.deployScripts[repo];
    
    if (!deployScript) {
        return res.status(404).json({
            error: 'Repository not found',
            available: Object.keys(config.deployScripts)
        });
    }
    
    const scriptExists = fs.existsSync(deployScript);
    
    res.json({
        repository: repo,
        deployScript: deployScript,
        scriptExists: scriptExists,
        configured: true
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    logDeployment('SYSTEM', 'ERROR', err.message);
    
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path,
        availableEndpoints: [
            'POST /webhook/:repo',
            'GET /health',
            'GET /logs',
            'GET /status/:repo'
        ]
    });
});

// Start server
const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Webhook service running on http://127.0.0.1:${PORT}`);
    console.log(`📝 Logging to: ${config.logFile}`);
    console.log(`📦 Configured repositories: ${Object.keys(config.deployScripts).join(', ')}`);
    logDeployment('SYSTEM', 'STARTED', 'Webhook service initialized');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    logDeployment('SYSTEM', 'STOPPED', 'Webhook service shutting down');
    
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    logDeployment('SYSTEM', 'STOPPED', 'Webhook service shutting down');
    
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;
