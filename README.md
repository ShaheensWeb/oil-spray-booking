# Ottawa Oil Spray Booking

Customers book vehicle undercoating at **11 Sweetnam Drive, Ottawa**, leave their number, and get a confirmation text. Bookings are saved in `data/bookings.json`. The owner list is at `/admin`.

Business phone: **613-447-5428**. Admin password: **jasko**.

## Run it locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Hours live in `src/lib/config.ts`.

## Create a Twilio account

I cannot create this for you. Twilio needs your email, your phone, and later a card if you want to text any customer.

1. Open [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio) and sign up with your email.
2. Choose **Continue with trial**.
3. Verify your email, then verify **613-447-5428**.
4. In the Twilio Console home page, copy **Account SID** and **Auth Token**.
5. Open **Messaging → Try out SMS**. Twilio will give you a trial From number.
6. Paste those three values into `.env.local`:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM_NUMBER=+1twilio_number
BUSINESS_PHONE=+16134475428
ADMIN_PASSWORD=jasko
```

7. Restart the site. Book a slot with **613-447-5428** first. On a trial account Twilio will only text numbers you have verified.

To text any customer, click **Upgrade** in Twilio, buy a Canadian SMS number, and keep using that as `TWILIO_FROM_NUMBER`.

## Host it

Do not use Vercel for this app. Bookings are a file on disk, and Vercel’s disk is wiped on every deploy.

Use [Railway](https://railway.com) so the booking file stays put:

1. Create a free GitHub account if you do not have one, then push this folder to a new private repo.
2. Open [https://railway.com/new](https://railway.com/new) and sign up with GitHub.
3. Click **Deploy from GitHub repo** and pick this project.
4. Open the service → **Variables** and add the same five values from `.env.local`.
5. Right-click the canvas → **Volume**. Mount it at `/app/data` so bookings survive restarts.
6. Open **Settings → Networking → Generate Domain**. Railway will give you a public URL.
7. After it builds, open that URL and book a test slot. Check `/admin` with password `jasko`.

If Railway asks for a start command, use `npm run start`.
