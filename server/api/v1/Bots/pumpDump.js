export async function createPumpDump(data) {
    return await fetch('/api/pump-dump/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json());
  }
  
  export async function addActiveOrder(id, order) {
    return await fetch(`/api/pump-dump/add-order/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).then(res => res.json());
  }
  
  export async function cancelActiveOrder(id, orderId) {
    return await fetch(`/api/pump-dump/cancel-order/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    }).then(res => res.json());
  }
  
  export async function getPumpDump(id) {
    return await fetch(`/api/pump-dump/${id}`).then(res => res.json());
  }
  