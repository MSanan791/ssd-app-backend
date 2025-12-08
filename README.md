# SSD Data Collector - Backend API

The RESTful API server for the SSD Data Collection system. It handles authentication, patient data management, and the complex atomic upload of recording sessions (audio files + metadata) using PostgreSQL transactions and AWS S3.

## 🏗️ Architecture

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL (with Sequelize ORM)
* **Object Storage:** AWS S3 (via `aws-sdk` v2 and `multer-s3`)
* **Authentication:** JWT (JSON Web Tokens)

## 🚀 Prerequisites

* [Node.js](https://nodejs.org/) installed.
* [PostgreSQL](https://www.postgresql.org/) database running locally or remotely.
* An active **AWS S3 Bucket** with IAM credentials.

## 🛠️ Installation

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

## ⚙️ Environment Configuration

Create a `.env` file in the root directory. **Ensure there are no trailing spaces after values.**

```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_NAME=ssd_db
DB_HOST=localhost

# Security
JWT_SECRET=ssd_super_secret_key_2025

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
AWS_REGION=your_region (e.g., us-east-1)
```
🏃‍♂️ Running the Server
Run Database Migrations: (Ensure your Sequelize CLI command is configured in package.json or run via npx)

Bash
```
npx sequelize-cli db:migrate
```
Start the Server:

```Bash
node server.js
```
The server will start on http://localhost:3000 (or the defined PORT).

🔌 API Endpoints

Authentication
POST /api/auth/login - Authenticate Therapist and receive JWT.

Patients
GET /api/patients - Retrieve list of patients (Requires Auth).

POST /api/patients - Create a new patient record (Requires Auth).

Sessions (The Core Logic)
POST /api/sessions/finalize - Atomic Upload Endpoint.

Accepts multipart/form-data.

Receives JSON metadata (annotations, patientId) and multiple audio_files.

Behavior: Uploads files to S3 and writes DB records within a single transaction. If any part fails, the entire operation is rolled back to ensure data integrity.

📂 File Structure
Plaintext

```backend/
├── config/             # DB and Auth configuration
├── controllers/        # Route logic (Auth, Patient, Session)
├── middleware/         # Auth verification (JWT)
├── models/             # Sequelize definitions (User, Patient, Session, Recording)
├── routes/             # API Route definitions
└── server.js           # Entry point
```
🔒 Security Note
This project uses a centralized auth configuration to prevent secret leakage.

Ensure .env is included in your .gitignore and never committed to version control.

