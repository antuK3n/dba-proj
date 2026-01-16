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
CREATE DATABASE IF NOT EXISTS pet_adoption_center;
USE pet_adoption_center;

-- 1. PET TABLE
CREATE TABLE Pet (
    Pet_ID INT AUTO_INCREMENT PRIMARY KEY,
    Pet_Name VARCHAR(50) NOT NULL,
    Species VARCHAR(30) NOT NULL,
    Breed VARCHAR(50) NOT NULL,
    Age VARCHAR(20) NOT NULL,
    Gender ENUM('Male', 'Female') NOT NULL,
    Color VARCHAR(50) NOT NULL,
    Date_Arrived DATE NOT NULL,
    Spayed_Neutered ENUM('Yes', 'No') NOT NULL,
    Temperament VARCHAR(100) NOT NULL,
    Special_Needs TEXT,
    Photo_URL VARCHAR(255),
    Status ENUM('Available', 'Adopted', 'Reserved', 'Medical Hold') NOT NULL
);

-- 2. ADOPTER TABLE
CREATE TABLE Adopter (
    Adopter_ID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password_Hash VARCHAR(255) NOT NULL,
    Full_Name VARCHAR(100) NOT NULL,
    Contact_No VARCHAR(15) NOT NULL,
    Address VARCHAR(200) NOT NULL,
    Housing_Type ENUM('House', 'Apartment', 'Condo', 'Farm') NOT NULL,
    Has_Other_Pets ENUM('Yes', 'No') NOT NULL,
    Has_Children ENUM('Yes', 'No') NOT NULL,
    Experience_Level ENUM('First-time', 'Experienced') NOT NULL
);

-- 3. ADOPTION TABLE
CREATE TABLE Adoption (
    Adoption_ID INT AUTO_INCREMENT PRIMARY KEY,
    Pet_ID INT NOT NULL,
    Adopter_ID INT NOT NULL,
    Adoption_Date DATE,
    Adoption_Fee DECIMAL(10,2),
    Contract_Signed ENUM('Yes', 'No') NOT NULL,
    Status ENUM('Completed', 'Pending', 'Returned', 'Cancelled') NOT NULL,
    FOREIGN KEY (Pet_ID) REFERENCES Pet(Pet_ID) ON DELETE CASCADE,
    FOREIGN KEY (Adopter_ID) REFERENCES Adopter(Adopter_ID) ON DELETE CASCADE
);

-- 4. VETERINARY_VISIT TABLE
CREATE TABLE Veterinary_Visit (
    Visit_ID INT AUTO_INCREMENT PRIMARY KEY,
    Pet_ID INT NOT NULL,
    Visit_Date DATE NOT NULL,
    Veterinarian_Name VARCHAR(100) NOT NULL,
    Visit_Type ENUM('Checkup', 'Vaccination', 'Surgery', 'Treatment', 'Emergency') NOT NULL,
    Weight DECIMAL(5,2),
    Temperature DECIMAL(4,2),
    Diagnosis TEXT,
    General_Notes TEXT,
    Procedure_Cost DECIMAL(10,2) NOT NULL,
    Next_Visit_Date DATE,
    FOREIGN KEY (Pet_ID) REFERENCES Pet(Pet_ID) ON DELETE CASCADE
);

-- 5. VACCINATION TABLE
CREATE TABLE Vaccination (
    Vaccination_ID INT AUTO_INCREMENT PRIMARY KEY,
    Visit_ID INT NOT NULL,
    Vaccine_Name VARCHAR(100) NOT NULL,
    Date_Administered DATE,
    Administered_By VARCHAR(100),
    Manufacturer VARCHAR(50),
    Next_Due_Date DATE,
    Site VARCHAR(50),
    Reaction TEXT,
    Status ENUM('Completed', 'Scheduled', 'Overdue') NOT NULL,
    Cost DECIMAL(10,2),
    FOREIGN KEY (Visit_ID) REFERENCES Veterinary_Visit(Visit_ID) ON DELETE CASCADE
);

-- 6. FAVORITE TABLE
CREATE TABLE Favorite (
    Favorite_ID INT AUTO_INCREMENT PRIMARY KEY,
    Adopter_ID INT NOT NULL,
    Pet_ID INT NOT NULL,
    Date_Added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Notes TEXT,
    FOREIGN KEY (Adopter_ID) REFERENCES Adopter(Adopter_ID) ON DELETE CASCADE,
    FOREIGN KEY (Pet_ID) REFERENCES Pet(Pet_ID) ON DELETE CASCADE,
    UNIQUE KEY Unique_Favorite (Adopter_ID, Pet_ID)
);

