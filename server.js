const express = require('express')
const app = express()
const cors = require('cors')
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
	authStrategy: new LocalAuth(),
	puppeteer: { headless: true,args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']}
});

app.use(cors())

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('disconnected', (reason) => {
	console.log('message', 'Whatsapp is disconnected!');
});


client.initialize();

app.get('/api/v1/otp/:phone/send', async (req, res) => {
  const { phone } = req.params
  const { message } = req.query
  const isPhone = /^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/g.test(parseInt(phone))

  if(!phone) {
    return res.status(400).json({ error: "Masukkan nomor hp!" })
  } else if(!isPhone) {
    return res.status(400).json({ error: "Nomor hp tidak valid!" })
  }

  const isRegistered = await client.getNumberId(phone)

  if(isRegistered) {
    await client.sendMessage(`${phone}@c.us`, message)
  } else {
    return res.status(400).json({ error: "Nomor tidak terdaftar di whatsapp!" })
  }

  return res.status(200).json({ success: 'Message send success!' })
})

const port = 8001

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
})

