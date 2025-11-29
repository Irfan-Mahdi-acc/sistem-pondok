#!/bin/bash

# 1. Install PostgreSQL
echo "Installing PostgreSQL..."
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# 2. Start & Enable Service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 3. Create User and Database
# Ganti 'password_db_baru' dengan password yang Anda inginkan!
DB_NAME="sistem_pondok"
DB_USER="pondok_user"
DB_PASS="password_db_baru"

echo "Creating database user and database..."
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

echo "PostgreSQL installed!"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: $DB_PASS"
echo "Connection String: postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