-- 7. ADMIN TABLE
CREATE TABLE Admin (
    Admin_ID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password_Hash VARCHAR(255) NOT NULL,
    Full_Name VARCHAR(100) NOT NULL
);

-- Sample Pets
INSERT INTO Pet (Pet_Name, Species, Breed, Age, Gender, Color, Date_Arrived, Spayed_Neutered, Temperament, Special_Needs, Photo_URL, Status) VALUES
('Buddy', 'Dog', 'Golden Retriever', '3 years', 'Male', 'Golden', '2025-01-15', 'Yes', 'Friendly', NULL, 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', 'Available'),
('Luna', 'Cat', 'Persian', '2 years', 'Female', 'White', '2025-02-20', 'Yes', 'Calm', NULL, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', 'Available'),
('Max', 'Dog', 'German Shepherd', '4 years', 'Male', 'Black and Tan', '2025-01-10', 'Yes', 'Loyal', NULL, 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400', 'Available'),
('Whiskers', 'Cat', 'Tabby', '1 year', 'Male', 'Orange Tabby', '2025-03-01', 'No', 'Playful', NULL, 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400', 'Available'),
('Bella', 'Dog', 'Labrador', '2 years', 'Female', 'Chocolate', '2025-02-10', 'Yes', 'Gentle', NULL, 'https://images.unsplash.com/photo-1579168765467-3b235f938439?w=400', 'Reserved'),
('Mittens', 'Cat', 'Siamese', '3 years', 'Female', 'Cream and Brown', '2025-01-25', 'Yes', 'Social', NULL, 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400', 'Available'),
('Rocky', 'Dog', 'Bulldog', '5 years', 'Male', 'Brindle', '2025-02-28', 'Yes', 'Calm', 'Requires special diet', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', 'Medical Hold'),
('Shadow', 'Cat', 'Black Shorthair', '4 years', 'Male', 'Black', '2025-03-05', 'Yes', 'Independent', NULL, 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400', 'Available'),
('Daisy', 'Dog', 'Beagle', '1 year', 'Female', 'Tricolor', '2025-03-10', 'No', 'Energetic', NULL, 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400', 'Available'),
('Oliver', 'Cat', 'Maine Coon', '2 years', 'Male', 'Brown Tabby', '2025-02-15', 'Yes', 'Gentle', NULL, 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400', 'Available'),
('Charlie', 'Dog', 'Aspen Mix', '6 years', 'Male', 'Brown', '2024-12-01', 'Yes', 'Quiet', NULL, NULL, 'Adopted');

-- Sample Adopters (password is 'password123' hashed with bcrypt)
INSERT INTO Adopter (Email, Password_Hash, Full_Name, Contact_No, Address, Housing_Type, Has_Other_Pets, Has_Children, Experience_Level) VALUES
('john.doe@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'John Doe', '09171234567', '123 Main St, Manila', 'House', 'No', 'Yes', 'Experienced'),
('jane.smith@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'Jane Smith', '09181234567', '456 Oak Ave, Quezon City', 'Apartment', 'Yes', 'No', 'First-time'),
('mike.wilson@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'Mike Wilson', '09191234567', '789 Pine Rd, Makati', 'Condo', 'No', 'No', 'Experienced'),
('anna.farmer@email.com', '$2b$10$SRsniIBkNI02OB6IQmAOgukME.UO2vHFbZib4OlmRgRPa3dn9nWHe', 'Anna Farmer', '09201234567', 'Sitio Greenfields, Batangas', 'Farm', 'Yes', 'Yes', 'Experienced');

-- Sample Adoptions
INSERT INTO Adoption (Pet_ID, Adopter_ID, Adoption_Date, Adoption_Fee, Contract_Signed, Status) VALUES
(5, 1, NULL, 2500.00, 'No', 'Pending'),
(2, 2, NULL, 1500.00, 'No', 'Pending'),
(11, 4, '2025-03-01', 3000.00, 'Yes', 'Completed'),
(7, 2, '2025-02-10', 2000.00, 'Yes', 'Returned'),
(9, 3, NULL, NULL, 'No', 'Cancelled');

-- Sample Veterinary Visits
INSERT INTO Veterinary_Visit (Pet_ID, Visit_Date, Veterinarian_Name, Visit_Type, Weight, Temperature, Diagnosis, General_Notes, Procedure_Cost, Next_Visit_Date) VALUES
(1, '2025-01-20', 'Dr. Santos', 'Checkup', 28.50, 38.50, 'Healthy', 'Routine checkup', 500.00, '2025-04-20'),
(1, '2025-02-15', 'Dr. Santos', 'Vaccination', 29.00, 38.30, 'Healthy', 'Annual vaccination', 1200.00, '2026-02-15'),
(2, '2025-02-25', 'Dr. Reyes', 'Checkup', 4.20, 38.80, 'Healthy', 'Stable condition', 500.00, '2025-05-25'),
(3, '2025-01-15', 'Dr. Santos', 'Checkup', 32.00, 38.60, 'Healthy', 'Active and alert', 500.00, '2025-04-15'),
(7, '2025-03-01', 'Dr. Cruz', 'Treatment', 25.00, 39.20, 'Skin allergy', 'Medication prescribed', 1500.00, '2025-03-15'),
(6, '2025-03-05', 'Dr. Lim', 'Surgery', 4.80, 38.90, 'Dental disease', 'Dental surgery successful', 4500.00, '2025-04-05'),
(10, '2025-03-12', 'Dr. Cruz', 'Emergency', 6.20, 39.80, 'High fever', 'Emergency care provided', 3000.00, NULL);

-- Sample Vaccinations
INSERT INTO Vaccination (Visit_ID, Vaccine_Name, Date_Administered, Administered_By, Manufacturer, Next_Due_Date, Site, Reaction, Status, Cost) VALUES
(2, 'Rabies', '2025-02-15', 'Dr. Santos', 'Zoetis', '2026-02-15', 'Left shoulder', NULL, 'Completed', 600.00),
(2, 'DHPP', '2025-02-15', 'Dr. Santos', 'Nobivac', '2026-02-15', 'Right hip', NULL, 'Completed', 600.00),
(3, 'FVRCP', '2025-02-25', 'Dr. Reyes', 'Purevax', '2026-02-25', 'Left shoulder', NULL, 'Completed', 500.00),
(3, 'Rabies', '2025-02-25', 'Dr. Reyes', 'Zoetis', '2026-02-25', 'Right hip', NULL, 'Completed', 500.00),
(6, 'Rabies', NULL, NULL, NULL, '2025-04-01', NULL, NULL, 'Scheduled', NULL),
(7, 'FVRCP', NULL, NULL, NULL, '2025-02-01', NULL, NULL, 'Overdue', NULL);

-- Sample Favorites
INSERT INTO Favorite (Adopter_ID, Pet_ID, Notes) VALUES
(1, 1, 'Good with children'),
(1, 3, 'Protective nature'),
(2, 6, 'Very social'),
(3, 4, 'Playful personality'),
(3, 8, NULL);

-- Sample Admin (password is 'admin123' hashed with bcrypt)
INSERT INTO Admin (Email, Password_Hash, Full_Name) VALUES
('admin@petadopt.com', '$2b$10$ykNAFRVUuJvT3X8pwFdD4uVAqNOTzFcJ2x9wUs06RCslNWT028QnG', 'System Admin');

-- =============================================
-- TRIGGERS (Auto-sync statuses between tables)
-- =============================================

-- TRIGGER 1: Validate pet availability before creating adoption
DELIMITER //
CREATE TRIGGER trg_adoption_before_insert_validate
BEFORE INSERT ON Adoption
FOR EACH ROW
BEGIN
    DECLARE pet_status VARCHAR(20);

    SELECT Status INTO pet_status FROM Pet WHERE Pet_ID = NEW.Pet_ID;

    IF pet_status != 'Available' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Pet is not available for adoption';
    END IF;
END //
DELIMITER ;

-- TRIGGER 2: Auto-set pet to 'Reserved' when new adoption is created
DELIMITER //
CREATE TRIGGER trg_adoption_after_insert
AFTER INSERT ON Adoption
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Pending' THEN
        UPDATE Pet SET Status = 'Reserved' WHERE Pet_ID = NEW.Pet_ID;
    ELSEIF NEW.Status = 'Completed' THEN
        UPDATE Pet SET Status = 'Adopted' WHERE Pet_ID = NEW.Pet_ID;
    END IF;
END //
DELIMITER ;

-- TRIGGER 3: Auto-set adoption date and contract when status becomes 'Completed'
DELIMITER //
CREATE TRIGGER trg_adoption_before_update
BEFORE UPDATE ON Adoption
FOR EACH ROW
BEGIN
    -- Auto-set adoption date when status changes to Completed
    IF NEW.Status = 'Completed' AND OLD.Status != 'Completed' THEN
        IF NEW.Adoption_Date IS NULL THEN
            SET NEW.Adoption_Date = CURDATE();
        END IF;
        SET NEW.Contract_Signed = 'Yes';
    END IF;
END //
DELIMITER ;

-- TRIGGER 4: Sync pet status when adoption status changes
DELIMITER //
CREATE TRIGGER trg_adoption_after_update
AFTER UPDATE ON Adoption
FOR EACH ROW
BEGIN
    -- Only act if status actually changed
    IF OLD.Status != NEW.Status THEN
        CASE NEW.Status
            WHEN 'Pending' THEN
                UPDATE Pet SET Status = 'Reserved' WHERE Pet_ID = NEW.Pet_ID;
            WHEN 'Completed' THEN
                UPDATE Pet SET Status = 'Adopted' WHERE Pet_ID = NEW.Pet_ID;
            WHEN 'Cancelled' THEN
                UPDATE Pet SET Status = 'Available' WHERE Pet_ID = NEW.Pet_ID;
            WHEN 'Returned' THEN
                UPDATE Pet SET Status = 'Available' WHERE Pet_ID = NEW.Pet_ID;
        END CASE;
    END IF;
END //
DELIMITER ;

-- TRIGGER 5: Set pet back to 'Available' when adoption is deleted
DELIMITER //
CREATE TRIGGER trg_adoption_after_delete
AFTER DELETE ON Adoption
FOR EACH ROW
BEGIN
    -- Only set to Available if no other completed adoption exists for this pet
    IF NOT EXISTS (
        SELECT 1 FROM Adoption
        WHERE Pet_ID = OLD.Pet_ID AND Status = 'Completed'
    ) THEN
        UPDATE Pet SET Status = 'Available' WHERE Pet_ID = OLD.Pet_ID;
    END IF;
END //
DELIMITER ;

-- TRIGGER 6: Remove favorites when pet is adopted
DELIMITER //
CREATE TRIGGER trg_pet_after_update_cleanup_favorites
AFTER UPDATE ON Pet
FOR EACH ROW
BEGIN
    -- Remove from favorites when pet is adopted
    IF NEW.Status = 'Adopted' AND OLD.Status != 'Adopted' THEN
        DELETE FROM Favorite WHERE Pet_ID = NEW.Pet_ID;
    END IF;
END //
DELIMITER ;

-- =============================================
-- SCHEDULED EVENT (Auto-update overdue vaccinations)
-- =============================================

-- Enable event scheduler (run this once on your MySQL server)
-- SET GLOBAL event_scheduler = ON;

-- Event to auto-update vaccination status to 'Overdue' daily
DELIMITER //
CREATE EVENT IF NOT EXISTS evt_update_overdue_vaccinations
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 1 HOUR)
DO
BEGIN
    UPDATE Vaccination
    SET Status = 'Overdue'
    WHERE Status = 'Scheduled'
      AND Next_Due_Date < CURDATE();
END //
DELIMITER ;

-- =============================================
-- INDEXES (Performance optimization)
-- =============================================
CREATE INDEX idx_pet_status ON Pet(Status);
CREATE INDEX idx_pet_species ON Pet(Species);
CREATE INDEX idx_adoption_status ON Adoption(Status);
CREATE INDEX idx_adoption_pet ON Adoption(Pet_ID);
CREATE INDEX idx_adoption_adopter ON Adoption(Adopter_ID);
CREATE INDEX idx_vaccination_status ON Vaccination(Status);
CREATE INDEX idx_vaccination_next_due ON Vaccination(Next_Due_Date);
CREATE INDEX idx_favorite_adopter ON Favorite(Adopter_ID);
CREATE INDEX idx_favorite_pet ON Favorite(Pet_ID);
CREATE INDEX idx_vet_visit_pet ON Veterinary_Visit(Pet_ID);
```

## Triggers Summary

| Trigger Name | Event | Purpose |
|--------------|-------|---------|
| `trg_adoption_before_insert_validate` | BEFORE INSERT on Adoption | Prevents adoption if pet is not available |
| `trg_adoption_after_insert` | AFTER INSERT on Adoption | Sets pet to 'Reserved' or 'Adopted' |
| `trg_adoption_before_update` | BEFORE UPDATE on Adoption | Auto-fills Adoption_Date and Contract_Signed |
| `trg_adoption_after_update` | AFTER UPDATE on Adoption | Syncs Pet.Status with Adoption.Status |
| `trg_adoption_after_delete` | AFTER DELETE on Adoption | Sets pet back to 'Available' |
| `trg_pet_after_update_cleanup_favorites` | AFTER UPDATE on Pet | Removes favorites when pet is adopted |
| `evt_update_overdue_vaccinations` | Daily scheduled event | Marks vaccinations as 'Overdue' |

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
