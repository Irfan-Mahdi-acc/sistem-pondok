# Deployment Guide for VPS

Follow these steps to deploy your latest changes to the VPS.

## Prerequisites
- SSH access to your VPS.
- Git installed on the VPS.
- Node.js and npm/yarn/pnpm installed on the VPS.
- Database (PostgreSQL) running and accessible.

## 1. Push Changes to Git
On your local machine, commit and push your changes:
```bash
git add .
git commit -m "Fix image upload for VPS"
git push origin main
```

## 2. Connect to VPS
SSH into your server:
```bash
ssh user@your-vps-ip
```

## 3. Update Codebase
Navigate to your project directory and pull the latest changes:
```bash
cd /path/to/your/project
git pull origin main
```

## 4. Install Dependencies
Ensure all new dependencies are installed:
```bash
npm install
# or if using yarn: yarn install
# or if using pnpm: pnpm install
```

## 5. Database Migration
Apply any database schema changes (if any):
```bash
npx prisma migrate deploy
```

## 6. Build Application
Build the Next.js application for production:
```bash
npm run build
```

## 7. Restart Application
Restart the application to apply changes.
If you are using **PM2**:
```bash
pm2 restart web
# Replace 'web' with your actual PM2 process name if different.
# You can check running processes with: pm2 list
```

If you are using **Systemd**:
```bash
sudo systemctl restart web
```

## 8. Verify Deployment
- Visit your website.
- Try uploading an image to verify the fix.
- Check logs if there are issues:
  - PM2: `pm2 logs web`
  - Systemd: `journalctl -u web -f`

## Troubleshooting: Git Authentication
If `git pull` asks for a username/password, it means your VPS is not authenticated with GitHub.

### Option A: Use SSH Keys (Recommended)
1.  **Generate a key on VPS**:
    ```bash
    ssh-keygen -t ed25519 -C "your_email@example.com"
    # Press Enter for all prompts (default file, no passphrase)
    ```
2.  **View the public key**:
    ```bash
    cat ~/.ssh/id_ed25519.pub
    ```
3.  **Add to GitHub**:
    - Copy the output (starts with `ssh-ed25519 ...`).
    - Go to GitHub -> Settings -> SSH and GPG keys -> New SSH key.
    - Paste the key and save.
4.  **Test connection**:
    ```bash
    ssh -T git@github.com
    # Type 'yes' if asked to continue connecting.
    ```
5.  **Switch remote to SSH** (if currently using HTTPS):
    ```bash
    git remote set-url origin git@github.com:username/repo-name.git
    ```

### Option B: Personal Access Token (PAT)
1.  Go to GitHub -> Settings -> Developer settings -> Personal access tokens -> Tokens (classic).
2.  Generate new token (select `repo` scope).
3.  When `git pull` asks for password, paste this token (it won't show on screen).
