async function testGet() {
  const url = 'https://script.google.com/macros/s/AKfycby9PQee6TJMFKI98XJ1rVO2qGQ-vTGUzvx7zAkQxEN9Fob2pjpK4T6KcJSAxHZDO-cChw/exec';
  try {
    const response = await fetch(url);
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text);
  } catch (e) {
    console.error('Error:', e);
  }
}

testGet();
