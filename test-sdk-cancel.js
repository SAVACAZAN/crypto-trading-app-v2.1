// Test script to verify LCX SDK bulk cancel integration

const testData = {
    userID: 'test-user-id',
    exchange: 'lcx',
    apiKeyName: 'test-api-key',
    symbol: 'BTC/USDT',
    orderIds: ['order1', 'order2', 'order3']
}

async function testBulkCancel() {
    console.log('Testing SDK bulk cancel integration...\n')

    try {
        const response = await fetch('http://localhost:3001/api/v1/cancelAllOrdersBySymbol', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        })

        const result = await response.json()

        console.log('Response:', JSON.stringify(result, null, 2))
        console.log('\nMethod used:', result.method)

        if (result.method === 'SDK orderCancelAll (bulk)') {
            console.log('✅ SDK bulk cancel is working!')
        } else if (result.method === 'Individual cancellation (fallback)') {
            console.log('⚠️ Using fallback method - SDK bulk cancel NOT working')
        }

    } catch (error) {
        console.error('❌ Error testing:', error.message)
    }
}

// Wait for server to be ready
setTimeout(() => {
    testBulkCancel()
}, 5000)
