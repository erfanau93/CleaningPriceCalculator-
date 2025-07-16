# Deployment Guide for Render

This guide will help you deploy your Cleaning Price Calculator app on Render.

## Prerequisites

1. **GitHub Repository**: Make sure your code is pushed to a GitHub repository
2. **Neon Database**: You'll need a PostgreSQL database (Neon is recommended)

## Step 1: Set up Neon Database

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy your database connection string (it will look like: `postgresql://username:password@host:port/database`)

## Step 2: Deploy on Render

1. **Sign up/Login to Render**:
   - Go to [render.com](https://render.com)
   - Sign up or log in with your GitHub account

2. **Create a New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your app

3. **Configure the Service**:
   - **Name**: `cleaning-price-calculator` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Set Environment Variables**:
   - Click on "Environment" tab
   - Add the following variables:
     - `DATABASE_URL`: Your Neon database connection string
     - `NODE_ENV`: `production`
     - `PORT`: `10000`

5. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

## Step 3: Database Setup

After deployment, you'll need to run database migrations:

1. **Option 1: Using Render Shell**:
   - Go to your service in Render dashboard
   - Click "Shell" tab
   - Run: `npx drizzle-kit push`

2. **Option 2: Local Migration**:
   - Set your local `DATABASE_URL` to the production database
   - Run: `npx drizzle-kit push`

## Step 4: Verify Deployment

1. Your app will be available at: `https://your-app-name.onrender.com`
2. Test the quote calculator functionality
3. Check that quotes are being saved to the database

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation works locally

2. **Database Connection Error**:
   - Verify `DATABASE_URL` is correct
   - Check that Neon database is accessible

3. **App Not Starting**:
   - Check logs in Render dashboard
   - Verify `PORT` environment variable is set

### Logs and Debugging:

- View logs in Render dashboard under "Logs" tab
- Check "Events" tab for deployment status
- Use Render Shell for debugging if needed

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Environment (production/development) | Yes |
| `PORT` | Server port (Render sets this automatically) | No |
| `SENDGRID_API_KEY` | For email functionality | No |

## Support

If you encounter issues:
1. Check Render's documentation: [docs.render.com](https://docs.render.com)
2. Review your app logs in the Render dashboard
3. Ensure your local development environment works before deploying 