# Ottawa Undercoating Booking

Repo: [https://github.com/ShaheensWeb/oil-spray-booking](https://github.com/ShaheensWeb/oil-spray-booking)

Customers book premium vehicle undercoating, leave their number, and get a confirmation text. Bookings are saved in `data/bookings.json`. The owner list is at `/admin`.

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

Railway signups are often closed. Use [Render](https://render.com) instead.

1. Create a free GitHub account if you do not have one, then push this folder to a new **private** repo. Do not upload `.env.local`.
2. Open [https://dashboard.render.com/select-repo?type=web](https://dashboard.render.com/select-repo?type=web) and sign in with GitHub.
3. Pick this repo. Runtime: **Node**. Build: `npm install && npm run build`. Start: `npm run start`.
4. Add a **persistent disk** of 1 GB mounted at `/opt/render/project/src/data`.
5. In **Environment**, add:

```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=+17372508034
TWILIO_SMS_TEMPLATE=sms_appointment_reminders
BUSINESS_PHONE=+16134475428
ADMIN_PASSWORD=jasko
```

6. Create the web service. Render will give you a `*.onrender.com` URL.
7. Book a test slot, then open `/admin` with password `jasko`.

Render’s always-on plan with a disk is paid (about $7/month). The free web service sleeps and can lose the booking file if you skip the disk.
