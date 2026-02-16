const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Import the product data
const dataPath = path.join(__dirname, '../data/computerProductivityProducts.ts');
const dataContent = fs.readFileSync(dataPath, 'utf8');

// Extract product URLs from the TypeScript file
function extractProductUrls(content) {
  const products = [];
  const productRegex = /{\s*id:\s*"([^"]+)"[\s\S]*?productUrl:\s*"([^"]+)"/g;
  let match;

  while ((match = productRegex.exec(content)) !== null) {
    products.push({
      id: match[1],
      productUrl: match[2]
    });
  }

  return products;
}

// Perform GET request with redirect following
function validateUrl(url, timeout = 20000) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const makeRequest = (requestUrl, redirectCount = 0) => {
      if (redirectCount > 10) {
        resolve({
          status: 'error',
          error: 'Too many redirects',
          finalUrl: requestUrl,
          responseTime: Date.now() - startTime
        });
        return;
      }

      const protocol = requestUrl.startsWith('https') ? https : http;
      const req = protocol.get(requestUrl, {
        timeout: timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }, (res) => {
        const { statusCode, headers } = res;

        // Handle redirects
        if (statusCode >= 300 && statusCode < 400 && headers.location) {
          const redirectUrl = new URL(headers.location, requestUrl).toString();
          makeRequest(redirectUrl, redirectCount + 1);
          return;
        }

        // Consume response data to free up memory
        res.resume();

        resolve({
          status: statusCode,
          finalUrl: requestUrl,
          responseTime: Date.now() - startTime,
          valid: statusCode >= 200 && statusCode < 400
        });
      });

      req.on('error', (error) => {
        resolve({
          status: 'error',
          error: error.message,
          finalUrl: requestUrl,
          responseTime: Date.now() - startTime,
          valid: false
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          status: 'timeout',
          error: 'Request timeout',
          finalUrl: requestUrl,
          responseTime: timeout,
          valid: false
        });
      });
    };

    makeRequest(url);
  });
}

// Main validation function
async function validateAllUrls() {
  console.log('🔍 Extracting product URLs from data file...\n');
  const products = extractProductUrls(dataContent);

  console.log(`Found ${products.length} products to validate\n`);
  console.log('🌐 Validating URLs...\n');

  const results = [];
  let validCount = 0;
  let invalidCount = 0;

  for (const product of products) {
    process.stdout.write(`Checking ${product.id}... `);

    const result = await validateUrl(product.productUrl);

    const reportEntry = {
      id: product.id,
      productUrl: product.productUrl,
      status: result.status,
      finalUrl: result.finalUrl,
      responseTime: result.responseTime,
      valid: result.valid,
      error: result.error || null
    };

    results.push(reportEntry);

    if (result.valid) {
      validCount++;
      console.log(`✅ ${result.status} (${result.responseTime}ms)`);
    } else {
      invalidCount++;
      console.log(`❌ ${result.status} ${result.error ? `(${result.error})` : ''}`);
    }
  }

  // Write report
  const reportPath = path.join(__dirname, 'url-report-computer-productivity.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Validation Summary:`);
  console.log(`   Total: ${products.length}`);
  console.log(`   Valid: ${validCount} ✅`);
  console.log(`   Invalid: ${invalidCount} ❌`);
  console.log('='.repeat(60));
  console.log(`\n📄 Report saved to: ${reportPath}\n`);

  // List invalid URLs
  if (invalidCount > 0) {
    console.log('❌ Invalid URLs that need fixing:\n');
    results.filter(r => !r.valid).forEach(r => {
      console.log(`   ${r.id}:`);
      console.log(`   URL: ${r.productUrl}`);
      console.log(`   Status: ${r.status} ${r.error ? `(${r.error})` : ''}\n`);
    });
  }
}

// Run validation
validateAllUrls().catch(console.error);
