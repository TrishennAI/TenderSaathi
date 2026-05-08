# GitHub Setup Guide for TenderSaathi

This guide will help you push your TenderSaathi project to GitHub.

## ✅ Current Status

- ✅ Git repository initialized
- ✅ All files committed (2 commits)
- ✅ README.md created with comprehensive documentation
- ✅ GitHub templates added (.github/ folder)
- ✅ Contributing guide created
- ⚠️ No remote repository configured yet

## 🚀 Steps to Push to GitHub

### Option 1: Create New Repository on GitHub (Recommended)

#### Step 1: Create Repository on GitHub

1. Go to [GitHub](https://github.com) and log in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name**: `TenderSaathi` (or your preferred name)
   - **Description**: "Next.js-based tender support workflow application for Indian MSMEs and GeM vendors"
   - **Visibility**: Choose **Private** (recommended) or **Public**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

#### Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR-USERNAME/TenderSaathi.git

# Verify the remote was added
git remote -v

# Push your code to GitHub
git push -u origin main
```

**Replace `YOUR-USERNAME`** with your actual GitHub username.

#### Step 3: Verify on GitHub

1. Refresh your GitHub repository page
2. You should see all your files, including:
   - README.md with full documentation
   - All source code
   - Documentation in `docs/` folder
   - GitHub templates in `.github/` folder

### Option 2: Use GitHub CLI (gh)

If you have [GitHub CLI](https://cli.github.com/) installed:

```bash
# Authenticate (if not already)
gh auth login

# Create repository and push
gh repo create TenderSaathi --private --source=. --remote=origin --push

# Or for public repository
gh repo create TenderSaathi --public --source=. --remote=origin --push
```

### Option 3: Use GitHub Desktop

1. Download and install [GitHub Desktop](https://desktop.github.com/)
2. Open GitHub Desktop
3. Click **File** → **Add Local Repository**
4. Browse to `c:\Users\Akash\Documents\Trishen\TenderSaathi`
5. Click **Publish repository**
6. Choose name, description, and visibility
7. Click **Publish Repository**

## 📋 Post-Setup Checklist

After pushing to GitHub, complete these tasks:

### 1. Repository Settings

- [ ] Add repository description
- [ ] Add topics/tags: `nextjs`, `typescript`, `supabase`, `tailwindcss`, `tender-management`, `gem-portal`
- [ ] Set up branch protection rules for `main` branch
- [ ] Enable **Issues** and **Discussions** (if desired)

### 2. Secrets and Environment Variables

**⚠️ IMPORTANT**: Never commit `.env.local` or any file with secrets!

For GitHub Actions (if you add CI/CD later):
- Go to **Settings** → **Secrets and variables** → **Actions**
- Add secrets:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Other environment variables as needed

### 3. Collaborators (if team project)

- Go to **Settings** → **Collaborators**
- Add team members with appropriate permissions

### 4. GitHub Pages (Optional)

If you want to host documentation:
- Go to **Settings** → **Pages**
- Select source branch and folder
- Save

### 5. Enable GitHub Features

- [ ] **Issues**: For bug tracking and feature requests
- [ ] **Projects**: For project management
- [ ] **Discussions**: For community Q&A
- [ ] **Wiki**: For additional documentation
- [ ] **Actions**: For CI/CD workflows

## 🔒 Security Best Practices

### Files Already Protected by .gitignore

✅ These are already excluded from git:
- `.env.local` and all `.env*` files
- `node_modules/`
- `.next/` build output
- `/.pw-browsers/` Playwright browsers

### Additional Security Steps

1. **Review .env.example**: Ensure no real credentials are in this file
2. **Enable Dependabot**: 
   - Go to **Settings** → **Security** → **Dependabot**
   - Enable **Dependabot alerts** and **security updates**
3. **Add SECURITY.md**: Create a security policy for vulnerability reporting
4. **Enable Secret Scanning**: Available for public repos and GitHub Advanced Security

## 🌐 Deployment to Vercel

After pushing to GitHub, deploy to Vercel:

### Quick Deploy

1. Go to [Vercel](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
5. Add **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_AGENT_WHATSAPP_FALLBACK=+919876543210
   NEXT_PUBLIC_APP_NAME=Gem Portal
   NEXT_PUBLIC_PAYMENT_AMOUNT_INR=799
   NEXT_PUBLIC_PAYMENT_QR_PATH=/upi-qr.svg
   ```
6. Click **"Deploy"**

### Post-Deployment

1. **Update Supabase Redirect URLs**:
   - Go to Supabase Dashboard → **Authentication** → **URL Configuration**
   - Add: `https://your-vercel-domain.vercel.app/auth/callback`
   - Add your custom domain when configured

2. **Configure Custom Domain** (optional):
   - In Vercel project settings → **Domains**
   - Add your custom domain
   - Update DNS records as instructed

## 📊 Recommended GitHub Actions Workflows

Create `.github/workflows/` directory with these workflows:

### 1. CI/CD Pipeline (`ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

### 2. E2E Tests (`e2e.yml`)

```yaml
name: E2E Tests

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:e2e:install
      - run: npm run test:e2e
```

## 🎯 Next Steps

1. **Push to GitHub** using one of the methods above
2. **Set up Supabase project** (see `docs/SETUP.md`)
3. **Deploy to Vercel** (see above)
4. **Configure environment variables** in Vercel
5. **Update Supabase redirect URLs**
6. **Replace placeholder content**:
   - `public/upi-qr.svg` with real UPI QR
   - Landing page copy
   - Privacy Policy and Terms of Service
7. **Test the deployed application**
8. **Share with team** and start using!

## 🆘 Troubleshooting

### "Permission denied (publickey)"

If you get SSH errors:
1. Use HTTPS URL instead: `https://github.com/YOUR-USERNAME/TenderSaathi.git`
2. Or set up SSH keys: [GitHub SSH Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

### "Repository not found"

- Verify the repository exists on GitHub
- Check the remote URL: `git remote -v`
- Ensure you have access to the repository

### "Failed to push some refs"

If someone else pushed changes:
```bash
git pull origin main --rebase
git push origin main
```

### Large Files Error

If you accidentally committed large files:
```bash
# Remove from git but keep locally
git rm --cached path/to/large/file
git commit -m "Remove large file"
git push origin main
```

## 📞 Support

- **GitHub Docs**: [docs.github.com](https://docs.github.com)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

**Ready to push? Run the commands from Option 1 above! 🚀**
