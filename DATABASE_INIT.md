# Pet Adoption Center System - Database Initialization

## Prerequisites

- MySQL 8.0+ installed and running
- MySQL client or MySQL Workbench

## Database Setup

Run the following SQL commands to create and initialize the database:

```sql
-- Create Database
CREATE DATABASE IF NOT EXISTS pet_adoption_center;
USE pet_adoption_center;

-- =============================================
-- 1. PET TABLE
-- Stores information about pets available for adoption
-- =============================================
CREATE TABLE Pet (
    Pet_ID INT AUTO_INCREMENT PRIMARY KEY,
    Pet_Name VARCHAR(50) NOT NULL,
    Species VARCHAR(30) NOT NULL,
    Breed VARCHAR(50),
    Age VARCHAR(20),
    Gender ENUM('Male', 'Female') NOT NULL,
    Color VARCHAR(50),
    Date_Arrived DATE NOT NULL,
    Vaccination_Status ENUM('Up-to-date', 'Overdue', 'Incomplete', 'None') DEFAULT 'None',
    Spayed_Neutered ENUM('Yes', 'No') DEFAULT 'No',
    Temperament VARCHAR(100),
    Special_Needs TEXT,
    Photo_URL VARCHAR(255),
    Status ENUM('Available', 'Adopted', 'Reserved', 'Medical Hold') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- 2. ADOPTER TABLE
-- Stores adopter profiles and login credentials
-- =============================================
CREATE TABLE Adopter (
    Adopter_ID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password_Hash VARCHAR(255) NOT NULL,
    Full_Name VARCHAR(100) NOT NULL,
    Contact_No VARCHAR(15),
    Address VARCHAR(200),
    Housing_Type ENUM('House', 'Apartment', 'Condo', 'Farm'),
    Has_Other_Pets ENUM('Yes', 'No') DEFAULT 'No',
    Has_Children ENUM('Yes', 'No') DEFAULT 'No',
    Experience_Level ENUM('First-time', 'Experienced') DEFAULT 'First-time',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- 3. ADOPTION TABLE
-- Records adoption applications and transactions
-- =============================================
CREATE TABLE Adoption (
    Adoption_ID INT AUTO_INCREMENT PRIMARY KEY,
    Pet_ID INT NOT NULL,
    Adopter_ID INT NOT NULL,
    Application_Date DATE NOT NULL,
    Approval_Status ENUM('Pending', 'Approved', 'Denied') DEFAULT 'Pending',
    Adoption_Date DATE,
    Adoption_Fee DECIMAL(10,2),
    Contract_Signed ENUM('Yes', 'No') DEFAULT 'No',
    Status ENUM('Applied', 'Completed', 'Returned', 'Cancelled') DEFAULT 'Applied',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Pet_ID) REFERENCES Pet(Pet_ID) ON DELETE CASCADE,
    FOREIGN KEY (Adopter_ID) REFERENCES Adopter(Adopter_ID) ON DELETE CASCADE
);

-- =============================================
-- 4. VETERINARY_VISIT TABLE
-- Tracks veterinary visits and health checkups for pets
-- =============================================
CREATE TABLE Veterinary_Visit (
    Visit_ID INT AUTO_INCREMENT PRIMARY KEY,
    Pet_ID INT NOT NULL,
    Visit_Date DATE NOT NULL,
    Veterinarian_Name VARCHAR(100),
    Visit_Type ENUM('Checkup', 'Vaccination', 'Surgery', 'Treatment', 'Emergency') NOT NULL,
    Weight DECIMAL(5,2),
    Temperature DECIMAL(4,2),
    Diagnosis TEXT,
    General_Notes TEXT,
    Procedure_Cost DECIMAL(10,2),
    Next_Visit_Date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Pet_ID) REFERENCES Pet(Pet_ID) ON DELETE CASCADE
);

-- =============================================
-- 5. VACCINATION TABLE
-- Tracks all vaccinations administered to pets
-- =============================================
CREATE TABLE Vaccination (
    Vaccination_ID INT AUTO_INCREMENT PRIMARY KEY,
    Visit_ID INT NOT NULL,
    Vaccine_Name VARCHAR(100) NOT NULL,
    Date_Administered DATE NOT NULL,
    Administered_By VARCHAR(100),
    Manufacturer VARCHAR(50),
    Next_Due_Date DATE,
    Site VARCHAR(50),
    Reaction TEXT,
    Status ENUM('Completed', 'Scheduled', 'Overdue') DEFAULT 'Completed',
    Cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Visit_ID) REFERENCES Veterinary_Visit(Visit_ID) ON DELETE CASCADE
);

-- =============================================
-- 6. FAVORITE TABLE
-- Tracks pets that adopters have saved/favorited
-- =============================================
CREATE TABLE Favorite (
    Favorite_ID INT AUTO_INCREMENT PRIMARY KEY,
    Adopter_ID INT NOT NULL,
    Pet_ID INT NOT NULL,
    Date_Added DATETIME DEFAULT CURRENT_TIMESTAMP,
    Notes TEXT,
    FOREIGN KEY (Adopter_ID) REFERENCES Adopter(Adopter_ID) ON DELETE CASCADE,
    FOREIGN KEY (Pet_ID) REFERENCES Pet(Pet_ID) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (Adopter_ID, Pet_ID)
);

-- =============================================
-- 7. ADMIN TABLE
-- Stores admin users for system management
-- =============================================
CREATE TABLE Admin (
    Admin_ID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password_Hash VARCHAR(255) NOT NULL,
    Full_Name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_pet_status ON Pet(Status);
CREATE INDEX idx_pet_species ON Pet(Species);
CREATE INDEX idx_adoption_status ON Adoption(Approval_Status);
CREATE INDEX idx_adoption_pet ON Adoption(Pet_ID);
CREATE INDEX idx_adoption_adopter ON Adoption(Adopter_ID);
CREATE INDEX idx_vet_visit_pet ON Veterinary_Visit(Pet_ID);
CREATE INDEX idx_vaccination_visit ON Vaccination(Visit_ID);
CREATE INDEX idx_favorite_adopter ON Favorite(Adopter_ID);
CREATE INDEX idx_favorite_pet ON Favorite(Pet_ID);
CREATE INDEX idx_admin_email ON Admin(Email);

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Sample Pets
INSERT INTO Pet (Pet_Name, Species, Breed, Age, Gender, Color, Date_Arrived, Vaccination_Status, Spayed_Neutered, Temperament, Special_Needs, Photo_URL, Status) VALUES
('Buddy', 'Dog', 'Golden Retriever', '3 years', 'Male', 'Golden', '2025-01-15', 'Up-to-date', 'Yes', 'Friendly, Playful', NULL, 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', 'Available'),
('Luna', 'Cat', 'Persian', '2 years', 'Female', 'White', '2025-02-20', 'Up-to-date', 'Yes', 'Calm, Affectionate', NULL, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', 'Available'),
('Max', 'Dog', 'German Shepherd', '4 years', 'Male', 'Black and Tan', '2025-01-10', 'Up-to-date', 'Yes', 'Loyal, Protective', NULL, 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400', 'Available'),
('Whiskers', 'Cat', 'Tabby', '1 year', 'Male', 'Orange Tabby', '2025-03-01', 'Incomplete', 'No', 'Playful, Curious', NULL, 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400', 'Available'),
('Bella', 'Dog', 'Labrador', '2 years', 'Female', 'Chocolate', '2025-02-10', 'Up-to-date', 'Yes', 'Gentle, Good with kids', NULL, 'https://images.unsplash.com/photo-1579168765467-3b235f938439?w=400', 'Reserved'),
('Mittens', 'Cat', 'Siamese', '3 years', 'Female', 'Cream and Brown', '2025-01-25', 'Up-to-date', 'Yes', 'Vocal, Social', NULL, 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400', 'Available'),
('Rocky', 'Dog', 'Bulldog', '5 years', 'Male', 'Brindle', '2025-02-28', 'Overdue', 'Yes', 'Calm, Stubborn', 'Requires special diet', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', 'Medical Hold'),
('Shadow', 'Cat', 'Black Shorthair', '4 years', 'Male', 'Black', '2025-03-05', 'Up-to-date', 'Yes', 'Independent, Mysterious', NULL, 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400', 'Available'),
('Daisy', 'Dog', 'Beagle', '1 year', 'Female', 'Tricolor', '2025-03-10', 'Incomplete', 'No', 'Energetic, Friendly', NULL, 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400', 'Available'),
('Oliver', 'Cat', 'Maine Coon', '2 years', 'Male', 'Brown Tabby', '2025-02-15', 'Up-to-date', 'Yes', 'Gentle Giant, Playful', NULL, 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400', 'Available');

-- Sample Adopters (password is 'password123' hashed with bcrypt)
INSERT INTO Adopter (Email, Password_Hash, Full_Name, Contact_No, Address, Housing_Type, Has_Other_Pets, Has_Children, Experience_Level) VALUES
('john.doe@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'John Doe', '09171234567', '123 Main St, Manila', 'House', 'No', 'Yes', 'Experienced'),
('jane.smith@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'Jane Smith', '09181234567', '456 Oak Ave, Quezon City', 'Apartment', 'Yes', 'No', 'First-time'),
('mike.wilson@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'Mike Wilson', '09191234567', '789 Pine Rd, Makati', 'Condo', 'No', 'No', 'Experienced');

-- Sample Adoptions
INSERT INTO Adoption (Pet_ID, Adopter_ID, Application_Date, Approval_Status, Adoption_Date, Adoption_Fee, Contract_Signed, Status) VALUES
(5, 1, '2025-03-15', 'Approved', NULL, 2500.00, 'No', 'Applied'),
(2, 2, '2025-03-10', 'Pending', NULL, 1500.00, 'No', 'Applied');

-- Sample Veterinary Visits
INSERT INTO Veterinary_Visit (Pet_ID, Visit_Date, Veterinarian_Name, Visit_Type, Weight, Temperature, Diagnosis, General_Notes, Procedure_Cost, Next_Visit_Date) VALUES
(1, '2025-01-20', 'Dr. Santos', 'Checkup', 28.50, 38.50, 'Healthy', 'Regular checkup, all vitals normal', 500.00, '2025-04-20'),
(1, '2025-02-15', 'Dr. Santos', 'Vaccination', 29.00, 38.30, NULL, 'Annual vaccination administered', 1200.00, '2026-02-15'),
(2, '2025-02-25', 'Dr. Reyes', 'Checkup', 4.20, 38.80, 'Healthy', 'Good condition', 500.00, '2025-05-25'),
(3, '2025-01-15', 'Dr. Santos', 'Checkup', 32.00, 38.60, 'Healthy', 'Strong and active', 500.00, '2025-04-15'),
(7, '2025-03-01', 'Dr. Cruz', 'Treatment', 25.00, 39.20, 'Mild skin allergy', 'Prescribed medication, special diet recommended', 1500.00, '2025-03-15');

-- Sample Vaccinations
INSERT INTO Vaccination (Visit_ID, Vaccine_Name, Date_Administered, Administered_By, Manufacturer, Next_Due_Date, Site, Reaction, Status, Cost) VALUES
(2, 'Rabies', '2025-02-15', 'Dr. Santos', 'Zoetis', '2026-02-15', 'Left shoulder', NULL, 'Completed', 600.00),
(2, 'DHPP', '2025-02-15', 'Dr. Santos', 'Nobivac', '2026-02-15', 'Right hip', NULL, 'Completed', 600.00),
(3, 'FVRCP', '2025-02-25', 'Dr. Reyes', 'Purevax', '2026-02-25', 'Left shoulder', NULL, 'Completed', 500.00),
(3, 'Rabies', '2025-02-25', 'Dr. Reyes', 'Zoetis', '2026-02-25', 'Right hip', NULL, 'Completed', 500.00);

-- Sample Favorites (with Notes)
INSERT INTO Favorite (Adopter_ID, Pet_ID, Notes) VALUES
(1, 1, 'Perfect for our backyard, kids will love him'),
(1, 3, 'Great guard dog potential'),
(2, 6, 'Love the vocal personality'),
(3, 4, 'Reminds me of my childhood cat'),
(3, 8, NULL);

-- Sample Admin (password is 'admin123' hashed with bcrypt)
INSERT INTO Admin (Email, Password_Hash, Full_Name) VALUES
('admin@petadopt.com', '$2b$10$ykNAFRVUuJvT3X8pwFdD4uVAqNOTzFcJ2x9wUs06RCslNWT028QnG', 'System Admin');
```

## Quick Setup Commands

```bash
# Login to MySQL
mysql -u root -p

# Run the initialization script
source /path/to/init.sql

# Or copy-paste the SQL above directly into MySQL client
```

## Connection Configuration

For the application to connect, use these default settings:

| Setting | Value |
|---------|-------|
| Host | localhost |
| Port | 3306 |
| Database | pet_adoption_center |
| User | root (or your MySQL user) |
| Password | your_mysql_password |

## Verify Installation

```sql
USE pet_adoption_center;
SHOW TABLES;

-- Expected output:
-- +------------------------------+
-- | Tables_in_pet_adoption_center|
-- +------------------------------+
-- | Admin                        |
-- | Adopter                      |
-- | Adoption                     |
-- | Favorite                     |
-- | Pet                          |
-- | Vaccination                  |
-- | Veterinary_Visit             |
-- +------------------------------+
```
