async function testPost() {
  const url = 'https://script.google.com/macros/s/AKfycby9PQee6TJMFKI98XJ1rVO2qGQ-vTGUzvx7zAkQxEN9Fob2pjpK4T6KcJSAxHZDO-cChw/exec';
  const data = {
    tipoLancamento: 'Custeio',
    valorCompra: 100,
    grupo: 'Vertebrados'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text);
  } catch (e) {
    console.error('Error:', e);
  }
}

testPost();
